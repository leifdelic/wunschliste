import Airtable from "airtable";
import {
  Wish,
  WishStatus,
  Person,
  WishImage,
  shouldAutoApprove,
  shouldAutoArchive,
} from "@/types/wish";

// Initialize Airtable
const airtable = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
});

const base = airtable.base(process.env.AIRTABLE_BASE_ID || "");
const table = base(process.env.AIRTABLE_TABLE_NAME || "Wishes");

// Map Airtable record to our Wish type
function mapRecordToWish(record: Airtable.Record<Airtable.FieldSet>): Wish {
  const fields = record.fields;

  // Map Airtable attachment format to our WishImage format
  type AirtableImage = {
    id: string;
    url: string;
    filename: string;
    thumbnails?: {
      small?: { url: string };
      large?: { url: string };
    };
  };

  const rawImages = (fields.Images as unknown as AirtableImage[]) || [];
  const images: WishImage[] = rawImages.map((img) => ({
    id: img.id,
    url: img.url,
    filename: img.filename,
    thumbnails: img.thumbnails,
  }));

  return {
    id: record.id,
    title: fields.Title as string,
    price: fields.Price as number,
    link: fields.Link as string | undefined,
    images: images.length > 0 ? images : undefined,
    status: (fields.Status as WishStatus) || "waiting",
    createdBy: fields.Created_By as Person,
    createdAt: fields.Created_At as string,
    objectionComment: fields.Objection_Comment as string | undefined,
    objectedBy: fields.Objected_By as Person | undefined,
    approvedAt: fields.Approved_At as string | undefined,
    archivedAt: fields.Archived_At as string | undefined,
  };
}

// Process auto-status updates for a wish
async function processAutoStatus(wish: Wish): Promise<Wish> {
  if (shouldAutoApprove(wish)) {
    const today = new Date().toISOString().split("T")[0];
    await table.update(wish.id, {
      Status: "approved",
      Approved_At: today,
    });
    return { ...wish, status: "approved", approvedAt: today };
  }

  if (shouldAutoArchive(wish)) {
    const today = new Date().toISOString().split("T")[0];
    await table.update(wish.id, {
      Status: "archived",
      Archived_At: today,
    });
    return { ...wish, status: "archived", archivedAt: today };
  }

  return wish;
}

// Get all active wishes (not archived, purchased, or discarded)
export async function getActiveWishes(): Promise<Wish[]> {
  const records = await table
    .select({
      filterByFormula:
        "AND(NOT({Status} = 'archived'), NOT({Status} = 'purchased'), NOT({Status} = 'discarded'))",
      sort: [{ field: "Created_At", direction: "desc" }],
    })
    .all();

  const wishes = records.map(mapRecordToWish);

  // Process auto-status updates
  const processedWishes = await Promise.all(
    wishes.map((wish) => processAutoStatus(wish))
  );

  // Filter out any that were just archived
  return processedWishes.filter(
    (wish) =>
      wish.status !== "archived" &&
      wish.status !== "purchased" &&
      wish.status !== "discarded"
  );
}

// Get archived wishes
export async function getArchivedWishes(): Promise<Wish[]> {
  const records = await table
    .select({
      filterByFormula:
        "OR({Status} = 'archived', {Status} = 'purchased', {Status} = 'discarded')",
      sort: [{ field: "Archived_At", direction: "desc" }],
    })
    .all();

  return records.map(mapRecordToWish);
}

// Get a single wish by ID
export async function getWish(id: string): Promise<Wish | null> {
  try {
    const record = await table.find(id);
    const wish = mapRecordToWish(record);
    return await processAutoStatus(wish);
  } catch {
    return null;
  }
}

// Create a new wish
export async function createWish(data: {
  title: string;
  price: number;
  link?: string;
  createdBy: Person;
  imageUrls?: Array<{ url: string }>;
}): Promise<Wish> {
  const today = new Date().toISOString().split("T")[0];

  const fields: Airtable.FieldSet = {
    Title: data.title,
    Price: data.price,
    Status: "waiting",
    Created_By: data.createdBy,
    Created_At: today,
  };

  if (data.link) {
    fields.Link = data.link;
  }

  if (data.imageUrls && data.imageUrls.length > 0) {
    // Airtable accepts array of objects with url property for attachments
    fields.Images = data.imageUrls as unknown as Airtable.FieldSet[keyof Airtable.FieldSet];
  }

  const record = await table.create(fields);
  return mapRecordToWish(record);
}

// Update wish status
export async function updateWishStatus(
  id: string,
  status: WishStatus,
  additionalFields?: {
    objectionComment?: string;
    objectedBy?: Person;
  }
): Promise<Wish> {
  const today = new Date().toISOString().split("T")[0];

  const fields: Airtable.FieldSet = { Status: status };

  if (status === "approved") {
    fields.Approved_At = today;
  } else if (status === "archived") {
    fields.Archived_At = today;
  } else if (status === "objected" && additionalFields) {
    if (additionalFields.objectionComment) {
      fields.Objection_Comment = additionalFields.objectionComment;
    }
    if (additionalFields.objectedBy) {
      fields.Objected_By = additionalFields.objectedBy;
    }
  }

  const record = await table.update(id, fields);
  return mapRecordToWish(record);
}

// Delete a wish (optional, for cleanup)
export async function deleteWish(id: string): Promise<void> {
  await table.destroy(id);
}
