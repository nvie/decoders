#!/bin/sh
set -e

# The output directory for the package build
ROOT="$(git rev-parse --show-toplevel)"
DIST="${ROOT}/dist"

# Work from the root folder, build the dist/ folder
cd "$ROOT"

# Check we're on the main branch
if [ "$(git current-branch)" != "main" ]; then
    echo "Not on \"main\" branch." >&2
    exit 2
fi

# Update to latest version
git fetch

if [ "$(git sha main)" != "$(git sha origin/main)" ]; then
    echo "Not up to date with origin.  Please pull/push latest changes before publishing." >&2
    exit 3
fi

if git is-dirty; then
    echo "There are local changes.  Please commit those before publishing." >&2
    exit 4
fi

yarn run test
./bin/build.sh

# Read the version from the package.json file, we don't need to re-enter it
VERSION="$(cat package.json | jq -r .version)"
GITHUB_URL="$(cat package.json | jq -r .githubUrl)"

if [ -z "$GITHUB_URL" -o "$GITHUB_URL" = "null" ]; then
    echo 'Please specify `githubUrl` in package.json.' >&2
    exit 5
fi

if git is-dirty; then
    git commit -m "Bump to $VERSION" package.json
    git tag "v$VERSION"
    git push-current
    git push --tags
fi

read -p "OTP token? " OTP
if [ -z "$OTP" ]; then
    exit 2
fi

cd "$DIST" && yarn publish --new-version "$VERSION" --otp "$OTP" "$@"

# Open browser tab to create new release
open "${GITHUB_URL}/blob/v${VERSION}/CHANGELOG.md"
open "${GITHUB_URL}/releases/new?tag=v${VERSION}&title=v${VERSION}&body=TODO%3A%20Copy%20release%20notes%20from%20CHANGELOG."
