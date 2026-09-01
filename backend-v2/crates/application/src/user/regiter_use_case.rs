use std::sync::Arc;

use domain::modules::user::{
    entity::User,
    port::{PasswordHasher, TokenService},
    repository::{RepositoryError, UserRepository},
};

impl RegisterUseCase {
    pub fn new(
        user_repo: Arc<dyn UserRepository>,
        hasher: Arc<dyn PasswordHasher>,
        tokens: Arc<dyn TokenService>,
    ) -> Self {
        Self {
            user_repo,
            hasher,
            tokens,
        }
    }

    pub async fn axecute(&self, input: RegisterInput) -> Result<RegisterOutput, RegisterError> {
        if self.user_repo.find_by_email(&input.email).await?.is_some() {
            return Err(RegisterError::EmailAlreadyExist);
        }

        let password_hash = self
            .hasher
            .hash(&input.password)
            .map_err(|error| RegisterError::Internal(error.to_string()))?;

        let user = User::new(input.email, input.name, password_hash);

        match self.user_repo.save(&user).await {
            Ok(()) => {}
            Err(RepositoryError::AlreadyExists) => return Err(RegisterError::EmailAlreadyExist),
            Err(e) => return Err(RegisterError::Internal(e.to_string())),
        }

        let token = self
            .tokens
            .sign(&user.id, &user.email)
            .map_err(|e| RegisterError::Internal(e.to_string()))?;

        Ok(RegisterOutput { user, token })
    }
}

pub struct RegisterInput {
    pub name: String,
    pub email: String,
    pub password: String,
}

pub struct RegisterOutput {
    pub token: String,
    pub user: User,
}

#[derive(Debug, thiserror::Error)]
pub enum RegisterError {
    #[error("Correo ya existente")]
    EmailAlreadyExist,
    #[error(transparent)]
    Repository(#[from] RepositoryError),

    #[error("Error interno de la aplicacion: {0}")]
    Internal(String),
}

pub struct RegisterUseCase {
    user_repo: Arc<dyn UserRepository>,
    hasher: Arc<dyn PasswordHasher>,
    tokens: Arc<dyn TokenService>,
}
