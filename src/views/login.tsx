import React, {useState} from 'react';
import '../styles/login.css';
import {login} from '../graphql/queries';
import {doGraphQLFetch} from '../graphql/fetch';
import {AuthContext} from '../AuthContext';
import Cookies from 'js-cookie';
import {useNavigate} from 'react-router-dom';

const apiURL = import.meta.env.VITE_API_URL;

const LoginView: React.FC = () => {
  const [username, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const {setToken} = React.useContext(AuthContext) as {
    setToken: (token: string) => void;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(apiURL);
    try {
      const data = await doGraphQLFetch(apiURL, login, {
        credentials: {username, password},
      });
      console.log(data.login);
      setToken(data.login.token);
      Cookies.set('token', data.login.token);
      if (data.login.user.role === 'manager') {
        navigate('/facilitymanagermain');
      }
      if (data.login.user.role === 'admin') {
        navigate('/adminview');
      }
      if (data.login.user.role === 'user') {
        navigate('/employeeview');
      }
    } catch (error) {
      console.error(error);
    }
  };
  const navigateRegister = () => {
    navigate('/register');
  };
  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="username"
            value={username}
            onChange={handleEmailChange}
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={handlePasswordChange}
          />
        </div>
        <button type="submit">Login</button>
        <button type="button" onClick={navigateRegister}>
          Register
        </button>
      </form>
    </div>
  );
};

export default LoginView;
