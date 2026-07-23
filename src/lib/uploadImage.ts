// Client-side helper: gets a signed upload from our API, then uploads the file
// straight to Cloudinary so the file bytes never pass through our server.
export async function uploadImageToCloudinary(
  file: File,
  context: "review" | "product" = "review",
): Promise<string> {
  const signatureRes = await fetch("/api/uploads/signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ context }),
  });
  if (!signatureRes.ok) {
    throw new Error("Couldn't start the upload. Please sign in and try again.");
  }
  const { timestamp, signature, folder, apiKey, cloudName } = await signatureRes.json();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", folder);

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });
  if (!uploadRes.ok) {
    throw new Error("Image upload failed. Please try again.");
  }
  const data = await uploadRes.json();
  return data.secure_url as string;
}
