import {Branch} from './Branch';

/**
 * Interface for the Key data type.
 *
 * @interface
 * @property {string} id - The ID of the key (optional).
 * @property {string} key_name - The name of the key (optional).
 * @property {Branch} branch - The branch the key belongs to (optional).
 * @property {string} user - The ID of the user the key is loaned to (optional).
 * @property {boolean} loaned - Whether the key is currently loaned out (optional).
 * @property {Date | null} loanedtime - The time the key was loaned out (optional).
 * @property {Date | null} returnedtime - The time the key was returned (optional).
 * @property {Date | null} loantime - The time the key is due to be returned (optional).
 */
interface Key {
  id?: string;
  key_name?: string;
  branch?: Branch;
  user?: string;
  loaned?: boolean;
  loanedtime?: Date | null;
  returnedtime?: Date | null;
  loantime?: Date | null;
}

export type {Key};
