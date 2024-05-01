import React from 'react';

export const AuthContext = React.createContext({
  token: null,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setToken: (token: string) => {},
});