#!/usr/bin/env bash
# Verifica que cada comando git emitido por el backend de ast-git funciona
# contra el binario `git` real, y que su salida coincide con lo que esperan
# los parsers de Rust. No sustituye a `cargo test` (que prueba los parsers en
# Rust), pero valida los *formatos* de git de forma ejecutable.
set -euo pipefail

US=$'\x1f' # unit separator (0x1f)
pass=0
fail=0
check() { # check "descripción" "esperado_substring" "real"
  if [[ "$3" == *"$2"* ]]; then echo "  ✓ $1"; pass=$((pass+1));
  else echo "  ✗ $1"; echo "    esperaba contener: [$2]"; echo "    obtuvo: [$3]"; fail=$((fail+1)); fi
}

# pwd -P resuelve symlinks (en macOS /var -> /private/var), igual que hace
# git rev-parse --show-toplevel, para que las rutas comparen bien.
REPO=$(cd "$(mktemp -d)" && pwd -P)
trap 'rm -rf "$REPO" "${WT:-}"' EXIT
cd "$REPO"
git init -q -b main
git config user.email t@t.com
git config user.name Tester

echo "== repo::open (rev-parse) =="
echo hola > a.txt; git add a.txt; git commit -qm "primer commit"
check "show-toplevel" "$REPO" "$(git -C "$REPO" rev-parse --show-toplevel)"
check "rama actual" "main" "$(git -C "$REPO" rev-parse --abbrev-ref HEAD)"

echo "== status (porcelain v1 --branch) =="
echo mas >> a.txt; echo nuevo > b.txt
S=$(git -C "$REPO" status --porcelain=v1 --branch)
check "cabecera de rama" "## main" "$S"
check "modificado sin stage" " M a.txt" "$S"
check "sin seguimiento" "?? b.txt" "$S"

echo "== changes::stage_file (add) + unstage_file (restore --staged) =="
git -C "$REPO" add -- a.txt
check "staged tras add" "M  a.txt" "$(git -C "$REPO" status --porcelain=v1)"
git -C "$REPO" restore --staged -- a.txt
check "unstaged tras restore" " M a.txt" "$(git -C "$REPO" status --porcelain=v1)"

echo "== diff::file_diff (unstaged) =="
D=$(git -C "$REPO" diff --no-color -- a.txt)
check "diff con cabecera" "diff --git a/a.txt b/a.txt" "$D"
check "diff con línea añadida" "+mas" "$D"

echo "== diff::untracked_diff (--no-index, exit 1) =="
set +e
DU=$(git -C "$REPO" diff --no-color --no-index /dev/null b.txt)
set -e
check "diff de untracked" "+nuevo" "$DU"

echo "== changes::commit =="
git -C "$REPO" add -A
git -C "$REPO" commit -qm "segundo commit"
check "árbol limpio tras commit" "" "$(git -C "$REPO" status --porcelain=v1)"

echo "== branch::list_branches (--format con 0x1f) =="
git -C "$REPO" branch feature
B=$(git -C "$REPO" branch --all --format="%(HEAD)${US}%(refname)${US}%(refname:short)${US}%(objectname)${US}%(upstream:short)")
check "rama main es HEAD (*)" "*${US}refs/heads/main" "$B"
check "rama feature presente" "refs/heads/feature" "$B"

echo "== log::commit_log (pretty con %x1f/%x1e) =="
L=$(git -C "$REPO" log --all --max-count=10 --pretty='format:%H%x1f%h%x1f%P%x1f%an%x1f%ae%x1f%at%x1f%s%x1f%D%x1e')
check "subject del último commit" "segundo commit" "$L"

echo "== worktree::add_worktree + list_worktrees --porcelain =="
WT="$REPO-wt"
git -C "$REPO" worktree add -q "$WT" feature
W=$(git -C "$REPO" worktree list --porcelain)
check "worktree principal" "worktree $REPO" "$W"
check "worktree de feature" "branch refs/heads/feature" "$W"

echo "== worktree::remove_worktree =="
git -C "$REPO" worktree remove "$WT"
check "worktree eliminado" "" "$(git -C "$REPO" worktree list --porcelain | grep -c feature || true)"

echo "== branch::create_branch (switch -c) =="
git -C "$REPO" switch -q -c nueva
check "rama nueva es HEAD" "* nueva" "$(git -C "$REPO" branch)"
git -C "$REPO" switch -q main

echo "== branch::checkout_branch (switch) =="
git -C "$REPO" switch -q feature
check "checkout a feature" "* feature" "$(git -C "$REPO" branch)"
git -C "$REPO" switch -q main

echo "== branch::rename_branch (branch -m) =="
git -C "$REPO" branch -m nueva renombrada
check "rama renombrada" "renombrada" "$(git -C "$REPO" branch --list renombrada)"

echo "== branch::delete_branch (branch -d/-D) =="
git -C "$REPO" branch -D renombrada
check "rama borrada" "0" "$(git -C "$REPO" branch --list renombrada | grep -c . || true)"

echo "== stash::save_stash + list_stashes (--format=%gd<US>%gs) =="
echo "cambio sin commit" >> a.txt
git -C "$REPO" stash push -q -m "wip de prueba"
ST=$(git -C "$REPO" stash list --format="%gd${US}%gs")
check "stash@{0} listado" "stash@{0}${US}" "$ST"
check "mensaje del stash" "wip de prueba" "$ST"

echo "== stash::pop_stash =="
git -C "$REPO" stash pop -q stash@{0}
check "stash vacío tras pop" "0" "$(git -C "$REPO" stash list | grep -c . || true)"
check "cambio recuperado" "cambio sin commit" "$(cat "$REPO/a.txt")"

