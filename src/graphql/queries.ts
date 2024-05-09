/**
 * Queries for graphQL fetch
 */

const login = `mutation Login($credentials: Credentials!) {
    login(credentials: $credentials) {
      token
      message
      user {
        email
        user_name
        id
        organization
        role
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

const keysByOrg = `query KeysByOrganization($token: String!) {
  keysByOrganization(token: $token) {
    id
    key_name
    user
    loaned
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

const addKeys = `mutation Mutation($key: KeyInput) {
  addKey(key: $key) {
    message
    key {
      id
      key_name
      branch {
        id
        branch_name
        organization {
          id
          organization_name
        }
      }
    }
  }
}`;

const deleteKeys = `mutation Mutation($deleteKeyId: ID!) {
  deleteKey(id: $deleteKeyId) {
    message
  }
}`;

const branchesByOrganization = `query Query($organization: ID!) {
  branchesByOrganization(organization: $organization) {
    id
    branch_name
    organization {
      id
      organization_name
    }
  }
}`;

const userFromToken = `query Query {
  userFromToken {
    id
    user_name
    email
    organization
  }
}`;

const organizationByName = `query Query($organizationName: String!) {
  organizationByName(organization_name: $organizationName) {
    id
    organization_name
  }
}`;

const addBranch = `mutation AddBranch($branch: BranchInput) {
  addBranch(branch: $branch) {
    message
    branch {
      id
      branch_name
      organization {
        id
        organization_name
      }
    }
  }
}
`;

const usersByOrganization = `query UsersByOrganization($organization: String) {
  usersByOrganization(organization: $organization) {
    id
    user_name
    email
    organization
  }
}
`;

const deleteUser = `mutation Mutation($deleteUserId: ID!) {
  deleteUser(id: $deleteUserId) {
    message
    user {
      id
      user_name
      email
      organization
    }
  }
}
  `;

const addEmployee = `mutation Mutation($user: UserInput!) {
  registerEmployee(user: $user) {
    message
    user {
      id
      user_name
      email
      organization
    }
    password
  }
}`;

const deleteBranch = `mutation Mutation($deleteBranchId: ID!) {
  deleteBranch(id: $deleteBranchId) {
    message
  }
}`;

const checkToken = `query Query {
  checkToken {
    message
    user {
      user_name
      email
      organization
      role
    }
  }
}`;

const loanKey = `mutation Mutation($loanKeyId: ID!, $key: LoanKey) {
  loanKey(id: $loanKeyId, key: $key) {
    message
    key {
      id
      key_name
      user
      loaned
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
  }
}`;

const updateUser = `mutation Mutation($user: UserModify!) {
  updateUser(user: $user) {
    message
    user {
      id
      user_name
      email
      role
      organization
    }
  }
}`;

const getAllOrgs = `query Organizations {
  organizations {
    id
    organization_name
  }
}
`;

const addFM = `mutation Mutation($user: UserInput!) {
  registerFaciltyManager(user: $user) {
    message
    user {
      id
      user_name
      email
      organization
    }
    password
  }
}`;

const addOrganization = `mutation AddOrganization($organization: OrganizationInput) {
  addOrganization(organization: $organization) {
    message
    organization {
      id
      organization_name
    }
  }
}
`;

const orgById = `query Query($organizationByIdId: ID!) {
  organizationById(id: $organizationByIdId) {
    id
    organization_name
  }
}
`;

export {
  login,
  register,
  keysOut,
  userById,
  keysByOrg,
  addKeys,
  branchesByOrganization,
  userFromToken,
  organizationByName,
  addBranch,
  deleteKeys,
  usersByOrganization,
  deleteUser,
  addEmployee,
  deleteBranch,
  checkToken,
  loanKey,
  updateUser,
  getAllOrgs,
  addFM,
  addOrganization,
  orgById,
};
