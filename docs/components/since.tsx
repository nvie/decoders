function parseVersion(v: string): [number, number, number] {
  const [base] = v.split('-');
  const parts = base.split('.').map(Number);
  return [parts[0], parts[1] ?? 0, parts[2] ?? 0];
}

function isReleased(sinceVersion: string, currentVersion: string): boolean {
  const [curMajor, curMinor, curPatch] = parseVersion(currentVersion);
  const [sinMajor, sinMinor, sinPatch] = parseVersion(sinceVersion);
  const isPreRelease = currentVersion.includes('-');

  // Current is a pre-release: only "released" if current base version is
  // strictly greater than the since version
  if (isPreRelease) {
    if (curMajor !== sinMajor) return curMajor > sinMajor;
    if (curMinor !== sinMinor) return curMinor > sinMinor;
    return curPatch > sinPatch;
  }

  // Current is a stable release: released if current >= since
  if (curMajor !== sinMajor) return curMajor > sinMajor;
  if (curMinor !== sinMinor) return curMinor > sinMinor;
  return curPatch >= sinPatch;
}

export function Since({ version }: { version: string }) {
  const [major, minor, patch] = parseVersion(version);
  const shortVersion = patch === 0 ? `${major}.${minor}` : `${major}.${minor}.${patch}`;
  const released = isReleased(version, process.env.WIP_DECODERS_VERSION!);

  if (!released) {
    return (
      <p>
        Will be available once <strong>{shortVersion}</strong> is released.
      </p>
    );
  }

  return (
    <p>
      Available since{' '}
      <a
        href={`https://github.com/nvie/decoders/releases/tag/v${major}.${minor}.${patch}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <strong>{shortVersion}</strong>
      </a>
      .
    </p>
  );
}
