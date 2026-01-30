import { NextRequest, NextResponse } from "next/server";
import { getWish, updateWishStatus, deleteWish } from "@/lib/airtable";
import { WishStatus, Person } from "@/types/wish";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const wish = await getWish(id);

    if (!wish) {
      return NextResponse.json({ error: "Wish not found" }, { status: 404 });
    }

    return NextResponse.json(wish);
  } catch (error) {
    console.error("Error fetching wish:", error);
    return NextResponse.json(
      { error: "Failed to fetch wish" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { status, objectionComment, objectedBy } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    const validStatuses: WishStatus[] = [
      "waiting",
      "objected",
      "approved",
      "purchased",
      "discarded",
      "archived",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const wish = await updateWishStatus(id, status as WishStatus, {
      objectionComment,
      objectedBy: objectedBy as Person | undefined,
    });

    return NextResponse.json(wish);
  } catch (error) {
    console.error("Error updating wish:", error);
    return NextResponse.json(
      { error: "Failed to update wish" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteWish(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting wish:", error);
    return NextResponse.json(
      { error: "Failed to delete wish" },
      { status: 500 }
    );
  }
}
