import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Box, Progress, Text, Center, Heading } from "@chakra-ui/react";
import { MdCloudUpload } from "react-icons/md";

import axios from "axios";

const VideoUpload = ({ onUploadComplete }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    // Take the first file if multiple files are dropped
    const file = acceptedFiles[0];
    setErrorMessage("");
    setVideoUrl(null);
    setIsUploading(true);
    try {
      const response = await axios.post("/api/generate-signed-url", {
        filename: file.name,
      });
      const { url } = response.data;

      await axios.put(url, file, {
        headers: {
          "Content-Type": file.type,
        },
        onUploadProgress: (progressEvent) => {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          setUploadProgress(progress);
        },
      });

      const uploadUrl = url.split("?")[0];
      setVideoUrl(uploadUrl);
      onUploadComplete(uploadUrl);
      console.log("Upload complete");
    } catch (error) {
      console.error("Error during upload:", error);
      setErrorMessage("Error uploading file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: "video/*",
    multiple: false,
  });

  return (
    <Box>
      {!videoUrl && (
        <>
          <Heading as="h2" size="lg" pb={2}>
            Upload a Lab Demonstration
          </Heading>
          <Box
            {...getRootProps()}
            p={4}
            border="2px dashed gray"
            borderRadius="md"
            height="200px"
            position="relative"
          >
            <input {...getInputProps()} />
            <Center flexDirection="column" height="100%">
              <MdCloudUpload size="50px" />
              <Text mt={2}>
                Drag 'n drop a video here, or click to select a video
              </Text>
            </Center>
            {isUploading && uploadProgress > 0 && (
              <Progress
                value={uploadProgress}
                position="absolute"
                bottom={0}
                left={0}
                width="100%"
              />
            )}
            {errorMessage && (
              <Text color="red.500" mt={2}>
                {errorMessage}
              </Text>
            )}
          </Box>
        </>
      )}

      {videoUrl && (
        <Box mt={4}>
          <video width="100%" controls>
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </Box>
      )}
    </Box>
  );
};

export default VideoUpload;
