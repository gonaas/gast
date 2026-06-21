import { useState } from "react";
import { useStore } from "@/shared/store";
import {
  CollapsibleSection,
  Button,
  IconButton,
  Input,
  ContextMenu,
  IconClose,
  IconAdd,
  IconTag,
  IconDelete,
} from "@/shared/ui";

export function TagSection({ query }: { query: string }) {
  const tags = useStore((s) => s.tags);
  const createTag = useStore((s) => s.createTag);
  const deleteTag = useStore((s) => s.deleteTag);

  const [tagging, setTagging] = useState(false);
  const [tagName, setTagName] = useState("");

  const shownTags = tags.filter((t) => !query || t.toLowerCase().includes(query));

  async function doTag() {
    await createTag(tagName, "", "");
    setTagName("");
    setTagging(false);
  }

  return (
    <CollapsibleSection
      title="Tags"
      count={tags.length}
      defaultOpen={false}
      action={
        <IconButton title="Crear tag en HEAD" onClick={() => setTagging((v) => !v)}>
          {tagging ? <IconClose /> : <IconAdd />}
        </IconButton>
      }
    >
      {tagging && (
        <div className="branch-form">
          <Input
            autoFocus
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doTag()}
            placeholder="v1.0.0"
          />
          <Button variant="primary" size="sm" onClick={doTag}>
            Crear
          </Button>
        </div>
      )}
      <ul>
        {shownTags.map((t) => (
          <ContextMenu key={t}>
            <ContextMenu.Trigger>
              <li className="branch tag-row" title="Clic derecho para opciones">
                <span className="branch-icon">
                  <IconTag />
                </span>
                <span className="branch-name">{t}</span>
              </li>
            </ContextMenu.Trigger>
            <ContextMenu.Content>
              <ContextMenu.Item variant="danger" onSelect={() => deleteTag(t)}>
                <IconDelete /> Borrar tag
              </ContextMenu.Item>
            </ContextMenu.Content>
          </ContextMenu>
        ))}
      </ul>
    </CollapsibleSection>
  );
}
