import { useStore } from "@/shared/store";
import { IconClose, IconAdd } from "@/shared/ui";

// Barra de pestañas de repositorios abiertos (estilo Fork): cada pestaña es un
// repo; click cambia de repo, "×" cierra, "+" abre otro.
export function TabBar({ onOpen }: { onOpen: () => void }) {
  const tabs = useStore((s) => s.tabs);
  const activeTab = useStore((s) => s.activeTab);
  const openRepo = useStore((s) => s.openRepo);
  const closeTab = useStore((s) => s.closeTab);

  if (tabs.length === 0) return null;

  return (
    <div className="tab-bar" data-tauri-drag-region>
      {tabs.map((t) => (
        <div
          key={t.path}
          className={t.path === activeTab ? "tab active" : "tab"}
          title={t.path}
          onClick={() => {
            if (t.path !== activeTab) openRepo(t.path);
          }}
        >
          <span className="tab-name">{t.name}</span>
          <button
            className="tab-close"
            title="Cerrar pestaña"
            onClick={(e) => {
              e.stopPropagation();
              closeTab(t.path);
            }}
          >
            <IconClose />
          </button>
        </div>
      ))}
      <button className="tab-add" title="Abrir repositorio" onClick={onOpen}>
        <IconAdd />
      </button>
    </div>
  );
}
