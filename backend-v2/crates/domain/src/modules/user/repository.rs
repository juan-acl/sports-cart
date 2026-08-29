use super::entity::User;

#[derive(Debug)]
pub enum RepositoryError {
    DatabaseError(String),
}

pub trait UserRepository: Send + Sync {
    async fn find_by_email(&self, email: &str) -> Result<Option<User>, RepositoryError>;
    async fn save(&self, user: &User) -> Result<(), RepositoryError>;
}
