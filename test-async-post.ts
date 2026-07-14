import { NextResponse } from 'next/server';

export const POST = async (req: Request) => {
  const cloned = req.clone();
  let paymentTx = null;
  try {
     const body = await cloned.json();
     if (body && body.payment_tx) paymentTx = body.payment_tx;
  } catch (e) {}

  // ... extract and modify header
}
