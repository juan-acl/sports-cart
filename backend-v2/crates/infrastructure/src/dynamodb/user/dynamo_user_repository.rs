use async_trait::async_trait;
use aws_sdk_dynamodb::operation::put_item::PutItemError;
use aws_sdk_dynamodb::types::AttributeValue;
use aws_sdk_dynamodb::Client;
use domain::modules::user::entity::User;
use domain::modules::user::repository::{RepositoryError, UserRepository};

use crate::dynamodb::user::user_mapper::UserMapper;

pub struct DynamoUserRepository {
    client: Client,
    table_name: String,
}

impl DynamoUserRepository {
    pub fn new(client: Client, table_name: String) -> Self {
        Self { client, table_name }
    }
}

#[async_trait]
impl UserRepository for DynamoUserRepository {
    async fn find_by_email(&self, email: &str) -> Result<Option<User>, RepositoryError> {
        let output = self
            .client
            .query()
            .table_name(&self.table_name)
            .index_name("GSI1")
            .key_condition_expression("GSI1PK = :pk")
            .expression_attribute_values(":pk", AttributeValue::S(email.to_string().to_lowercase()))
            .limit(1)
            .send()
            .await
            .map_err(|e| RepositoryError::DatabaseError(e.to_string()))?;

        let items = output.items.unwrap_or_default();
        match items.into_iter().next() {
            Some(item) => UserMapper::to_domain(&item).map(Some),
            None => Ok(None),
        }
    }

    async fn save(&self, user: &User) -> Result<(), RepositoryError> {
        self.client
            .put_item()
            .table_name(&self.table_name)
            .set_item(Some(UserMapper::to_item(user)))
            .condition_expression("attibute_not_exists(PK)")
            .send()
            .await
            .map_err(|err| match err.into_service_error() {
                PutItemError::ConditionalCheckFailedException(_) => RepositoryError::AlreadyExists,
                other => RepositoryError::DatabaseError(other.to_string()),
            })?;

        Ok(())
    }
}
