mod features;
mod shared;

use std::path::PathBuf;
use std::sync::Arc;

use tauri::Manager;

use features::assistant::{cli::AssistantClaude, port::AssistantPort};
use features::branch::{git_cli::BranchGit, port::BranchPort};
use features::commit::{git_cli::CommitGit, port::CommitPort};
use features::integration::{git_cli::IntegrationGit, port::IntegrationPort};
use features::remote::{git_cli::RemoteGit, port::RemotePort};
use features::repo::{
    git_cli::RepoGit,
    persistence::RecentReposJson,
    port::{RecentReposStore, RepoPort},
};
use features::stash::{git_cli::StashGit, port::StashPort};
use features::system::{os::SystemShell, port::SystemPort};
use features::tag::{git_cli::TagGit, port::TagPort};
use features::working_tree::{git_cli::WorkingTreeGit, port::WorkingTreePort};
use features::worktree::{git_cli::WorktreeGit, port::WorktreePort};

// Los puertos van en `Arc` (no `Box`) para poder clonar un handle propio y
// `'static` de cada adaptador y moverlo a `spawn_blocking`: así el subproceso
// git corre en el pool de blocking sin pedir prestado el `State`.
pub struct Backend {
    pub repo: Arc<dyn RepoPort>,
    pub recent_repos: Arc<dyn RecentReposStore>,
    pub worktree: Arc<dyn WorktreePort>,
    pub branch: Arc<dyn BranchPort>,
    pub commit: Arc<dyn CommitPort>,
    pub working_tree: Arc<dyn WorkingTreePort>,
    pub stash: Arc<dyn StashPort>,
    pub remote: Arc<dyn RemotePort>,
    pub tag: Arc<dyn TagPort>,
    pub integration: Arc<dyn IntegrationPort>,
    pub system: Arc<dyn SystemPort>,
    pub assistant: Arc<dyn AssistantPort>,
}

impl Backend {
    fn new(data_dir: PathBuf) -> Self {
        Self {
            repo: Arc::new(RepoGit),
            recent_repos: Arc::new(RecentReposJson::new(data_dir.join("recent-repos.json"))),
            worktree: Arc::new(WorktreeGit),
            branch: Arc::new(BranchGit),
            commit: Arc::new(CommitGit),
            working_tree: Arc::new(WorkingTreeGit),
            stash: Arc::new(StashGit),
            remote: Arc::new(RemoteGit),
            tag: Arc::new(TagGit),
            integration: Arc::new(IntegrationGit),
            system: Arc::new(SystemShell),
            assistant: Arc::new(AssistantClaude),
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let data_dir = app.path().app_config_dir()?;
            app.manage(Backend::new(data_dir));
            app.manage(features::watcher::WatcherState::default());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            features::repo::ipc::open_repo,
            features::repo::ipc::recent_repos,
            features::repo::ipc::forget_recent_repo,
            features::commit::ipc::commit_history,
            features::branch::ipc::list_branches,
            features::working_tree::ipc::repo_status,
            features::worktree::ipc::list_worktrees,
            features::worktree::ipc::add_worktree,
            features::worktree::ipc::remove_worktree,
            features::commit::ipc::file_diff,
            features::commit::ipc::untracked_diff,
            features::commit::ipc::commit_files,
            features::commit::ipc::commit_diff,
            features::working_tree::ipc::stage_file,
            features::working_tree::ipc::unstage_file,
            features::working_tree::ipc::discard_file,
            features::working_tree::ipc::commit,
            features::remote::ipc::fetch,
            features::remote::ipc::pull,
            features::remote::ipc::push,
            features::branch::ipc::checkout_branch,
            features::branch::ipc::checkout_commit,
            features::branch::ipc::create_branch,
            features::branch::ipc::delete_branch,
            features::branch::ipc::rename_branch,
            features::stash::ipc::list_stashes,
            features::stash::ipc::save_stash,
            features::stash::ipc::apply_stash,
            features::stash::ipc::pop_stash,
            features::stash::ipc::drop_stash,
            features::worktree::ipc::prune_worktrees,
            features::system::ipc::open_path,
            features::tag::ipc::list_tags,
            features::tag::ipc::create_tag,
            features::tag::ipc::delete_tag,
            features::integration::ipc::merge_branch,
            features::integration::ipc::rebase_onto,
            features::integration::ipc::conflict_state,
            features::integration::ipc::conflict_content,
            features::integration::ipc::resolve_ours,
            features::integration::ipc::resolve_theirs,
            features::integration::ipc::mark_resolved,
            features::integration::ipc::abort_operation,
            features::integration::ipc::continue_operation,
            features::remote::ipc::list_remotes,
            features::remote::ipc::add_remote,
            features::remote::ipc::remove_remote,
            features::remote::ipc::rename_remote,
            features::assistant::ipc::generate_commit_message,
            features::watcher::ipc::watch_repo,
            features::watcher::ipc::unwatch_repo,
        ])
        .run(tauri::generate_context!())
        .expect("error al arrancar la aplicación Tauri");
}
