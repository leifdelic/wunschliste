import { put, del } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const uploadedUrls: Array<{ url: string }> = [];

    for (const file of files) {
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const filename = `wishes/${timestamp}-${randomString}-${file.name}`;

      // Upload to Vercel Blob
      const blob = await put(filename, file, {
        access: "public",
      });

      uploadedUrls.push({ url: blob.url });
    }

    return NextResponse.json({ urls: uploadedUrls });
  } catch (error) {
    console.error("Error uploading files:", error);
    return NextResponse.json(
      { error: "Failed to upload files" },
      { status: 500 }
    );
  }
}

// Delete images from Vercel Blob after Airtable has downloaded them
export async function DELETE(request: NextRequest) {
  try {
    const { urls } = await request.json();

    if (!urls || !Array.isArray(urls)) {
      return NextResponse.json({ error: "No URLs provided" }, { status: 400 });
    }

    // Delete each blob
    for (const url of urls) {
      try {
        await del(url);
      } catch (e) {
        console.error("Error deleting blob:", url, e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting files:", error);
    return NextResponse.json(
      { error: "Failed to delete files" },
      { status: 500 }
    );
  }
}
