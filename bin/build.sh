#!/bin/sh
set -e

# The output directory for the package build
ROOT="$(git rev-parse --show-toplevel)"
SRC="${ROOT}/src"
DIST="${ROOT}/dist"
DIST_TYPES="${ROOT}/dist/types"

# Work from the project root, independently from where this script is run
cd "$ROOT"

clean() {
    rm -rf "$DIST"
}

build_code() {
    babel -d "$DIST" "$SRC" --ignore '**/__tests__/**'
}

copy_typescript_defs() {
    mkdir -p "$DIST_TYPES"
    find "$SRC" -iname '*.d.ts' -a '!' -iname '*-tests.d.ts' -exec cp -v '{}' "$DIST_TYPES" ';'
}

copy_flow_defs() {
    flow-copy-source -v -i '**/__tests__/**' -i '**/types/**' "$SRC" "$DIST"
}

copy_metadata() {
    cp LICENSE README.md CHANGELOG.md "$DIST"
}

build_package_json() {
    cat package.json                | \
        jq 'del(.devDependencies)'  | \
        jq 'del(.files)'            | \
        jq 'del(.importSort)'       | \
        jq 'del(.jest)'             | \
        jq 'del(.scripts)'          | \
        jq '. + {
            types: "./types/index.d.ts",
            main: "./index.js"
        }'                            \
        > dist/package.json
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
