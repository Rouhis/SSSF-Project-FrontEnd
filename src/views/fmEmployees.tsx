import React, {useState, useEffect} from 'react';
import '../styles/employeesView.css';
import {Link} from 'react-router-dom';
import {getUser} from '../functions/users';
import {User} from '../interfaces/User';
import {fetchOrganizationByName} from '../functions/organizations';
import {doGraphQLFetch} from '../graphql/fetch';
import {addEmployee, deleteUser, usersByOrganization} from '../graphql/queries';
import {Organization} from '../interfaces/Organization';
import Cookies from 'js-cookie';
/**
 * EmployeesView component.
 *
 * @component
 * @returns {JSX.Element} EmployeesView component.
 */
const EmployeesView: React.FC = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const [employees, setEmployees] = useState<User[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [userOrg, setUserOrg] = useState<Organization | null>(null);
  const [showAddedPopup, setShowAddedPopup] = useState(false);
  const [addedUserPassword, setAddedUserPassword] = useState('');
  /**
   * Asynchronously fetches employees and other necessary data.
   */
  const fetchedEmployess = async () => {
    const {userFromToken} = (await getUser()) as {userFromToken: User | null};
    let usersOrg: Organization | null = null;
    if (userFromToken?.organization) {
      usersOrg = await fetchOrganizationByName(
        apiURL,
        userFromToken.organization || '',
      );
    }
    setUserOrg(usersOrg);
    const data = await doGraphQLFetch(apiURL, usersByOrganization, {
      organization: usersOrg?.organization_name || '',
    });
    setEmployees(data.usersByOrganization || []);
  };
  /**
   * Asynchronously adds a new employee.
   */
  const addnewEmployee = async () => {
    const response = await doGraphQLFetch(
      apiURL,
      addEmployee,
      {
        user: {
          email: newUserEmail,
          user_name: newUserName,
          organization: userOrg?.organization_name || '',
        },
      },
      Cookies.get('token'),
    );
    if (response.registerEmployee.user) {
      // Add the new key to the keys array
      setAddedUserPassword(response.registerEmployee.password);
      alert('Employee added');
      setShowAddPopup(false);
      setShowAddedPopup(true);
    } else {
      alert('Error adding employee ');
    }
  };
  /**
   * Asynchronously deletes an employee.
   */
  const deleteEmployee = async () => {
    const response = await doGraphQLFetch(
      apiURL,
      deleteUser,
      {
        deleteUserId: selectedEmployee?.id,
      },
      Cookies.get('token'),
    );

    if (response.deleteUser) {
      alert('User deleted');
    } else {
      alert('User not deleted');
    }
    setShowDeleteConfirmation(false);

    window.location.reload();
  };
  /**
   * useEffect hook to fetch employees when the component mounts.
   */
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
          <button onClick={() => setShowAddPopup(true)}>Add Employee</button>
          {employees.map((employee) => (
            <div
              key={employee.id}
              className="employee-div"
              onClick={() => {
                setSelectedEmployee(employee);
                setShowPopup(true);
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
          {showAddPopup && (
            <div className="popup" onClick={() => setShowAddPopup(false)}>
              <div
                className="popup-inner"
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <h2>Add Employee</h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <label>
                    Name:
                    <input
                      type="text"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                    />
                  </label>
                  <label>
                    Email:
                    <input
                      type="email"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                    />
                  </label>
                  <button type="submit" onClick={() => addnewEmployee()}>
                    Add
                  </button>
                </form>
              </div>
            </div>
          )}
          {showAddedPopup && (
            <div className="popup2" onClick={() => setShowAddedPopup(false)}>
              <div
                className="popup-inner2"
                onClick={(e) => e.stopPropagation()}
              >
                <h2>User Added</h2>
                <label>
                  Password:
                  <input type="text" readOnly value={addedUserPassword} />
                </label>
                <button onClick={() => setShowAddedPopup(false)}>Close</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeesView;
