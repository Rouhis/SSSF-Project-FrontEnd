import React, {useState} from 'react';
import '../styles/register.css';
import {doGraphQLFetch} from '../graphql/fetch';
import {register} from '../graphql/queries';
import {useNavigate} from 'react-router-dom';
/**
 * RegisterForm component.
 *
 * @component
 * @returns {JSX.Element} RegisterForm component.
 */
const RegisterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState('');
  const [user_name, setUserName] = useState('');
  const apiURL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  /**
   * Handles the change of the organization input field.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} event - The input field event.
   */
  const handleOrganizationChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setOrganization(event.target.value);
  };

  /**
   * Handles the change of the email input field.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} event - The input field event.
   */
  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  /**
   * Handles the change of the user name input field.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} event - The input field event.
   */
  const handleUserNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(event.target.value);
  };

  /**
   * Handles the change of the password input field.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} event - The input field event.
   */
  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  /**
   * Handles the submission of the registration form.
   *
   * @param {React.FormEvent} e - The form event.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await doGraphQLFetch(apiURL, register, {
        user: {email, password, organization, user_name},
      });
      if (data.registerTestUser) {
        alert('Registration successful');
      } else {
        alert('Error registering user');
      }
      navigate('/login');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="user_name">User Name:</label>
        <input
          type="text"
          id="user_name"
          value={user_name}
          onChange={handleUserNameChange}
        />
      </div>
      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={handleEmailChange}
        />
      </div>
      <div>
        <label htmlFor="organization">Organization:</label>
        <input
          type="text"
          id="organization"
          value={organization}
          onChange={handleOrganizationChange}
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
      <button type="submit">Register</button>
    </form>
  );
};

export default RegisterForm;
