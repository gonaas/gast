import type { GraphRow } from "@/shared/types";

export const ROW_H = 44;
const LANE_W = 16;
const DOT_R = 4;

const COLORS = ["#2f6feb", "#1a7f37", "#bf8700", "#cf222e", "#8250df", "#1b7c83", "#bc4c00"];
const color = (col: number) => COLORS[col % COLORS.length];

const cx = (col: number) => col * LANE_W + LANE_W / 2;
const cy = (row: number) => row * ROW_H + ROW_H / 2;

export function graphWidth(rows: GraphRow[]): number {
  const max = rows.reduce((m, r) => Math.max(m, r.width), 1);
  return max * LANE_W;
}

export function CommitGraph({ rows }: { rows: GraphRow[] }) {
  const width = graphWidth(rows);
  const height = rows.length * ROW_H;

  return (
    <svg className="graph-svg" width={width} height={height}>
      {rows.map((row, r) => (
        <g key={row.hash}>
          {row.linksDown.map(([top, bottom], i) => (
            <path
              key={`l${i}`}
              d={linkPath(top, r, bottom, r + 1)}
              stroke={color(bottom)}
              fill="none"
              strokeWidth={1.5}
            />
          ))}
          {row.merges.map((m) => (
            <path
              key={`m${m}`}
              d={`M ${cx(m)} ${cy(r)} L ${cx(row.col)} ${cy(r)}`}
              stroke={color(m)}
              fill="none"
              strokeWidth={1.5}
            />
          ))}
          <circle cx={cx(row.col)} cy={cy(r)} r={DOT_R} fill={color(row.col)} />
        </g>
      ))}
    </svg>
  );
}

function linkPath(topCol: number, topRow: number, bottomCol: number, bottomRow: number): string {
  const x1 = cx(topCol);
  const y1 = cy(topRow);
  const x2 = cx(bottomCol);
  const y2 = cy(bottomRow);
  if (x1 === x2) return `M ${x1} ${y1} L ${x2} ${y2}`;
  const my = (y1 + y2) / 2;
  return `M ${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`;
}
