import { NextResponse } from "next/server";
import { fetchOpenRouterModels } from "@/lib/fetch-models";

export async function GET() {
  try {
    const models = await fetchOpenRouterModels();
    return NextResponse.json(models);
  } catch (error) {
    console.error("Error in models API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch models" },
      { status: 500 }
    );
  }
}
