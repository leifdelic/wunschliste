import { NextResponse } from "next/server";
import { getArchivedWishes } from "@/lib/airtable";

export async function GET() {
  try {
    const wishes = await getArchivedWishes();
    return NextResponse.json(wishes);
  } catch (error) {
    console.error("Error fetching archived wishes:", error);
    return NextResponse.json(
      { error: "Failed to fetch archived wishes" },
      { status: 500 }
    );
  }
}
