import React, {useState, useEffect} from 'react';
import '../styles/employeesView.css';
import {Link} from 'react-router-dom';
import {getUser} from '../functions/users';
import {User} from '../interfaces/User';
import {fetchOrganizationByName} from '../functions/organizations';
import {doGraphQLFetch} from '../graphql/fetch';
import {deleteUser, usersByOrganization} from '../graphql/queries';
import {Organization} from '../interfaces/Organization';
import Cookies from 'js-cookie';
const EmployeesView: React.FC = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const [employees, setEmployees] = useState<User[]>([]);

  const [showPopup, setShowPopup] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  // Fetch employees and other necessary data here...
  const fetchedEmployess = async () => {
    const {userFromToken} = (await getUser()) as {userFromToken: User | null};
    let usersOrg: Organization | null = null;
    if (userFromToken?.organization) {
      usersOrg = await fetchOrganizationByName(
        apiURL,
        userFromToken.organization || '',
      );
    }
    const data = await doGraphQLFetch(apiURL, usersByOrganization, {
      organization: usersOrg?.organization_name || '',
    });
    console.log('data', data);
    setEmployees(data.usersByOrganization || []);
  };
  const deleteEmployee = async () => {
    console.log('selected', selectedEmployee?.id);
    const response = await doGraphQLFetch(
      apiURL,
      deleteUser,
      {
        deleteUserId: selectedEmployee?.id,
      },
      Cookies.get('token'),
    );

    console.log('res', response);
    if (response.data) {
      console.log('deleted');
    }
    setShowDeleteConfirmation(false);

    window.location.reload();
  };
  useEffect(() => {
    fetchedEmployess();
  }, []);
  return (
    <div className="main-container">
      <div className="app-bar">
        <Link to={'/facilitymanagermain'}>Main</Link>
        <Link to={'/keys'}>Keys</Link>
        <Link to={'/organization'}>Organization</Link>
      </div>
      <div className="container">
        <div className="division">
          <h3>Employees</h3>
          {employees.map((employee) => (
            <div
              key={employee.id}
              className="employee-div"
              onClick={() => {
                setSelectedEmployee(employee);
                setShowPopup(true); // Show the popup when a branch is clicked
              }}
            >
              <p>{employee.user_name}</p>
            </div>
          ))}
          {showPopup && (
            <div className="popup" onClick={() => setShowPopup(false)}>
              <div className="popup-inner">
                <h2>Employee Information</h2>
                <p>Name: {selectedEmployee?.user_name}</p>
                <p>ID: {selectedEmployee?.id}</p>
                <button onClick={() => setShowDeleteConfirmation(true)}>
                  Delete Employee
                </button>
              </div>
            </div>
          )}
          {showDeleteConfirmation && (
            <div className="popup2">
              <div className="popup2-inner">
                <h2>Are you sure?</h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                  }}
                >
                  <button type="submit" onClick={() => deleteEmployee()}>
                    Yes
                  </button>
                </form>
                <button onClick={() => setShowDeleteConfirmation(false)}>
                  No
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeesView;
