import { NextResponse } from "next/server";
import { fetchOrders, postOrder } from "@/lib/api";

export async function GET() {
  try {
    const data = await fetchOrders();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = await postOrder(body);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
