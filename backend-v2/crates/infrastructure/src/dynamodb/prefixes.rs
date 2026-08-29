pub const USER_PREFIX: &str = "USER#";
pub const PRODUCT_PREFIX: &str = "PRODUCT#";
pub const CATEGORY_PREFIX: &str = "CATEGORY#";
pub const EMAIL_PREFIX: &str = "EMAIL#";
pub const CART_PREFIX: &str = "CART#";
pub const ORDER_PREFIX: &str = "ORDER#";

pub const GSI1: &str = "GSI1";
pub const GSI2: &str = "GSI2";

pub struct SK;

impl SK {
    pub fn profile() -> String {
        format!("PROFILE")
    }

    pub fn user() -> String {
        format!("USER")
    }

    pub fn metadata() -> String {
        format!("METADATA")
    }
}
