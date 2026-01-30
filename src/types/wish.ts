export type WishStatus =
  | "waiting"
  | "objected"
  | "approved"
  | "purchased"
  | "discarded"
  | "archived";

export type Person = "Patrik" | "Julia";

export interface WishImage {
  id: string;
  url: string;
  filename: string;
  thumbnails?: {
    small?: { url: string };
    large?: { url: string };
  };
}

export interface Wish {
  id: string;
  title: string;
  price: number;
  link?: string;
  images?: WishImage[];
  status: WishStatus;
  createdBy: Person;
  createdAt: string;
  objectionComment?: string;
  objectedBy?: Person;
  approvedAt?: string;
  archivedAt?: string;
}

export interface WishFormData {
  title: string;
  price: number;
  link?: string;
  images?: File[];
  createdBy: Person;
}

// Helper function to calculate remaining days based on calendar days
export function getRemainingWaitDays(createdAt: string): number {
  const created = new Date(createdAt);
  const today = new Date();

  // Set both to midnight for pure day comparison
  created.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - created.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, 7 - diffDays);
}

export function getRemainingBuyDays(approvedAt: string): number {
  const approved = new Date(approvedAt);
  const today = new Date();

  // Set both to midnight for pure day comparison
  approved.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - approved.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, 7 - diffDays);
}

export function shouldAutoApprove(wish: Wish): boolean {
  if (wish.status !== "waiting") return false;
  return getRemainingWaitDays(wish.createdAt) === 0;
}

export function shouldAutoArchive(wish: Wish): boolean {
  if (wish.status !== "approved" || !wish.approvedAt) return false;
  return getRemainingBuyDays(wish.approvedAt) === 0;
}
