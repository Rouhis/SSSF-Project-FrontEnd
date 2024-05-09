import React, {useEffect, useState} from 'react';
import {doGraphQLFetch} from '../graphql/fetch';
import {
  keysByOrg,
  loanKey,
  updateUser,
  userFromToken,
  usersByOrganization,
} from '../graphql/queries';
import Cookies from 'js-cookie';
import {Key} from '../interfaces/Key';
import '../styles/facilityManagerMain.css';
import {useNavigate} from 'react-router-dom';
import {User} from '../interfaces/User';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faComments} from '@fortawesome/free-solid-svg-icons';
import {Message} from '../interfaces/Message';

const apiURL = import.meta.env.VITE_API_URL;
/**
 * EmployeeMain component.
 *
 * @component
 * @returns {JSX.Element} EmployeeMain component.
 */
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
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [userId, setUserId] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showMessages, setShowMessages] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();
  const token = Cookies.get('token') || '';
  const websocketUrl = import.meta.env.VITE_WS_URL;
  /**
   * useEffect hook to handle WebSocket connection and messages.
   *
   * @function
   * @returns {void}
   */
  useEffect(() => {
    if (userId) {
      const wsServer = new WebSocket(websocketUrl + '?userId=' + userId);
      setWs(wsServer);
      wsServer.onopen = () => {
        console.log('WebSocket connection opened');
      };
      wsServer.onmessage = (event) => {
        if (event.data) {
          const message = JSON.parse(event.data);
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              sender: userId,
              recipient: message.recipient,
              content: message.content,
            },
          ]);
        }
      };
      wsServer.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      wsServer.onclose = () => {
        console.log('WebSocket connection closed');
      };
    }
  }, [userId]);

  /**
   * Handles the change event for the user selection.
   *
   * @param {React.ChangeEvent<HTMLSelectElement>} event - The change event.
   */
  const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUser(event.target.value);
  };

  /**
   * Handles the opening and closing of messages.
   */
  const handleOpenMessages = () => {
    if (showMessages === false) {
      getUsers();
      setShowMessages(true);
    } else {
      setShowMessages(false);
    }
  };

  /**
   * Handles the submission of the form.
   *
   * @param {React.FormEvent} event - The form event.
   */
  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleSendMessage();
  };

  /**
   * Handles the change event for the input field.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} event - The change event.
   */
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };
  /**
   * Handles sending a message.
   */
  const handleSendMessage = () => {
    if (ws) {
      ws.send(
        JSON.stringify({
          content: message,
          recipient: selectedUser,
          sender: userId,
        }),
      );
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: userId,
          recipient: selectedUser,
          content: message,
        },
      ]);
    }
  };
  /**
   * Asynchronously gets users by organization.
   */
  const getUsers = async () => {
    const response = await doGraphQLFetch(
      apiURL,
      usersByOrganization,
      {organization: user?.organization || ''},
      token,
    );
    setUsers(response.usersByOrganization);
  };
  /**
   * Asynchronously updates the user information.
   */
  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Code to change the username and password
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
    try {
      const result = await response;
      console.log('Promise is fulfilled', result);
      alert('Information updated');
    } catch (error) {
      console.log('Promise is rejected', error);
      alert('Information not updated');
    }
    setShowSettingsPopup(false);
  };
  const logout = () => {
    // Clear the token
    Cookies.remove('token');
    // Redirect to login page
    navigate('/login');
  };
  /**
   * Asynchronously returns keys.
   */
  const returnKeys = async () => {
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
    if (response.loanKey) {
      setShowReturnPopup(false);
      window.location.reload();
    } else {
      alert('Error');
    }
  };
  /**
   * Asynchronously loans keys.
   */
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
    if (response.loanKey) {
      setShowReturnPopup(false);
      window.location.reload();
    } else {
      alert('Error');
    }
  };
  /**
   * useEffect hook to fetch keys and user data when the component mounts or when the token changes.
   */
  useEffect(() => {
    const fetchKeys = async () => {
      const data = await doGraphQLFetch(apiURL, keysByOrg, {
        token: token,
      });
      const allKeys = data.keysByOrganization || [];
      setKeys(allKeys);
      // Fetch user
      const userResponse = await doGraphQLFetch(
        apiURL,
        userFromToken,
        {},
        token,
      );
      setUserId(userResponse.userFromToken.id);
      setUser(userResponse.userFromToken);
      // Filter keys to only include keys where key.user equals user.id
      const userKeys = allKeys.filter(
        (key: Key) =>
          key.user === userResponse.userFromToken.id && key.loaned === true,
      );

      setKeys(allKeys.filter((key: Key) => key.loaned === false));
      setUserKeys(userKeys);
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
      <div>
        <button className="open-messages-button" onClick={handleOpenMessages}>
          <FontAwesomeIcon icon={faComments} />
        </button>

        {showMessages && (
          <div className="message-container">
            <div className="messages">
              <select onChange={handleUserChange}>
                {users.map((user, index) => (
                  <option key={index} value={user.id}>
                    {user.user_name}
                  </option>
                ))}
              </select>

              {messages
                .filter(
                  (message) =>
                    message.sender === userId ||
                    message.recipient === selectedUser,
                )
                .map((message, index) => {
                  let messageClass = '';
                  if (message.recipient === userId) {
                    messageClass = 'message other';
                  } else if (message.sender === userId) {
                    messageClass = 'message';
                  }

                  return (
                    <div key={index} className={messageClass}>
                      <p>{message.content}</p>
                    </div>
                  );
                })}
            </div>
            <form onSubmit={handleFormSubmit}>
              <input type="text" value={message} onChange={handleInputChange} />
              <button type="submit">Send</button>
            </form>
          </div>
        )}
      </div>
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
