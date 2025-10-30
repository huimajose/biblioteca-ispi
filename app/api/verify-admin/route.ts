import { NextResponse } from "next/server";
import { verifyAdmin } from "@/db/crud/users.crud";

export async function POST(req: Request) {
  const { userId } = await req.json();
  const isAdmin = await verifyAdmin(userId);
  return NextResponse.json({ isAdmin });
}
