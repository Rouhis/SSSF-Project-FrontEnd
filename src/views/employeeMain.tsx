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
  const [showNotification, setShowNotification] = useState(false);
  const WebSocketUrl = import.meta.env.VITE_WS_URL;
  const sendKeyLateMessage = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log('sending message late key', lateKeys[0].id);
      ws.send(
        JSON.stringify({
          isKeyLate: true,
        }),
      );
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isKeyLate) {
      setShowNotification(true);
      timer = setTimeout(() => {
        setShowNotification(false);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [isKeyLate]);

  useEffect(() => {
    if (ws) {
      console.log('WebSocket ready state:', ws.readyState);
      ws.onmessage = (event) => {
        if (event.data) {
          console.log('Received message from server:', event.data);
          // Parse the JSON data and handle the message content
          const message = JSON.parse(event.data);
          // Handle the message based on its type (e.g., display notification, update UI)
          console.log('message', message);
          if (message.message === 'Key is late') {
            setIsKeyLate(true);
          }
        }
      };
    }
  }, [ws]); // Depend on ws state

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
      setWs(new WebSocket(`${WebSocketUrl}?userID=${userID}`));
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
      {showNotification && (
        <div
          className="notification"
          style={{
            position: 'fixed',
            top: '100px',
            left: '50px', // Changed from right to left
            zIndex: 1000,
            backgroundColor: '#333',
            color: '#ffcccc', // Light red text (complementary)
            padding: '10px',
            borderRadius: '5px',
            boxShadow: '0px 8px 16px 0px rgba(0,0,0,0.2)',
            fontFamily: 'Arial, sans-serif',
            fontSize: '16px',
            fontWeight: 'bold',
            display: 'flex', // Added for icon placement
            alignItems: 'center', // Added for icon placement
          }}
        >
          Key is late
        </div>
      )}
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
