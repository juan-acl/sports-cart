use application::user::regiter_use_case::RegisterUseCase;
use infrastructure::dynamodb::auth::bcrypt_hasher::BcryptHasher;
use infrastructure::dynamodb::auth::jwt_token_service::JwtTokenService;
use infrastructure::dynamodb::user::dynamo_user_repository::DynamoUserRepository;
use lambda_http::{run, Error};
use std::sync::Arc;

use presentation::user::controller::AuthState;
use presentation::user::route::auth_routes;

#[tokio::main]
async fn main() -> Result<(), Error> {
    tracing_subscriber::fmt().json().init();

    // let table = std::env::var("DYNAMODB_TABLE_NAME")?;
    // let jwt_secret = std::env::var("JWT_SECRET")?;

    let table = "ClaroEcommerce".to_string();
    let jwt_secret = "ES-MI-SECRETO".to_string();

    let client = infrastructure::dynamodb::client::build_dynamo_client().await;
    let user_repo = Arc::new(DynamoUserRepository::new(client, table));
    let hasher = Arc::new(BcryptHasher::new(10));
    let tokens = Arc::new(JwtTokenService::new(jwt_secret));

    let state = AuthState {
        register: Arc::new(RegisterUseCase::new(user_repo, hasher, tokens)),
    };

    run(auth_routes(state)).await
}
