#!/bin/sh
#
# This script builds the contents of the NPM package into the dist/ folder. It
# does a few things:
#
# 1. Produces "CommonJS" output files (*.js), by running Babel on the src/ and
#    transpiling this to ES5 code.
#
# 2. Produces "ES modules" output files (*.mjs), by running Babel on the src/
#    but retaining the original module structure, and then renaming all *.js
#    files to *.mjs extension, and dynamically rewriting all import/expert
#    statements to include the extension.
#
# 3. Produces "Flow types" (*.js.flow), by copying the original source code to
#    those output files.
#
# 4. Produces "TypeScript definition types" (*.d.ts).
#
set -e

# The output directory for the package build
ROOT="$(git rev-parse --show-toplevel)"
SRC="${ROOT}/src"
DIST="${ROOT}/dist"

# Work from the project root, independently from where this script is run
cd "$ROOT"

clean() {
    rm -rf "$DIST"
}

build_cjs() {
    TMP=$(mktemp -d -t decoders-cjs)
    BABEL_ENV=commonjs babel -d "$TMP" "$SRC" --ignore '**/__tests__/**'
    rsync -aqv "$TMP/" "$DIST/"
}

build_esm() {
    TMP=$(mktemp -d -t decoders-esm)
    BABEL_ENV=esmodules babel -d "$TMP" "$SRC" --ignore '**/__tests__/**'
    find "$TMP" -iname "*.js" | while read f; do
      mv "$f" "${f%.js}.mjs"
    done
    sr -s "from '(.*)'" -r "from '\$1.mjs'" "$TMP"
    rsync -aqv "$TMP/" "$DIST/"
}

build_flow() {
    flow-copy-source -v -i '**/__tests__/**' -i '**/types/**' "$SRC" "$DIST"
}

build_typescript() {
    (cd "$SRC/types" && find . -iname '*.d.ts' -a '!' -iname '*-tests.d.ts' | xargs tar -cf - ) \
        | (cd "$DIST" && tar -xvf -)
}

build_misc() {
    cp LICENSE README.md CHANGELOG.md "$DIST"
}

add_types_entrypoint() {
    echo '"Package `decoders` requires TypeScript >= 4.1.0"' > "$DIST/NotSupportedTSVersion.d.ts"
    jq '. + { typesVersions: { ">=4.1.0": {"*": ["*"]}, "*": { "*": [ "NotSupportedTSVersion.d.ts" ] } } }'
}

build_package_json() {
    cat package.json                | \
        jq 'del(.devDependencies)'  | \
        jq 'del(.files)'            | \
        jq 'del(.importSort)'       | \
        jq 'del(.jest)'             | \
        jq 'del(.scripts)'          | \
        jq 'del(.type)'             | \
        add_types_entrypoint        | \
        sed -Ee 's,dist/,,g'          \
        > "$DIST/package.json"
    prettier --write "$DIST/package.json"
}

build() {
    clean
    build_cjs
    build_esm
    build_flow
    build_typescript
    build_misc
    build_package_json
}

./bin/bump.sh
build
