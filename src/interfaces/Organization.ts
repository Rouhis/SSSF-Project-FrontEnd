/**
 * Interface for the Organization data type.
 *
 * @interface
 * @property {string} id - The ID of the organization (optional).
 * @property {string} organization_name - The name of the organization (optional).
 */
interface Organization {
  id?: string;
  organization_name?: string;
}

export type {Organization};
