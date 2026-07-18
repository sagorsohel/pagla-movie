"use server"

export async function uploadImageAction(formData: FormData) {
  const file = formData.get("image") as File
  if (!file || file.size === 0) {
    return { error: "No file selected" }
  }

  const apiKey = process.env.IMAGE_SERVER_API_KEY || "espn_img_sec_d8f2b7a9e14c3b52a6d708e1f5c3b9a0"
  const serverUrl = `${process.env.IMAGE_SERVER_URL || "https://image.streamespn.org"}/api/upload`

  try {
    const uploadFormData = new FormData()
    uploadFormData.append("image", file)

    const response = await fetch(serverUrl, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
      },
      body: uploadFormData,
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Upload server error: ${response.statusText} (${errText})`)
    }

    const data = await response.json()
    if (data.success) {
      return { success: true, url: data.url }
    } else {
      return { error: data.error || "Failed to upload image" }
    }
  } catch (error: any) {
    console.error("Image upload failed:", error)
    return { error: error.message || "Failed to upload image to hosting server." }
  }
}
