#!/bin/sh
set -e

# The output directory for the package build
ROOT="$(git rev-parse --show-toplevel)"
DIST="${ROOT}/dist"

# Work from the root folder, build the dist/ folder
cd "$ROOT"
yarn run test
./bin/build.sh

# Read the version from the package.json file, we don't need to re-enter it
VERSION="$(cat package.json | jq -r .version)"

cd "$DIST" && yarn publish --new-version "$VERSION" "$@"
