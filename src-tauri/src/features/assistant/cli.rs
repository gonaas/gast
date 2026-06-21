use std::io::Write;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

use super::port::AssistantPort;
use crate::shared::error::{AppError, Result};
use crate::shared::runner::git;

const PROMPT: &str = "Eres un generador de mensajes de commit. A partir del diff staged que recibes por stdin, devuelve UNICAMENTE el mensaje de commit en formato Conventional Commits: una linea de resumen de 72 caracteres o menos con la forma tipo(scope): descripcion, y si aporta valor un cuerpo separado por una linea en blanco. No incluyas comillas, ni markdown, ni explicaciones, ni texto adicional.";

pub struct AssistantClaude;

impl AssistantPort for AssistantClaude {
    fn commit_message(&self, repo: &Path) -> Result<String> {
        let diff = git(repo, ["diff", "--cached", "--no-color"])?;
        if diff.trim().is_empty() {
            return Err(AppError::Ai(
                "no hay cambios en el área de staging para resumir".into(),
            ));
        }
        run_claude(repo, &diff)
    }
}

fn run_claude(repo: &Path, diff: &str) -> Result<String> {
    let bin = find_claude().ok_or_else(|| {
        AppError::Ai(
            "no se encontró el CLI `claude`. Instálalo y haz login (`claude`) para usar la generación con IA"
                .into(),
        )
    })?;

    let mut child = Command::new(&bin)
        .arg("-p")
        .arg(PROMPT)
        .args(["--model", "haiku"])
        .current_dir(repo)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| AppError::Ai(format!("no se pudo ejecutar claude: {e}")))?;

    child
        .stdin
        .take()
        .ok_or_else(|| AppError::Ai("no se pudo abrir la entrada de claude".into()))?
        .write_all(diff.as_bytes())
        .map_err(|e| AppError::Ai(format!("no se pudo enviar el diff a claude: {e}")))?;

    let out = child
        .wait_with_output()
        .map_err(|e| AppError::Ai(format!("claude falló: {e}")))?;

    if !out.status.success() {
        let stderr = String::from_utf8_lossy(&out.stderr).trim().to_string();
        return Err(AppError::Ai(if stderr.is_empty() {
            format!("claude terminó con código {:?}", out.status.code())
        } else {
            stderr
        }));
    }

    let msg = String::from_utf8_lossy(&out.stdout).trim().to_string();
    if msg.is_empty() {
        return Err(AppError::Ai("claude no devolvió ningún mensaje".into()));
    }
    Ok(msg)
}

fn find_claude() -> Option<PathBuf> {
    if let Ok(home) = std::env::var("HOME") {
        for rel in [
            ".claude/local/claude",
            ".local/bin/claude",
            ".bun/bin/claude",
            ".npm-global/bin/claude",
        ] {
            let p = Path::new(&home).join(rel);
            if p.is_file() {
                return Some(p);
            }
        }
    }
    for p in [
        "/opt/homebrew/bin/claude",
        "/usr/local/bin/claude",
        "/usr/bin/claude",
    ] {
        let pb = PathBuf::from(p);
        if pb.is_file() {
            return Some(pb);
        }
    }
    let shell = std::env::var("SHELL").unwrap_or_else(|_| "/bin/zsh".into());
    if let Ok(out) = Command::new(shell)
        .args(["-lc", "command -v claude"])
        .output()
    {
        if out.status.success() {
            let path = String::from_utf8_lossy(&out.stdout).trim().to_string();
            if !path.is_empty() {
                return Some(PathBuf::from(path));
            }
        }
    }
    None
}
