import regVer from "../../../registry-version.json";

interface SmokeVersionStripProps {
  name: string;
}

export function SmokeVersionStrip({ name }: SmokeVersionStripProps) {
  const sha = regVer.libraryGitSha
    ? regVer.libraryGitSha.slice(0, 7)
    : "unknown";
  const version = regVer.libraryVersion ?? `sha:${sha}`;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
      <span>
        source:{" "}
        <code className="rounded bg-gray-100 px-1">@bangicode/{name}</code>
      </span>
      <span>
        version: <code className="rounded bg-gray-100 px-1">{version}</code>
      </span>
      <span>
        docs:{" "}
        <span className="text-gray-500">
          design.bangicode.ma/components/{name}
        </span>{" "}
        <span className="text-gray-300">(registry pending — IST-120)</span>
      </span>
    </div>
  );
}
