import { getPerson } from "@/lib/tmdb/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id: idParam } = await context.params;
  const id = Number(idParam);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid person id" }, { status: 400 });
  }

  try {
    const person = await getPerson(id);
    return NextResponse.json({ id: person.id, name: person.name });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Person lookup failed";

    if (message.includes("TMDB_API_KEY")) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    if (message.includes("404")) {
      return NextResponse.json({ error: "Person not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Person lookup failed" }, { status: 502 });
  }
}
