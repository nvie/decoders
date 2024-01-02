#!/bin/sh
set -eu

BIN=$(dirname "$0")

list_decoders() {
    node bin/exported-decoders.js | sort -u
}

echo "==> Checking documentation" >&2
list_decoders | while read dec; do
  if grep -qEe "'$dec': {" docs/_data.py; then
      continue
  elif grep -qEe "'aliases':.*'$dec'" docs/_data.py; then
      continue
  else
      echo "❌ $dec" >&2
      echo "" >&2
      echo "It looks like decoder \"$dec\" is not documented yet!" >&2
      echo "To fix this, please add an entry for it in" >&2
      echo "" >&2
      echo "    docs/_data.py" >&2
      echo "" >&2
      exit 3
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
