#!/bin/sh
set -eu

# NOTE: This is a poor man's way to check for all exports in src/index.js, but
# for the time being this will suffice. The more robust solution would be to
# parse the file and discover all exports that way, but for this this works.
# Until it no longer works.
list_exports() {
    cat "$1"                                      \
    | grep -vEe '^//'                             \
    | tr -d ';{},\n'                              \
    | sed -Ee 's/\/\*.*\*\///g' -e "s/'[^']*'//g" \
    | tr ' ' '\n'                                 \
    | grep -Ee .                                  \
    | grep -vEe '(export|from|type)'              \
    | sort -u
}

list_decoders() {
    cat src/index.js                 \
        | grep -vEe '^//'            \
        | tr -d '\n'                 \
        | sed -Ee 's/\/\*.*\*\///g'  \
        | tr ';' '\n'                \
        | grep -vEe 'export type'    \
        | grep -Ee '/core'           \
        | sed -Ee "s/'[^']*'//g"     \
        | tr '{}, ' '\n'             \
        | grep -Ee .                 \
        | grep -vEe '(export|from)'  \
        | sort -u
}

tmp1="$(mktemp)"
tmp2="$(mktemp)"

list_exports src/index.js > "$tmp1"
list_exports src/types/index.d.ts > "$tmp2"

if ! diff -q "$tmp1" "$tmp2"; then
    echo "There were differences between the exports exported from src/index.js and src/types/index.d.ts." >&2
    echo "Did you forget to update TypeScript definitions?" >&2
    exit 2
fi

list_decoders | while read dec; do
  if ! grep -qF "$dec" README.md; then
      # Cut the either family some slack
      if [ "$dec" = 'either6' -o  "$dec" = 'either7' -o  "$dec" = 'either8' ]; then
          continue
      fi

      echo "Decoder \"$dec\" is not documented in README?" >&2
      exit 3
  fi
done
