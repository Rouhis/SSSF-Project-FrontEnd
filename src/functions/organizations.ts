import {doGraphQLFetch} from '../graphql/fetch';
import {orgById, organizationByName} from '../graphql/queries';
import {Organization} from '../interfaces/Organization';

const fetchOrganizationByName = async (
  apiURL: string,
  userOrg: string,
): Promise<Organization | null> => {
  const response = await doGraphQLFetch(apiURL, organizationByName, {
    organizationName: userOrg,
  });

  return response.organizationByName;
};

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
