use serde::Deserialize;
use validator::Validate;

#[derive(Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct RegisterRequest {
    #[validate(length(min = 1), email(message = "Correo inválido"))]
    pub email: String,

    #[validate(length(
        min = 1,
        max = 200,
        message = "El nombre debe tener entre 1 y 200 caracteres"
    ))]
    pub name: String,

    #[validate(length(min = 8, message = "la contraseña debe tener al menos 8 caracteres"))]
    pub password: String,
}
