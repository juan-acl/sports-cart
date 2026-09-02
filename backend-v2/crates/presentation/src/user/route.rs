use axum::{routing::post, Router};

use crate::user::controller::{register, AuthState};

pub fn auth_routes(state: AuthState) -> Router {
    Router::new()
        .route("/v1/auth/register", post(register))
        .with_state(state)
}
