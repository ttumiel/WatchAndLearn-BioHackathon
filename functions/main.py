import base64
import functools
import os
import tempfile
from io import BytesIO
from urllib.parse import unquote, urlparse

import functions_framework
from google.cloud import storage
from moviepy.editor import VideoFileClip
from openai import OpenAI
from PIL import Image

from cache import CACHED_RESPONSE

BUCKET_NAME = "biohack-demonstration-videos"

client = OpenAI()


def request_wrapper(fn):
    @functools.wraps(fn)
    @functions_framework.http
    def thunk(request):
        # Set CORS headers for the preflight request
        if request.method == "OPTIONS":
            # Allows GET requests from any origin with the Content-Type
            # header and caches preflight response for an 3600s
            headers = {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Max-Age": "3600",
            }

            return ("", 204, headers)

        headers = {"Access-Control-Allow-Origin": "*"}

        try:
            args = request.args
            if request.is_json:
                args = {**args, **request.get_json()}

            out = fn(**args)
        except Exception as e:
            import traceback
            print(traceback.format_exc())
            print(f"ERROR :: Function {fn.__name__} failed with", e)
            return (f"Error: {e}", 400, headers)

        return (out, 200, headers)

    return thunk


def get_filename_from_url(url):
    parsed_url = urlparse(url)
    return os.path.basename(unquote(parsed_url.path))


def download_blob(bucket_name, source_blob_name, destination_file_name):
    """Downloads a blob from the bucket."""
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(source_blob_name)

    blob.download_to_filename(destination_file_name)


def extract_data(filename, frameskip=10):
    video = VideoFileClip(filename)

    # Extract frames
    frames = []
    for i, frame in enumerate(video.iter_frames()):
        if i % frameskip == 0:
            frame_image = Image.fromarray(frame).resize((512, 512), Image.BICUBIC)
            im_file = BytesIO()
            frame_image.save(im_file, format="JPEG")
            im_bytes = im_file.getvalue()
            frames.append(base64.b64encode(im_bytes).decode("utf-8"))

    # Extract audio
    # audio = video.audio
    # audio_file = "extracted_audio.mp3"
    # audio.write_audiofile(audio_file)

    return frames


def transcribe(audio_filepath):
    transcript = client.audio.transcriptions.create(
        file=open(audio_filepath, "rb"),
        model="whisper-1",
        # prompt=prompt,
    )
    return transcript.text


def make_image_message(frame):
    return {
        "type": "image_url",
        "image_url": {
            "url": f"data:image/jpeg;base64,{frame}",
            "detail": "low",
        },
    }


@request_wrapper
def transcript_extraction(path: str):
    with tempfile.NamedTemporaryFile(suffix=".mp4") as temp_video:
        download_blob(BUCKET_NAME, get_filename_from_url(path), temp_video.name)
        return transcribe(temp_video.name)


@request_wrapper
def protocol_extraction(path: str, transcription: str, frameskip: int = 60):
    with tempfile.NamedTemporaryFile(suffix=".mp4") as temp_video:
        # download_blob(BUCKET_NAME, get_filename_from_url(path), temp_video.name)
        ### Extract data is slow af
        # frames = extract_data(temp_video.name, frameskip=int(frameskip))
        # # audio_transcription = transcribe(audiofile)

        # messages = [
        #     {
        #         "role": "user",
        #         "content": [
        #             {
        #                 "type": "text",
        #                 "text": "The following is the transcribed audio and video frames from a simple lab demonstration.",
        #             },
        #             {
        #                 "type": "text",
        #                 "text": f"Transcribed audio: {transcription}",
        #             },
        #             {
        #                 "type": "text",
        #                 "text": "These are frames from a simple demonstration.",
        #             },
        #             *map(make_image_message, frames),
        #             {
        #                 "type": "text",
        #                 "text": "Turn this demonstration into a full laboratory protocol, including title, materials, notes, setup and procedure. Format it properly. Where available, define plate type including number of wells, shape, color, manufacturer and catalog number, name the range of volumes to be pipetted, and specify which type of machine is used.",
        #             },
        #         ],
        #     },
        # ]

        # params = {
        #     "model": "gpt-4-vision-preview",
        #     "messages": messages,
        #     "max_tokens": 1000,
        # }

        # result = client.chat.completions.create(**params)
        # return result.choices[0].message.content
        return CACHED_RESPONSE


@request_wrapper
def opentrons_conversion(protocol: str):
    messages = [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": f"Take the following experimental protocol and turn it into opentrons code, wrapped in a code block:\n\n{protocol}",
                }
            ],
        },
    ]

    params = {
        "model": "gpt-4-vision-preview",
        "messages": messages,
        "max_tokens": 1000,
    }

    result = client.chat.completions.create(**params)
    return result.choices[0].message.content
