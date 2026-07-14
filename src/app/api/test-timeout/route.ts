export const maxDuration = 300;
export const dynamic = 'force-dynamic';

export async function GET(_req: Request) {
  const start = Date.now();
  await new Promise(r => setTimeout(r, 15000)); // wait 15 seconds
  return new Response(JSON.stringify({ time: Date.now() - start }), { status: 200 });
}
