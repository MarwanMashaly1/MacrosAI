// NOTE: Make sure to add your stage name (like /v1) to the end of the URL.
const API_BASE_URL =
  "https://dy1b52s4ef.execute-api.us-east-1.amazonaws.com/v1";

/**
 * Gets a secure pre-signed URL from your backend for uploading an image.
 * @param fileName The name of the file to be uploaded.
 * @param fileType The MIME type of the file (e.g., 'image/jpeg').
 */
export async function getPresignedUrl(fileName: string, fileType: string) {
  const response = await fetch(`${API_BASE_URL}/get-upload-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fileName, fileType }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Failed to get pre-signed URL:", errorBody);
    throw new Error("Failed to get pre-signed URL.");
  }

  const { uploadUrl } = await response.json();
  return uploadUrl;
}

/**
 * Uploads a file to S3 using a pre-signed URL.
 * @param presignedUrl The URL obtained from your backend.
 * @param fileUri The local URI of the file to upload (from the image picker).
 */
export async function uploadImageToS3(presignedUrl: string, fileUri: string) {
  const file = await fetch(fileUri);
  const blob = await file.blob();

  const uploadResponse = await fetch(presignedUrl, {
    method: "PUT",
    body: blob,
    headers: {
      "Content-Type": blob.type,
    },
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    console.error("S3 Upload Error:", errorText);
    throw new Error("Failed to upload image to S3.");
  }

  // The public URL of the image is the pre-signed URL without the query string.
  const imageUrl = presignedUrl.split("?")[0];
  return imageUrl;
}
