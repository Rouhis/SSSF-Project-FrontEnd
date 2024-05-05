import React, {useEffect, useState} from 'react';
import {doGraphQLFetch} from '../graphql/fetch';
import {
  keysByOrg,
  loanKey,
  updateUser,
  userFromToken,
} from '../graphql/queries';

import Cookies from 'js-cookie';
import {Key} from '../interfaces/Key';
import '../styles/facilityManagerMain.css';
import {useNavigate} from 'react-router-dom';
import Pusher from 'pusher-js';

const apiURL = import.meta.env.VITE_API_URL;

const EmployeeMain: React.FC = () => {
  const [keys, setKeys] = useState<Key[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedKey, setSelectedKey] = useState<Key | null>(null);
  const [showSettingsPopup, setShowSettingsPopup] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [userKeys, setUserKeys] = useState<Key[]>([]);
  const [returnTime, setReturnTime] = useState('');
  const [showReturnPopup, setShowReturnPopup] = useState(false);
  const [returnKey, setReturnKey] = useState<Key | null>(null);
  const navigate = useNavigate();
  const token = Cookies.get('token');
  const [isKeyLate, setIsKeyLate] = useState(false);
  const [lateKeys, setLateKeys] = useState<Key[]>([]);
  const [userID, setUserID] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);

  const beamsClient = new PushNotifications({
    instanceId: 'YOUR_PUSHER_BEAMS_INSTANCE_ID', // Replace with your actual ID
  });
  const sendKeyLateMessage = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log('sending message');
      ws.send(
        JSON.stringify({
          isKeyLate: true,
        }),
      );
    }
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
      token,
    );
    console.log('res', response);
    setShowSettingsPopup(false);
  };
  const logout = () => {
    // Clear the token or any other cleanup you need to do on logout
    Cookies.remove('token');
    // Redirect to login page
    navigate('/login');
  };
  const returnKeys = async () => {
    console.log(String(Date.now()));
    const response = await doGraphQLFetch(
      apiURL,
      loanKey,
      {
        loanKeyId: returnKey?.id || '',
        key: {
          loantime: Date.now(),
        },
      },
      token,
    );
    console.log('res', response);
    setShowReturnPopup(false);
    window.location.reload();
  };
  const loanKeys = async () => {
    const response = await doGraphQLFetch(
      apiURL,
      loanKey,
      {
        loanKeyId: selectedKey?.id || '',
        key: {
          loantime: returnTime,
        },
      },
      token,
    );
    console.log('res', response);
    setShowPopup(false);
    window.location.reload();
  };
  useEffect(() => {
    // Enable pusher logging - don't include this in production
    Pusher.logToConsole = true;

    const pusher = new Pusher('261d927c11ac3a98f0c4', {
      cluster: 'eu',
    });

    const channel = pusher.subscribe('my-channel');
    channel.bind('my-event', function (data: unknown) {
      alert(JSON.stringify(data));
    });

    // Clean up function
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, []);
  useEffect(() => {
    const fetchKeys = async () => {
      const data = await doGraphQLFetch(apiURL, keysByOrg, {
        token: token,
      });
      const allKeys = data.keysByOrganization || [];
      console.log('allKeys', allKeys);
      setKeys(allKeys);
      // Fetch user
      const userResponse = await doGraphQLFetch(
        apiURL,
        userFromToken,
        {},
        token,
      );
      setUserID(userResponse.userFromToken.id);
      setWs(new WebSocket(`ws://localhost:8080?userID=${userID}`));
      console.log('user', userResponse);
      // Filter keys to only include keys where key.user equals user.id
      const userKeys = allKeys.filter(
        (key: Key) => key.user === userResponse.userFromToken.id,
      );

      setKeys(allKeys.filter((key: Key) => key.loaned == false));
      setUserKeys(userKeys);
      const lateKeys = userKeys.filter(
        (key: Key) => new Date(key.loanedtime as Date) < new Date(),
      );
      console.log('lateKeys', lateKeys);
      setLateKeys(lateKeys);
      if (lateKeys.length > 0) {
        console.log('late');
        setIsKeyLate(true);
        sendKeyLateMessage();
      }
    };
    fetchKeys();
  }, [token]);

  return (
    <div className="main-container">
      <div className="app-bar">
        <button
          onClick={() => {
            setShowSettingsPopup(true);
          }}
        >
          Settings
        </button>
      </div>
      <button
        onClick={logout}
        style={{position: 'absolute', right: '20px', top: '100px'}}
      >
        Logout
      </button>
      {/* ... other JSX ... */}
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
      {/* ... other JSX ... */}
      <div className="content">
        <div className="division-1">
          <p>Loaned keys</p>
          {userKeys.map((key: Key, index: number) => (
            <div
              className="key-div"
              key={userKeys[index].id}
              onClick={() => {
                setReturnKey(key);
                setShowReturnPopup(true);
              }}
            >
              <p>{key.key_name}</p>
              {/* Display other key properties as needed */}
            </div>
          ))}
          {showReturnPopup && returnKey && (
            <div className="popup">
              <h2>{returnKey.key_name}</h2>
              {/* Display other key information as needed */}
              <button onClick={() => returnKeys()}>Return Key</button>
              <button onClick={() => setShowReturnPopup(false)}>Close</button>
            </div>
          )}
        </div>
        <div className="division-2">
          <p>Loan key</p>
          {keys.map((key: Key, index: number) => (
            <div
              className="key-div"
              key={keys[index].id}
              onClick={() => {
                setSelectedKey(key);
                setShowPopup(true); // Show the popup when a key is clicked
              }}
            >
              <p>{key.key_name}</p>
              {/* Display other key properties as needed */}
            </div>
          ))}
          {showPopup && selectedKey && (
            <div className="popup">
              <h2>{selectedKey.key_name}</h2>
              {/* Display other key information as needed */}
              <label>
                Choose return time:
                <input
                  type="datetime-local"
                  onChange={(e) => setReturnTime(e.target.value)}
                />
              </label>
              <button onClick={() => loanKeys()}>Loan Key</button>
              <button onClick={() => setShowPopup(false)}>Close</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeMain;
