#!/bin/sh
set -e

# The output directory for the package build
ROOT="$(git rev-parse --show-toplevel)"
SRC="${ROOT}/src"
DIST="${ROOT}/dist"
DIST_TYPES="$DIST/ts"
DIST_CJS="$DIST/cjs"
DIST_ES="$DIST/es"

# Work from the project root, independently from where this script is run
cd "$ROOT"

clean() {
    rm -rf "$DIST"
}

build_code() {
    # Build CJS module output
    mkdir -p "$DIST_CJS"
    babel -d "$DIST_CJS" "$SRC" --ignore '**/__tests__/**'

    # Build ES module output
    mkdir -p "$DIST_ES"
    rollup \
        --failAfterWarnings \
        --config
}

copy_typescript_defs() {
    mkdir -p "$DIST_TYPES"
    find "$SRC" -iname '*.d.ts' -a '!' -iname '*-tests.d.ts' -exec cp -v '{}' "$DIST_TYPES" ';'
    # Remove the types directory if its empty
    rmdir "$DIST_TYPES" 2>/dev/null || true
}

copy_flow_defs() {
    flow-copy-source -v -i '**/__tests__/**' -i '**/types/**' "$SRC" "$DIST_CJS"
}

copy_metadata() {
    cp LICENSE README.md CHANGELOG.md "$DIST"
}

add_entrypoint() {
    jq ". + { \
        main: \"./cjs/index.js\", \
        module: \"./es/index.js\" \
    }"
}

add_types_entrypoint() {
    if [ -f "$DIST_TYPES/index.d.ts" ]; then
        jq '. + { types: "./ts/index.d.ts" }'
    else
        cat  # no-op, pass-thru
    fi
}

build_package_json() {
    cat package.json                | \
        jq 'del(.devDependencies)'  | \
        jq 'del(.files)'            | \
        jq 'del(.importSort)'       | \
        jq 'del(.jest)'             | \
        jq 'del(.scripts)'          | \
        add_types_entrypoint        | \
        add_entrypoint                \
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
