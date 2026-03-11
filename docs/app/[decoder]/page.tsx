import { DECODER_REDIRECTS } from '@/lib/decoder-redirects';
import { notFound, redirect } from 'next/navigation';

export default async function DecoderRedirectPage({
  params,
}: {
  params: Promise<{ decoder: string }>;
}) {
  const { decoder } = await params;
  const target = DECODER_REDIRECTS[decoder.toLowerCase()];
  if (!target) notFound();
  redirect(target);
}
