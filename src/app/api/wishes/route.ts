import { NextRequest, NextResponse } from "next/server";
import { getActiveWishes, createWish } from "@/lib/airtable";
import { Person } from "@/types/wish";

export async function GET() {
  try {
    const wishes = await getActiveWishes();
    return NextResponse.json(wishes);
  } catch (error) {
    console.error("Error fetching wishes:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { title, price, link, createdBy, imageUrls } = body;

    if (!title || !price || !createdBy) {
      return NextResponse.json(
        { error: "Title, price, and createdBy are required" },
        { status: 400 }
      );
    }

    const wish = await createWish({
      title,
      price: Number(price),
      link: link || undefined,
      createdBy: createdBy as Person,
      imageUrls: imageUrls || undefined,
    });

    return NextResponse.json(wish, { status: 201 });
  } catch (error) {
    console.error("Error creating wish:", error);
    return NextResponse.json(
      { error: "Failed to create wish" },
      { status: 500 }
    );
  }
}
