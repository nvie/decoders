#!/bin/sh
set -eu

BIN=$(dirname "$0")

list_decoders() {
    node bin/exported-decoders.js | sort -u
}

DOCS_API="docs/content/docs/api"

echo "==> Checking documentation" >&2
list_decoders | while read dec; do
  # Check for a ## heading (handling trailing _ escaping, e.g. null_ -> null\_)
  heading=$(echo "$dec" | sed 's/_$/\\_/')
  if grep -rqE "^## ${heading}" "$DOCS_API"; then
      continue
  # Check for a <DecoderSig name="..."> or an alias name in aliases prop
  # Matches both name="dec" (JSX attr) and name: 'dec' (JS object in aliases)
  elif grep -rqE "name=\"$dec\"|name: '$dec'" "$DOCS_API"; then
      continue
  else
      echo "❌ $dec" >&2
      echo "" >&2
      echo "It looks like decoder \"$dec\" is not documented yet!" >&2
      echo "To fix this, please add an entry for it in" >&2
      echo "" >&2
      echo "    $DOCS_API/" >&2
      echo "" >&2
      exit 3
  fi
done

echo "==> Checking decoder redirects" >&2
list_decoders | while read dec; do
  lower=$(echo "$dec" | tr '[:upper:]' '[:lower:]')
  if ! grep -q "\"$lower\":" "docs/lib/decoder-redirects.ts"; then
    echo "❌ $dec" >&2
    echo "Decoder \"$dec\" has no redirect entry!" >&2
    echo "Run 'npm run format' to regenerate." >&2
    exit 5
  fi
done

echo "==> Checking type inference tests" >&2
list_decoders | while read dec; do
  if ! grep -qF "$dec" "test-d/inference.test-d.ts"; then
      echo "❌ $dec" >&2
      echo "There is no type inference test for Decoder \"$dec\" in test-d/inference.test-d.ts yet." >&2
      exit 4
  fi
done
