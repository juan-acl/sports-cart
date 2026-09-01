#[derive(Debug, Clone)]
pub struct User {
    pub id: String,
    pub email: String,
    pub name: String,
    pub password_hash: String,
    pub create_at: String,
}

impl User {
    pub fn id(&self) -> &str {
        &self.id
    }

    pub fn email(&self) -> &str {
        &self.email
    }

    pub fn name(&self) -> &str {
        &self.name
    }

    pub fn create_at(&self) -> &str {
        &self.create_at
    }

    pub fn password_hash(&self) -> &str {
        &self.password_hash
    }

    pub fn to_json(&self) -> UserResponse {
        UserResponse {
            id: self.id.clone(),
            email: self.email.clone(),
            name: self.name.clone(),
            create_at: self.create_at.clone(),
        }
    }
}

pub struct UserResponse {
    pub id: String,
    pub email: String,
    pub name: String,
    pub create_at: String,
}
