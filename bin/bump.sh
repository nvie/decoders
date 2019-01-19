#!/bin/sh
set -e

# The output directory for the package build
ROOT="$(git rev-parse --show-toplevel)"

cd "$ROOT"

# Read the version from the package.json file, prompts if this still is the
# intended version and allows it to be overwritten
VERSION="$(cat package.json | jq -r .version)"

echo "Current version: ${VERSION}"

read -p "New version? " NEW_VERSION
if [ -z "$NEW_VERSION" ]; then
    exit 0
else 
    # Write the new version to the top-level package.json
    mv package.json package.json.orig
    cat package.json.orig | jq ". + { \"version\": \"${NEW_VERSION}\" }" > package.json
    rm package.json.orig
fi
