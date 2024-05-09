/**
 * Performs a GraphQL fetch.
 *
 * @param {string} url - The URL of the GraphQL server.
 * @param {string} query - The GraphQL query to execute.
 * @param {object} variables - The variables to include in the query.
 * @param {string} [token] - The authorization token (optional).
 * @returns {Promise<object>} A promise that resolves to the data returned by the query.
 * @throws {Error} If the fetch fails.
 */
const doGraphQLFetch = async (
  url: string,
  query: string,
  variables: object,
  token?: string,
) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query,
      variables,
    }),
  });
  if (!response.ok) throw new Error(response.statusText);
  const json = await response.json();
  return json.data;
};

export {doGraphQLFetch};
