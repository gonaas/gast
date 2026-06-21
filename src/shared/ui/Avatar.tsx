const PALETTE = [
  "#2f6feb",
  "#1a7f37",
  "#bf8700",
  "#cf222e",
  "#8250df",
  "#1b7c83",
  "#bc4c00",
  "#6e7781",
];

function hash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface AvatarProps {
  name: string;
  seed?: string;
  size?: number;
  title?: string;
}

export function Avatar({ name, seed, size = 20, title }: AvatarProps) {
  const bg = PALETTE[hash(seed || name) % PALETTE.length];
  return (
    <span
      className="ui-avatar"
      title={title ?? name}
      style={{ width: size, height: size, background: bg, fontSize: size * 0.42 }}
    >
      {initials(name)}
    </span>
  );
}
