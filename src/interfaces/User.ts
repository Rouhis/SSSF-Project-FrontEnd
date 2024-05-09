/**
 * Interface for the User data type.
 *
 * @interface
 * @property {string} id - The ID of the user (optional).
 * @property {string} user_name - The username of the user (optional).
 * @property {string} token - The authentication token of the user (optional).
 * @property {string} organization - The ID of the organization the user belongs to (optional).
 * @property {string} role - The role of the user (optional).
 */
interface User {
  id?: string;
  user_name?: string;
  token?: string;
  organization?: string;
  role?: string;
}

export type {User};
