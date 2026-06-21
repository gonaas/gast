import { useStore } from "@/shared/store";
import { IconButton, IconClose } from "@/shared/ui";

export function RecentRepos() {
  const recentRepos = useStore((s) => s.recentRepos);
  const openRepo = useStore((s) => s.openRepo);
  const forgetRecentRepo = useStore((s) => s.forgetRecentRepo);

  if (recentRepos.length === 0) return null;

  return (
    <ul className="recent-repos">
      {recentRepos.map((r) => (
        <li key={r.path} className="recent-repo">
          <button className="recent-open" onClick={() => openRepo(r.path)} title={r.path}>
            <span className="recent-name">{r.name}</span>
            <span className="recent-path">{r.path}</span>
          </button>
          <IconButton
            variant="danger"
            title="Quitar de recientes"
            onClick={() => forgetRecentRepo(r.path)}
          >
            <IconClose />
          </IconButton>
        </li>
      ))}
    </ul>
  );
}
