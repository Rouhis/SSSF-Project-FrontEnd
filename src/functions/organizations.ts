import {doGraphQLFetch} from '../graphql/fetch';
import {organizationByName} from '../graphql/queries';
import {organization} from '../interfaces/Organization';

export const fetchOrganizationByName = async (
  apiURL: string,
  userOrg: string,
): Promise<organization | null> => {
  const response = await doGraphQLFetch(apiURL, organizationByName, {
    organizationName: userOrg,
  });

  return response.organizationByName;
};