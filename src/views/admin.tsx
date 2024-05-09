import React, {useEffect, useState} from 'react';
import '../styles/facilityManagerMain.css';
import {doGraphQLFetch} from '../graphql/fetch';
import {
  addFM,
  addOrganization,
  deleteOrganization,
  getAllOrgs,
  updateUser,
} from '../graphql/queries';
import {Organization} from '../interfaces/Organization';
import Cookies from 'js-cookie';
import {useNavigate} from 'react-router-dom';

/**
 * AdminView component.
 *
 * @component
 * @returns {JSX.Element} AdminView component.
 */
const AdminView: React.FC = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const [showAddOrgPopup, setShowAddOrgPopup] = useState(false);
  const [showAddFacilityManagerPopup, setShowAddFacilityManagerPopup] =
    useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [
    showAddFacilityManagerForOrgPopup,
    setShowAddFacilityManagerForOrgPopup,
  ] = useState(false);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newOrgName, setNewOrgName] = useState('');
  const [showSettingsPopup, setShowSettingsPopup] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showDeleteOrg, setShowDeleteOrg] = useState(false);
  const token = Cookies.get('token');
  const navigate = useNavigate();

  /**
   * Handles the submission of the settings form.
   *
   * @param {React.FormEvent} e - The form event.
   */
  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Call the GraphQL fetch function with the updateUser query
    const response = doGraphQLFetch(
      apiURL,
      updateUser,
      {
        user: {
          user_name: newUsername,
          password: newPassword,
        },
      },
      token || '',
    );
    // If the response is successful, alert the user
    if (await response) {
      alert('Settings updated');
    }

    // Hide the settings popup
    setShowSettingsPopup(false);
  };
  /**
   * Asynchronously deletes an organization.
   *
   * @param {string} orgId - The id of the organization to delete.
   */
  const deleteOrg = async () => {
    const response = await doGraphQLFetch(
      apiURL,
      deleteOrganization,
      {
        deleteOrganizationId: currentOrg?.id,
      },
      token,
    );
    console.log(response);
    if (response.deleteOrganization) {
      alert('Organization deleted');
    } else {
      alert('Failed to delete organization');
    }
  };

  // Function to log out the user
  const logout = () => {
    // Remove the token cookie
    Cookies.remove('token');
    // Navigate to the login page
    navigate('/login');
  };

  /**
   * Handles the submission of the form to add a new facility manager.
   *
   * @param {React.FormEvent} event - The form event.
   */
  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Call the function to add a new facility manager
    addFacilityManager();
    // Show the password popup
    setShowPasswordPopup(true);
  };

  /**
   * Handles the submission of the form to add a new organization.
   *
   * @param {React.FormEvent} event - The form event.
   */
  const handleOrgFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Call the function to add a new organization
    addOrg();
    // Hide the add organization popup
    setShowAddOrgPopup(false);
  };

  /**
   * Asynchronously adds a new organization.
   */
  const addOrg = async () => {
    const response = await doGraphQLFetch(
      apiURL,
      addOrganization,
      {
        organization: {
          organization_name: newOrgName, // The name of the new organization
        },
      },
      token,
    );
    if (response.addOrganization) {
      alert('Organization added');
    } else {
      alert('Organization not added');
    }
  };

  /**
   * Asynchronously adds a new facility manager.
   */
  const addFacilityManager = async () => {
    const response = await doGraphQLFetch(
      apiURL,
      addFM,
      {
        user: {
          email: newUserEmail, // The email of the new facility manager
          user_name: newUserName, // The username of the new facility manager
          organization: currentOrg?.organization_name || '', // The organization of the new facility manager
        },
      },
      token,
    );
    if (response.registerFaciltyManager) {
      setNewUserPassword(response.registerFaciltyManager.password);
    } else {
      alert('Facility Manager not added');
    }
  };

  /**
   * Fetches all organizations when the component mounts.
   */
  useEffect(() => {
    const fetchOrgs = async () => {
      const orgs = await doGraphQLFetch(apiURL, getAllOrgs, {});
      setOrganizations(orgs.organizations); // Set the organizations state
    };
    fetchOrgs();
  }, [apiURL]);
  return (
    <div className="main-container">
      <div className="app-bar">
        <button
          className="settings-button"
          onClick={() => setShowSettingsPopup(true)}
        >
          Settings
        </button>
        {showSettingsPopup && (
          <div className="popup">
            <form onSubmit={handleSettingsSubmit}>
              <label>
                New name:
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
              </label>
              <label>
                New Password:
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </label>
              <button type="submit">Change</button>
            </form>
            <button onClick={() => setShowSettingsPopup(false)}>Close</button>
          </div>
        )}
      </div>
      <button
        onClick={logout}
        style={{position: 'absolute', right: '20px', top: '100px'}}
      >
        Logout
      </button>
      <div className="container">
        <div className="division">
          <h3>Admin View</h3>
          <button onClick={() => setShowAddOrgPopup(true)}>
            Add Organization
          </button>
          {organizations.map((org, index) => (
            <div key={index} className="employee-div">
              <h4>{org.organization_name}</h4>
              <button
                onClick={() => {
                  setCurrentOrg(org);
                  setShowAddFacilityManagerForOrgPopup(true);
                }}
              >
                Add Facility Manager
              </button>
              <button
                onClick={() => {
                  setCurrentOrg(org);
                  setShowDeleteOrg(true);
                }}
              >
                Delete Org
              </button>
            </div>
          ))}
          {showAddFacilityManagerForOrgPopup && currentOrg && (
            <div className="popup">
              <form onSubmit={handleFormSubmit}>
                <label>
                  Username:
                  <input
                    type="text"
                    name="username"
                    required
                    onChange={(e) => setNewUserName(e.target.value)}
                  />
                </label>
                <label>
                  Email:
                  <input
                    type="email"
                    name="email"
                    required
                    onChange={(e) => setNewUserEmail(e.target.value)}
                  />
                </label>
                <input type="submit" value="Submit" />
              </form>
              <button
                onClick={() => setShowAddFacilityManagerForOrgPopup(false)}
              >
                Close
              </button>
            </div>
          )}
          {showDeleteOrg && currentOrg && (
            <div className="popup">
              <h4>
                Are you sure you want to delete {currentOrg.organization_name}?
              </h4>
              <button onClick={() => deleteOrg()}>Yes, delete it</button>
              <button onClick={() => setShowDeleteOrg(false)}>
                No, keep it
              </button>
            </div>
          )}
          {showPasswordPopup && (
            <div className="popup">
              <input type="text" readOnly value={newUserPassword} />
              <button onClick={() => setShowPasswordPopup(false)}>Close</button>
            </div>
          )}
        </div>
      </div>
      {showAddOrgPopup && (
        <div className="popup">
          <form onSubmit={handleOrgFormSubmit}>
            <label>
              Organization Name:
              <input
                type="text"
                name="orgName"
                required
                onChange={(e) => setNewOrgName(e.target.value)}
              />
            </label>
            <input type="submit" value="Submit" />
          </form>
          <button onClick={() => setShowAddOrgPopup(false)}>Close</button>
        </div>
      )}
      {showAddFacilityManagerPopup && (
        <div className="popup">
          <button onClick={() => setShowAddFacilityManagerPopup(false)}>
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminView;
