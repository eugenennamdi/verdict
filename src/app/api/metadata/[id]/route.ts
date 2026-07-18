import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing report ID" }, { status: 400 });
    }

    // Standard ERC-721 Metadata JSON
    const metadata = {
      name: `Verdict Growth Readiness Attestation`,
      description: `Onchain attestation of growth readiness by Verdict for report ${id}.`,
      image: `https://tryverdict.xyz/logo-dark.png`,
      external_url: `https://tryverdict.xyz/report/${id}`
    };

    return NextResponse.json(metadata);
  } catch (error: any) {
    console.error("Error generating metadata:", error);
    return NextResponse.json(
      { error: "Failed to generate metadata" },
      { status: 500 }
    );
  }
}
