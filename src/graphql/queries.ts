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

const keysOut = `query KeysOut($token: String!) {
  keysOut(token: $token) {
    id
    key_name
    loaned
    user
    loanedtime
    returnedtime
    loantime
    branch {
      id
      branch_name
      organization {
        id
        organization_name
      }
    }
  }
}`;

const userById = `query UserById($userByIdId: ID!) {
  userById(id: $userByIdId) {
    id
    user_name
    email
    organization
  }
}`;

export {login, register, keysOut, userById};
