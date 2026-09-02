pub trait PasswordHasher: Send + Sync {
    fn hash(&self, plain: &str) -> Result<String, HashError>;
    fn verify(&self, plain: &str, hash: &str) -> Result<bool, HashError>;
}

pub trait TokenService: Send + Sync {
    fn sign(&self, user_id: &str, email: &str) -> Result<String, TokenError>;
}

#[derive(Debug, thiserror::Error)]
pub enum HashError {
    #[error("Error en el proceso de hash: {0}")]
    Hashing(String),
}

#[derive(Debug, thiserror::Error)]
pub enum TokenError {
    #[error("Error al firmar el token: {0}")]
    Signing(String),
}
