import React, {useEffect, useState} from 'react';
import '../styles/facilityManagerMain.css';
import {doGraphQLFetch} from '../graphql/fetch';
import {
  addFM,
  addOrganization,
  getAllOrgs,
  updateUser,
} from '../graphql/queries';
import {Organization} from '../interfaces/Organization';
import Cookies from 'js-cookie';
import {useNavigate} from 'react-router-dom';
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
  const token = Cookies.get('token');
  const navigate = useNavigate();

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Code to change the username and password goes here
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
    if (await response) {
      alert('Settings updated');
    }

    setShowSettingsPopup(false);
  };
  const logout = () => {
    // Clear the token or any other cleanup you need to do on logout
    Cookies.remove('token');
    // Redirect to login page
    navigate('/login');
  };

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Generate a new password for the user
    addFacilityManager();
    setShowPasswordPopup(true);
  };

  const handleOrgFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    addOrg();
    setShowAddOrgPopup(false);
  };

  const addOrg = async () => {
    // Add organization logic goes here
    const response = await doGraphQLFetch(
      apiURL,
      addOrganization,
      {
        organization: {
          organization_name: newOrgName,
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

  const addFacilityManager = async () => {
    // Add facility manager logic goes here
    const response = await doGraphQLFetch(
      apiURL,
      addFM,
      {
        user: {
          email: newUserEmail,
          user_name: newUserName,
          organization: currentOrg?.organization_name || '',
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

  useEffect(() => {
    const fetchOrgs = async () => {
      const orgs = await doGraphQLFetch(apiURL, getAllOrgs, {});
      setOrganizations(orgs.organizations);
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
              {/* Display other organization properties as needed */}
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
          {/* Form to add facility manager goes here */}
          <button onClick={() => setShowAddFacilityManagerPopup(false)}>
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminView;
