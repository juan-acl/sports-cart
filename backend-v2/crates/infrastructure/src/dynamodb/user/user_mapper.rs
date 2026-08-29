use std::collections::HashMap;

use aws_sdk_dynamodb::types::AttributeValue;
use domain::modules::user::{self, entity::User};

use crate::dynamodb::{keys_table::UserKey, prefixes::EMAIL_PREFIX};

pub struct UserMapper;

impl UserMapper {
    pub fn to_item(user: &User) -> HashMap<String, AttributeValue> {
        HashMap::from([
            ("PK".into(), AttributeValue::S(UserKey::pk(user.id()))),
            ("SK".into(), AttributeValue::S(UserKey::sk(None))),
            (
                "GSI1".into(),
                AttributeValue::S(format!(
                    "{}{}",
                    EMAIL_PREFIX,
                    user.email().to_lowercase().trim()
                )),
            ),
            ("GSI2".into(), AttributeValue::S(UserKey::sk(None))),
            ("id".into(), AttributeValue::S(format!("{}", user.id()))),
            (
                "email".into(),
                AttributeValue::S(format!("{}", user.email())),
            ),
            (
                "passwordHash".into(),
                AttributeValue::S(format!("{}", user.password_hash())),
            ),
            (
                "createAt".into(),
                AttributeValue::S(format!("{}", user.create_at())),
            ),
        ])
    }
}
