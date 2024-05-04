// fetchBranchesByOrg.ts
import {doGraphQLFetch} from '../graphql/fetch'; // replace with actual path
import {branchesByOrganization} from '../graphql/queries'; // replace with actual path

const fetchBranchesByOrg = async (apiURL: string, orgId: string) => {
  const response = await doGraphQLFetch(apiURL, branchesByOrganization, {
    organization: orgId,
  });

  return response.branchesByOrganization || [];
};

export {fetchBranchesByOrg};
