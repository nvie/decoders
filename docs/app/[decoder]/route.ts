import { DECODER_REDIRECTS } from '@/lib/decoder-redirects';
import { notFound } from 'next/navigation';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ decoder: string }> },
) {
  const { decoder } = await params;
  const target = DECODER_REDIRECTS[decoder.toLowerCase()];
  if (!target) notFound();
  return NextResponse.redirect(new URL(target, request.url), 302);
}
