import { revalidatePath, revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { parseBody } from 'next-sanity/webhook';

/**
 * Dipanggil webhook Sanity setiap kali konten di-publish.
 * Header signature diverifikasi dengan SANITY_REVALIDATE_SECRET.
 */
export async function POST(req: NextRequest) {
  try {
    const secret = process.env.SANITY_REVALIDATE_SECRET;
    if (!secret) return new NextResponse('Missing SANITY_REVALIDATE_SECRET', { status: 500 });

    const { isValidSignature, body } = await parseBody<{ _type?: string }>(req, secret);
    if (!isValidSignature) return new NextResponse('Invalid signature', { status: 401 });

    revalidateTag('content');
    revalidatePath('/');
    return NextResponse.json({ revalidated: true, type: body?._type ?? null, now: Date.now() });
  } catch (err) {
    console.error(err);
    return new NextResponse('Revalidate failed', { status: 500 });
  }
}
