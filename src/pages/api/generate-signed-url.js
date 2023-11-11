import { Storage } from "@google-cloud/storage";
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method === "POST") {
    const storage = new Storage();
    const bucketName = "biohack-demonstration-videos";

    // Generate a random file name
    const originalFilename = req.body.filename;
    const fileExtension = originalFilename.split('.').pop();
    const randomFilename = `${uuidv4()}.${fileExtension}`;

    const options = {
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000,
      // contentType: "video/*",
    };

    try {
      const [url] = await storage
        .bucket(bucketName)
        .file(randomFilename)
        .getSignedUrl(options);

      res.status(200).json({ url });
    } catch (error) {
      console.error("Error details:", error.message, error.stack);
      res.status(500).json({ error: "Error creating signed URL", details: error.message });
    }
  } else {
    res.status(405).send("Method Not Allowed");
  }
}
