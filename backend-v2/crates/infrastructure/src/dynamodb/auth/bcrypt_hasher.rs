use domain::modules::user::port::{HashError, PasswordHasher};

pub struct BcryptHasher {
    cost: u32,
}

impl BcryptHasher {
    pub fn new(cost: u32) -> Self {
        Self { cost }
    }
}

impl PasswordHasher for BcryptHasher {
    fn hash(&self, plain: &str) -> Result<String, HashError> {
        bcrypt::hash(plain, self.cost).map_err(|error| HashError::Hashing(error.to_string()))
    }

    fn verify(&self, plain: &str, hash: &str) -> Result<bool, HashError> {
        bcrypt::verify(plain, hash).map_err(|error| HashError::Hashing(error.to_string()))
    }
}
