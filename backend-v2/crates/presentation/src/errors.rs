use application::user::regiter_use_case::RegisterError;
use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};

pub struct ApiError {
    status: StatusCode,
    message: String,
}

impl ApiError {
    pub fn bad_request(msg: impl Into<String>) -> Self {
        Self {
            status: StatusCode::BAD_REQUEST,
            message: msg.into(),
        }
    }
}

impl From<RegisterError> for ApiError {
    fn from(err: RegisterError) -> Self {
        eprintln!("ERROR: {:?}", err); // ← esto sale en la terminal directo
        match err {
            RegisterError::EmailAlreadyExist => Self {
                status: StatusCode::CONFLICT,
                message: "Ya existe un usuario con ese email".into(),
            },
            RegisterError::Repository(_) | RegisterError::Internal(_) => Self {
                status: StatusCode::INTERNAL_SERVER_ERROR,
                message: "Error interno del servidor".into(),
            },
        }
    }
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        (
            self.status,
            Json(serde_json::json!({ "success": false, "error": self.message })),
        )
            .into_response()
    }
}
