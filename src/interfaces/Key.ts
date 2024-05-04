import {Branch} from './Branch';

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
