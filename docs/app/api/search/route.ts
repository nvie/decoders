import { source } from "@/lib/source";
import { DECODER_SEARCH_ENTRIES } from "@/lib/decoder-search-entries";
import type { DecoderSearchEntry } from "@/lib/decoder-search-entries";
import { createFromSource } from "fumadocs-core/search/server";
import type { SortedResult } from "fumadocs-core/search";

const server = createFromSource(source);

/**
 * Lower is better: exact name match, then prefix match, then substring match.
 * Aliases rank below primary names with the same match quality.
 */
function rank(entry: DecoderSearchEntry, query: string): number | null {
  const name = entry.name.toLowerCase();
  const pos = name.indexOf(query);
  if (pos === -1) return null;
  const quality = name === query ? 0 : pos === 0 ? 1 : 2;
  return quality * 2 + (entry.aliasOf ? 1 : 0);
}

function searchDecoders(query: string): SortedResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return DECODER_SEARCH_ENTRIES.flatMap((entry) => {
    const r = rank(entry, q);
    return r === null ? [] : [{ entry, r }];
  })
    .sort((a, b) => a.r - b.r || a.entry.name.localeCompare(b.entry.name))
    .map(({ entry }) => ({
      id: `decoder:${entry.name}`,
      type: "page",
      url: entry.url,
      content: entry.aliasOf
        ? `\`${entry.name}\` (alias of \`${entry.aliasOf}\`)`
        : `\`${entry.name}\``,
      breadcrumbs: ["Docs", "API Reference", entry.page],
    }));
}

export async function GET(request: Request): Promise<Response> {
  const query = new URL(request.url).searchParams.get("query") ?? "";
  if (!query) return Response.json([]);
  return Response.json([...searchDecoders(query), ...(await server.search(query))]);
}
