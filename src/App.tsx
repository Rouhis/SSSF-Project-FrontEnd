import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import LoginView from '../src/views/login';
import RegisterForm from '../src/views/register';
import FacilityManagerMain from './views/facilityManagerMain';
import KeysView from './views/keys';
import OrganizationView from './views/organization';
import EmployeesView from './views/fmEmployees';
import {doGraphQLFetch} from './graphql/fetch';
import {checkToken} from './graphql/queries';
import {useEffect, useState} from 'react';
import Cookies from 'js-cookie';
import EmployeeMain from './views/employeeMain';
import AdminView from './views/admin';

/**
 * App component.
 *
 * @component
 * @returns {JSX.Element} App component.
 */
const App: React.FC = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const [userRoles, setUserRoles] = useState<string[]>([]);

  /**
   * Asynchronously fetches the user token.
   */
  const fetchUserToken = async () => {
    const token = Cookies.get('token');
    if (token) {
      const data = await doGraphQLFetch(apiURL, checkToken, {}, token);
      setUserRoles(data.checkToken.user.role.split(','));
    }
  };

  /**
   * useEffect hook to fetch the user token when the component mounts.
   */
  useEffect(() => {
    fetchUserToken();
  }, []);

  /**
   * Checks if the user has a specific role.
   *
   * @param {string} requiredRole - The required role.
   * @returns {boolean} Whether the user has the required role.
   */
  const hasRole = (requiredRole: string): boolean => {
    return userRoles.includes(requiredRole);
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginView />} />
        <Route path="/register" element={<RegisterForm />} />

        {/* Protected routes with conditional rendering based on roles */}
        <Route
          path="/facilityManagerMain"
          element={
            hasRole('manager') ? <FacilityManagerMain /> : <p>Access Denied</p>
          }
        />
        <Route
          path="/keys"
          element={hasRole('manager') ? <KeysView /> : <p>Access Denied</p>}
        />
        <Route
          path="/organization"
          element={
            hasRole('manager') ? <OrganizationView /> : <p>Access Denied</p>
          }
        />
        <Route
          path="/employees"
          element={
            hasRole('manager') ? <EmployeesView /> : <p>Access Denied</p>
          }
        />
        <Route
          path="/employeeMain"
          element={
            hasRole('user') || hasRole('manager') ? (
              <EmployeeMain />
            ) : (
              <p>Access Denied</p>
            )
          }
        />
        <Route
          path="/adminview"
          element={hasRole('admin') ? <AdminView /> : <p>Access Denied</p>}
        />
      </Routes>
    </Router>
  );
};

export default App;
