use std::path::Path;

use super::port::AssistantPort;
use crate::shared::error::Result;

pub fn commit_message(port: &dyn AssistantPort, repo: &Path) -> Result<String> {
    port.commit_message(repo)
}
