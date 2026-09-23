/**
 * Uploads a file directly from the browser to Cloudinary, bypassing our own
 * backend entirely for the file bytes. Necessary because Vercel's Node.js
 * serverless functions cap request bodies at ~4.5MB, which silently breaks
 * any video upload (and larger images) if routed through our own API.
 */
export async function uploadDirectToCloudinary(
  file: File,
  resourceType: "image" | "video"
): Promise<string> {
  const sigRes = await fetch("/api/cloudinary-signature", { credentials: "include" });
  if (!sigRes.ok) {
    let message = "Could not get upload authorization";
    try {
      const body = await sigRes.json();
      if (body?.message) message = body.message;
    } catch {
      // not JSON, keep generic message
    }
    throw new Error(message);
  }
  const { signature, timestamp, apiKey, cloudName, folder } = await sigRes.json();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", folder);

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!uploadRes.ok) {
    let message = "Upload to Cloudinary failed";
    try {
      const err = await uploadRes.json();
      if (err?.error?.message) message = err.error.message;
    } catch {
      // not JSON, keep generic message
    }
    throw new Error(message);
  }

  const data = await uploadRes.json();
  return data.secure_url as string;
}
