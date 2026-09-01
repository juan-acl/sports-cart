use async_trait::async_trait;

use super::entity::User;

#[derive(Debug, thiserror::Error)]
pub enum RepositoryError {
    #[error("Error en la base de datos: {0}")]
    DatabaseError(String),
    #[error("Ya existe un usuario con ese email")]
    AlreadyExists,
}

#[async_trait]
pub trait UserRepository: Send + Sync {
    async fn find_by_email(&self, email: &str) -> Result<Option<User>, RepositoryError>;
    async fn save(&self, user: &User) -> Result<(), RepositoryError>;
}
