use chrono::{Duration, Utc};
use domain::modules::user::port::{TokenError, TokenService};
use jsonwebtoken::{encode, EncodingKey, Header};
use serde::Serialize;

#[derive(Serialize)]
struct Claims {
    sub: String,
    email: String,
    exp: usize,
}

pub struct JwtTokenService {
    secret: String,
}

impl JwtTokenService {
    pub fn new(secret: String) -> Self {
        Self { secret }
    }
}

impl TokenService for JwtTokenService {
    fn sign(&self, user_id: &str, email: &str) -> Result<String, TokenError> {
        let claims = Claims {
            sub: user_id.to_string(),
            email: email.to_string(),
            exp: (Utc::now() + Duration::hours(24)).timestamp() as usize,
        };

        encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(self.secret.as_bytes()),
        )
        .map_err(|e| TokenError::Signing(e.to_string()))
    }
}
