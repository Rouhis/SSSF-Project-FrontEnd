import React, {useEffect, useState, useContext} from 'react';
import {doGraphQLFetch} from '../graphql/fetch';
import {keysOut, updateUser, userById} from '../graphql/queries';
import {AuthContext} from '../AuthContext';
import Cookies from 'js-cookie';
import {Key} from '../interfaces/Key';
import {User} from '../interfaces/User';
import '../styles/facilityManagerMain.css';
import {Link} from 'react-router-dom';
import {useNavigate} from 'react-router-dom';

const apiURL = import.meta.env.VITE_API_URL;

const FacilityManagerMain: React.FC = () => {
  const [keys, setKeys] = useState<Key[]>([]);
  const {token} = useContext(AuthContext);
  const [user, setUser] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedKey, setSelectedKey] = useState<Key | null>(null);
  const [showSettingsPopup, setShowSettingsPopup] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();
  const logout = () => {
    // Clear the token or any other cleanup you need to do on logout

    Cookies.remove('token');
    // Redirect to login page
    navigate('/login');
  };
  const handleSettingsSubmit = (e: React.FormEvent) => {
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
    console.log('res', response);
    setShowSettingsPopup(false);
  };
  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const data = await doGraphQLFetch(apiURL, keysOut, {
          token: token || Cookies.get('token'),
        });
        console.log(data);
        setKeys(data.keysOut || []);

        // Fetch users for each key
        const users = await Promise.all(
          data.keysOut.map(async (key: Key) => {
            try {
              return await doGraphQLFetch(apiURL, userById, {
                userByIdId: key.user,
              });
            } catch (error) {
              console.warn(`User not found for key ${key.id}`);
              return null;
            }
          }),
        );

        // Extract the user data from the responses
        const usersData = users.map((response) => {
          if (response?.userById) {
            return response.userById;
          } else {
            return null;
          }
        });
        setUser(usersData);
      } catch (error) {
        console.error(error);
        setKeys([]);
        setUser([]);
      }
    };

    fetchKeys();
  }, [token]);

  const now = new Date();
  const overdueKeys = keys.filter((key: Key) => {
    const loanedTime = key.loantime ? new Date(key.loantime) : null;
    return loanedTime && now > loanedTime;
  });
  const onTimeKeys = keys.filter((key: Key) => !overdueKeys.includes(key));
  return (
    <div className="main-container">
      <div className="app-bar">
        <Link to="/keys">Keys</Link>
        <Link to="/employees">Employees</Link>
        <Link to="/organization">Organization</Link>
        <button
          className="settings-button"
          onClick={() => setShowSettingsPopup(true)}
        >
          Settings
        </button>
      </div>
      <button
        onClick={() => {
          logout();
        }}
        style={{position: 'absolute', right: '20px', top: '100px'}}
      >
        Logout
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
      <div>
        {selectedUser && selectedKey && (
          <div className="popup">
            <h2>User Information</h2>
            <p>Name: {selectedUser.user_name}</p>
            {/* Add more user information here */}

            <h2>Key Information</h2>
            <p>
              Key Name: {selectedKey.key_name}
              {String(selectedKey.loanedtime)}
            </p>
            {/* Add more key information here */}

            <button onClick={() => setSelectedUser(null)}>Close</button>
          </div>
        )}
      </div>
      <div className="content">
        <div className="division-1">
          <p>Keys out</p>
          {onTimeKeys.map((key: Key) => {
            const associatedUser =
              user.find((user) => user.id === key.user) ?? null;
            return (
              <div
                key={key.id}
                className="key-div"
                onClick={() => {
                  setSelectedUser(associatedUser);
                  setSelectedKey(key);
                }}
              >
                <p>{key.key_name}</p>
              </div>
            );
          })}
        </div>
        <div className="division-2">
          <p>Keys late</p>
          {overdueKeys.map((key: Key) => {
            const associatedUser =
              user.find((user) => user.id === key.user) ?? null;
            return (
              <div
                key={key.id}
                className="key-div"
                onClick={() => {
                  setSelectedUser(associatedUser);
                  setSelectedKey(key);
                }}
              >
                <p>{key.key_name}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FacilityManagerMain;
