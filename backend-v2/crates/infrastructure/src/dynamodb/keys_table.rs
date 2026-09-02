use crate::dynamodb::prefixes::{GSI1, GSI2, SK, USER_PREFIX};

pub struct UserKey;

impl UserKey {
    pub fn pk(id: &str) -> String {
        format!("{USER_PREFIX}{id}")
    }

    pub fn sk(sk: Option<&str>) -> String {
        match sk {
            Some(n) => format!("{}{}", SK::user(), n),
            None => SK::user(),
        }
    }

    pub fn gsi1(index: Option<&str>) -> String {
        match index {
            Some(n) => format!("{}{}", GSI1, n),
            None => String::from(GSI1),
        }
    }

    pub fn gsi2(index: Option<&str>) -> String {
        match index {
            Some(n) => format!("{}{}", GSI2, n),
            None => String::from(GSI2),
        }
    }

    pub fn gsi1sk(index: Option<&str>) -> String {
        match index {
            Some(n) => format!("{}{}", GSI2, n),
            None => String::from("USER".to_string()),
        }
    }
}
