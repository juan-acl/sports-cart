use aws_config::{BehaviorVersion, Region};
use aws_sdk_dynamodb::{config::Credentials, Client};

pub async fn build_dynamo_client() -> Client {
    let region = std::env::var("AWS_REGION").unwrap_or_else(|_| "us-east-1".to_string());

    let mut loader = aws_config::defaults(BehaviorVersion::latest()).region(Region::new(region));

    // Solo en local: apuntar a DynamoDB Local con credenciales dummy
    // if let Ok(endpoint) = std::env::var("DYNAMODB_ENDPOINT") {

    loader = loader
        .endpoint_url("http://localhost:8000")
        .credentials_provider(Credentials::new("local", "local", None, None, "static"));
    // }

    let config = loader.load().await;
    Client::new(&config)
}
