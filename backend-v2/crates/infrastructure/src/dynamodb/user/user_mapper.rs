use std::collections::HashMap;

use aws_sdk_dynamodb::types::AttributeValue;
use chrono::{DateTime, Utc};
use domain::modules::user::{entity::User, repository::RepositoryError};

use crate::dynamodb::{keys_table::UserKey, prefixes::EMAIL_PREFIX};

pub struct UserMapper;

impl UserMapper {
    pub fn to_item(user: &User) -> HashMap<String, AttributeValue> {
        HashMap::from([
            ("PK".into(), AttributeValue::S(UserKey::pk(user.id()))),
            ("SK".into(), AttributeValue::S(UserKey::sk(None))),
            (
                "GSI1PK".into(),
                AttributeValue::S(format!(
                    "{}{}",
                    EMAIL_PREFIX,
                    user.email().to_lowercase().trim()
                )),
            ),
            ("GSI1SK".into(), AttributeValue::S(UserKey::gsi1sk(None))),
            ("id".into(), AttributeValue::S(user.id().to_string())),
            ("name".into(), AttributeValue::S(user.name().to_string())),
            ("email".into(), AttributeValue::S(user.email().to_string())),
            (
                "passwordHash".into(),
                AttributeValue::S(user.password_hash().to_string()),
            ),
            (
                "createAt".into(),
                AttributeValue::S(user.create_at().to_rfc3339()),
            ),
        ])
    }

    pub fn to_domain(item: &HashMap<String, AttributeValue>) -> Result<User, RepositoryError> {
        Ok(User {
            id: string_field(item, "id")?,
            email: string_field(item, "email")?,
            name: string_field(item, "name")?,
            create_at: datetime_field(item, "createAt")?,
            password_hash: string_field(item, "passwordHash")?,
        })
    }
}

fn string_field(
    item: &HashMap<String, AttributeValue>,
    key: &str,
) -> Result<String, RepositoryError> {
    item.get(key)
        .and_then(|v| v.as_s().ok())
        .map(|s| s.to_string())
        .ok_or_else(|| RepositoryError::DatabaseError(format!("falta el atributo '{key}'")))
}

fn datetime_field(
    item: &HashMap<String, AttributeValue>,
    key: &str,
) -> Result<DateTime<Utc>, RepositoryError> {
    let value = string_field(item, key)?;

    DateTime::parse_from_rfc3339(&value)
        .map(|dt| dt.with_timezone(&Utc))
        .map_err(|e| {
            RepositoryError::DatabaseError(format!(
                "el atributo '{key}' no contiene un timestamp válido: {e}"
            ))
        })
}