echo "== worktree::add_worktree con rama nueva desde un start =="
WT2="$REPO-wt2"
git -C "$REPO" worktree add -b desde-feature "$WT2" feature
check "worktree con rama nueva creado" "branch refs/heads/desde-feature" "$(git -C "$REPO" worktree list --porcelain)"

echo "== worktree::prune_worktrees =="
rm -rf "$WT2" # simula un worktree borrado a mano (queda obsoleto)
git -C "$REPO" worktree prune
check "prune limpia el obsoleto" "0" "$(git -C "$REPO" worktree list --porcelain | grep -c desde-feature || true)"

echo "== system::open_path (binario 'open' disponible en macOS) =="
if [[ "$OSTYPE" == darwin* ]]; then
  check "comando open existe" "/open" "$(command -v open)"
else
  echo "  - (saltado: no es macOS)"
fi

echo "== preparar árbol limpio para Fase 3 =="
git -C "$REPO" checkout -q -- a.txt # descarta el cambio recuperado del stash

echo "== refs::create_tag (anotado) + list_tags =="
git -C "$REPO" tag -a -m "release uno" v1.0
check "tag listado" "v1.0" "$(git -C "$REPO" tag --list --sort=-version:refname)"

echo "== refs::delete_tag =="
git -C "$REPO" tag -d v1.0
check "tag borrado" "0" "$(git -C "$REPO" tag --list v1.0 | grep -c . || true)"

echo "== refs::merge_branch =="
git -C "$REPO" switch -q -c rama-merge
echo f1 > f1.txt; git -C "$REPO" add f1.txt; git -C "$REPO" commit -qm "f1 en rama-merge"
git -C "$REPO" switch -q main
echo m1 >> a.txt; git -C "$REPO" commit -qam "m1 en main" # diverge
git -C "$REPO" merge --no-edit -q rama-merge
check "merge trae f1.txt" "f1.txt" "$(git -C "$REPO" ls-files f1.txt)"
check "merge crea commit de merge" "Merge" "$(git -C "$REPO" log -1 --pretty=%s)"

echo "== refs::rebase_onto =="
git -C "$REPO" switch -q -c rama-rebase
echo f2 > f2.txt; git -C "$REPO" add f2.txt; git -C "$REPO" commit -qm "f2 en rama-rebase"
git -C "$REPO" switch -q main
echo m2 >> a.txt; git -C "$REPO" commit -qam "m2 en main"
git -C "$REPO" switch -q rama-rebase
git -C "$REPO" rebase -q main
check "rebase reaplica f2 sobre main" "m2 en main" "$(git -C "$REPO" log --pretty=%s)"
check "f2 sigue presente tras rebase" "f2.txt" "$(git -C "$REPO" ls-files f2.txt)"

echo "== commit_graph (log con padres para layout) =="
G=$(git -C "$REPO" log --all --pretty='format:%H%x1f%P')
check "commit de merge tiene 2 padres" " " "$(git -C "$REPO" log --merges -1 --pretty=%P)"

echo "== conflict: provocar y resolver (theirs) + continuar =="
git -C "$REPO" switch -q main
echo base > shared.txt; git -C "$REPO" add shared.txt; git -C "$REPO" commit -qm "base shared"
git -C "$REPO" switch -q -c conf-a
echo AAA > shared.txt; git -C "$REPO" commit -qam "shared = A"
git -C "$REPO" switch -q main
echo BBB > shared.txt; git -C "$REPO" commit -qam "shared = B"
set +e; git -C "$REPO" merge --no-edit conf-a >/dev/null 2>&1; set -e
check "conflict_state detecta merge (MERGE_HEAD)" "MERGE_HEAD" "$(ls "$REPO/.git" | grep MERGE_HEAD || true)"
check "archivo en conflicto (diff-filter=U)" "shared.txt" "$(git -C "$REPO" diff --name-only --diff-filter=U)"
git -C "$REPO" checkout --theirs -- shared.txt; git -C "$REPO" add -- shared.txt
check "sin conflictos tras resolver theirs" "0" "$(git -C "$REPO" diff --name-only --diff-filter=U | grep -c . || true)"
git -C "$REPO" commit --no-edit -q
check "continue cierra el merge" "" "$(git -C "$REPO" rev-parse --verify --quiet MERGE_HEAD || true)"
check "se quedó la versión theirs (AAA)" "AAA" "$(cat "$REPO/shared.txt")"

echo "== conflict: abortar =="
git -C "$REPO" switch -q -c conf-c
echo CCC > shared.txt; git -C "$REPO" commit -qam "shared = C"
git -C "$REPO" switch -q main
echo DDD > shared.txt; git -C "$REPO" commit -qam "shared = D"
set +e; git -C "$REPO" merge --no-edit conf-c >/dev/null 2>&1; set -e
git -C "$REPO" merge --abort
check "abort limpia el merge" "" "$(git -C "$REPO" rev-parse --verify --quiet MERGE_HEAD || true)"
check "abort restaura la versión de main (DDD)" "DDD" "$(cat "$REPO/shared.txt")"

echo "== remotes::add / list (-v) / rename / remove =="
git -C "$REPO" remote add origin https://example.com/x.git
check "remote -v lista origin (fetch)" "origin	https://example.com/x.git (fetch)" "$(git -C "$REPO" remote -v)"
git -C "$REPO" remote rename origin upstream
check "remote renombrado a upstream" "upstream" "$(git -C "$REPO" remote)"
git -C "$REPO" remote remove upstream
check "remote eliminado" "0" "$(git -C "$REPO" remote | grep -c . || true)"

echo
echo "RESULTADO: $pass ok, $fail fallos"
[[ $fail -eq 0 ]]
