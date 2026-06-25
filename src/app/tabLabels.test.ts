import { describe, it, expect } from "vitest";
import { disambiguateTabs } from "./tabLabels";
import type { OpenTab } from "@/shared/types";

const tab = (path: string, name: string): OpenTab => ({ path, name });

describe("disambiguateTabs", () => {
  it("no añade sufijo cuando los nombres son únicos", () => {
    const tabs = [
      tab("/Users/g/dev/foo", "foo"),
      tab("/Users/g/dev/bar", "bar"),
    ];
    expect(disambiguateTabs(tabs).size).toBe(0);
  });

  it("desambigua repo vs worktree por el padre inmediato (caso real)", () => {
    const tabs = [
      tab("/Users/gonaas/dev/qamarero/monorepo", "monorepo"),
      tab("/Users/gonaas/dev/qamarero/qamarero_worktre1/monorepo", "monorepo"),
    ];
    const s = disambiguateTabs(tabs);
    expect(s.get("/Users/gonaas/dev/qamarero/monorepo")).toBe("qamarero");
    expect(s.get("/Users/gonaas/dev/qamarero/qamarero_worktre1/monorepo")).toBe(
      "qamarero_worktre1",
    );
  });

  it("profundiza cuando el padre inmediato también coincide", () => {
    const tabs = [
      tab("/home/a/x/repo", "repo"),
      tab("/home/b/x/repo", "repo"),
    ];
    const s = disambiguateTabs(tabs);
    expect(s.get("/home/a/x/repo")).toBe("a/x");
    expect(s.get("/home/b/x/repo")).toBe("b/x");
  });

  it("maneja un padre que es sufijo del otro", () => {
    const tabs = [tab("/x/repo", "repo"), tab("/a/x/repo", "repo")];
    const s = disambiguateTabs(tabs);
    expect(s.get("/x/repo")).toBe("x");
    expect(s.get("/a/x/repo")).toBe("a/x");
  });

  it("solo desambigua el grupo en colisión, deja intacto el resto", () => {
    const tabs = [
      tab("/p/uno/api", "api"),
      tab("/p/dos/api", "api"),
      tab("/p/web", "web"),
    ];
    const s = disambiguateTabs(tabs);
    expect(s.get("/p/uno/api")).toBe("uno");
    expect(s.get("/p/dos/api")).toBe("dos");
    expect(s.has("/p/web")).toBe(false);
  });

  it("colisión de tres vías", () => {
    const tabs = [
      tab("/r/alpha/svc", "svc"),
      tab("/r/beta/svc", "svc"),
      tab("/r/gamma/svc", "svc"),
    ];
    const s = disambiguateTabs(tabs);
    expect(s.get("/r/alpha/svc")).toBe("alpha");
    expect(s.get("/r/beta/svc")).toBe("beta");
    expect(s.get("/r/gamma/svc")).toBe("gamma");
  });

  it("soporta separadores de Windows", () => {
    const tabs = [
      tab("C:\\dev\\qamarero\\monorepo", "monorepo"),
      tab("C:\\dev\\qamarero\\wt1\\monorepo", "monorepo"),
    ];
    const s = disambiguateTabs(tabs);
    expect(s.get("C:\\dev\\qamarero\\monorepo")).toBe("qamarero");
    expect(s.get("C:\\dev\\qamarero\\wt1\\monorepo")).toBe("wt1");
  });
});
