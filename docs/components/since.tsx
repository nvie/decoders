export function Since({ version }: { version: string }) {
  const [major, minor] = version.split('.').map(Number);
  return (
    <p>
      Available since{' '}
      <a
        href={`https://github.com/nvie/decoders/releases/tag/v${version}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <strong>
          {major}.{minor}
        </strong>
      </a>
      .
    </p>
  );
}
