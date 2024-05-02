import {doGraphQLFetch} from './graphql/fetch';
import {checkToken} from './graphql/queries';
import {User} from './interfaces/User';
import Cookies from 'js-cookie';

const apiUrl = import.meta.env.VITE_API_URL;

export async function getUser(): Promise<User | null> {
  const token = Cookies.get('token');
  if (!token) {
    console.error('No token found');
    return null;
  }

  try {
    const user = (await doGraphQLFetch(apiUrl, checkToken, {}, token)) as User;
    console.log('user', user);
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}
