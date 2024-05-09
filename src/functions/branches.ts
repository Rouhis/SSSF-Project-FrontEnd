import {doGraphQLFetch} from '../graphql/fetch';
import {branchesByOrganization} from '../graphql/queries';

/**
 * Fetches branches by organization ID.
 *
 * @param {string} apiURL - The URL of the API.
 * @param {string} orgId - The ID of the organization.
 * @returns {Promise<Array>} A promise that resolves to an array of branches.
 */
const fetchBranchesByOrg = async (apiURL: string, orgId: string) => {
  const response = await doGraphQLFetch(apiURL, branchesByOrganization, {
    organization: orgId,
  });

  return response.branchesByOrganization || [];
};

export {fetchBranchesByOrg};
