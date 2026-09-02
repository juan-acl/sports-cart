use application::user::regiter_use_case::{RegisterInput, RegisterUseCase};
use axum::{extract::State, http::StatusCode, Json};
use std::sync::Arc;
use validator::Validate;

use super::dto::RegisterRequest;
use crate::errors::ApiError;

#[derive(Clone)]
pub struct AuthState {
    pub register: Arc<RegisterUseCase>,
}

pub async fn register(
    State(state): State<AuthState>,
    Json(body): Json<RegisterRequest>,
) -> Result<(StatusCode, Json<serde_json::Value>), ApiError> {
    body.validate()
        .map_err(|e| ApiError::bad_request(e.to_string()))?;

    let output = state
        .register
        .execute(RegisterInput {
            email: body.email,
            password: body.password,
            name: body.name,
        })
        .await?;

    Ok((
        StatusCode::CREATED,
        Json(serde_json::json!({
            "success": true,
            "data": {
                "user": &output.user.to_json(),
                "token": output.token,
            }
        })),
    ))
}
