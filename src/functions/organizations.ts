import {doGraphQLFetch} from '../graphql/fetch';
import {orgById, organizationByName} from '../graphql/queries';
import {Organization} from '../interfaces/Organization';

/**
 * Fetches an organization by its name.
 *
 * @param {string} apiURL - The URL of the API.
 * @param {string} userOrg - The name of the organization.
 * @returns {Promise<Organization | null>} A promise that resolves to an organization or null.
 */
const fetchOrganizationByName = async (
  apiURL: string,
  userOrg: string,
): Promise<Organization | null> => {
  const response = await doGraphQLFetch(apiURL, organizationByName, {
    organizationName: userOrg,
  });

  return response.organizationByName;
};

/**
 * Fetches an organization by its ID.
 *
 * @param {string} apiURL - The URL of the API.
 * @param {string} userOrg - The ID of the organization.
 * @returns {Promise<Organization | null>} A promise that resolves to an organization or null.
 */
const fetchOrganizationById = async (
  apiURL: string,
  userOrg: string,
): Promise<Organization | null> => {
  const response = await doGraphQLFetch(apiURL, orgById, {
    organizationByIdId: userOrg,
  });
  return response.organizationById;
};

export {fetchOrganizationByName, fetchOrganizationById};
