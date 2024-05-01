const login = `mutation Login($credentials: Credentials!) {
    login(credentials: $credentials) {
      token
      message
      user {
        email
        user_name
        id
        organization
      }
    }
  }
`;
const register = `mutation Register($user: UserInputTests!) {
  registerTestUser(user: $user) {
    message
    user {
      id
      user_name
      email
      organization
    }
  }
}`;

export { login, register };