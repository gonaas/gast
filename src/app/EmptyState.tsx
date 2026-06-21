import { Button } from "@/shared/ui";
import { RecentRepos } from "@/features/repo/components/RecentRepos";

export function EmptyState({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="empty">
      <p>Abre un repositorio Git para empezar.</p>
      <Button variant="primary" onClick={onOpen}>
        Abrir repositorio…
      </Button>
      <RecentRepos />
    </div>
  );
}
