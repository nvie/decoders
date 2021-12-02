#!/bin/sh
set -e

# The output directory for the package build
ROOT="$(git rev-parse --show-toplevel)"
SRC="${ROOT}/src"
DIST="${ROOT}/dist"

#
# NOTE: Okay, this is quite ugly. Ideally, we'd output to dist/typescript,
# dist/cjs, and dist/esm separately, but... Flow doesn't seem to be able to
# correctly look up (or respect) the entrypoint definitions in package.json
# somehow. If the source files aren't located at the dist root, Flow is unable
# to find imports using this syntax:
#
#   import { ... } from 'decoders/result';
#                                 ^^^^^^ These submodules won't work in Flow
#
# I don't want to sacrifice that API though, so we'll have no choice but to
# publish the CJS files to the dist root :(
#
DIST_CJS="$DIST"
DIST_ES="$DIST/_esm"
DIST_TYPES="$DIST/_typescript"

# Work from the project root, independently from where this script is run
cd "$ROOT"

clean() {
    rm -rf "$DIST"
}

build_code() {
    # Build CJS module output
    mkdir -p "$DIST_CJS"
    BABEL_ENV=commonjs babel -d "$DIST_CJS" "$SRC" --ignore '**/__tests__/**'

    # Build ES module output
    mkdir -p "$DIST_ES"
    BABEL_ENV=esmodules babel -d "$DIST_ES" "$SRC" --ignore '**/__tests__/**'
}

copy_typescript_defs() {
    mkdir -p "$DIST_TYPES"
    (cd "$SRC/types" && find . -iname '*.d.ts' -a '!' -iname '*-tests.d.ts' | xargs tar -cf - ) \
        | (cd "$DIST_TYPES" && tar -xvf -)
}

copy_flow_defs() {
    flow-copy-source -v -i '**/__tests__/**' -i '**/types/**' "$SRC" "$DIST_CJS"
    flow-copy-source -v -i '**/__tests__/**' -i '**/types/**' "$SRC" "$DIST_ES"
}

copy_metadata() {
    cp LICENSE README.md CHANGELOG.md "$DIST"
}

add_types_entrypoint() {
    jq '. + { types: "./_typescript" }'
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
    build_code
    copy_typescript_defs
    copy_flow_defs
    copy_metadata
    build_package_json
}

./bin/bump.sh
build
