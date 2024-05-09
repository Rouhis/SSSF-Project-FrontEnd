/**
 * Interface for the Branch data type.
 *
 * @interface
 * @property {string} id - The ID of the branch (optional).
 * @property {string} branch_name - The name of the branch (optional).
 * @property {string} organization - The ID of the organization the branch belongs to (optional).
 */
interface Branch {
  id?: string;
  branch_name?: string;
  organization?: string;
}

export type {Branch};
