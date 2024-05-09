import React, {useEffect, useState, useContext} from 'react';
import {doGraphQLFetch} from '../graphql/fetch';
import {
  keysOut,
  updateUser,
  userById,
  userFromToken,
  usersByOrganization,
} from '../graphql/queries';
import {AuthContext} from '../AuthContext';
import Cookies from 'js-cookie';
import {Key} from '../interfaces/Key';
import {User} from '../interfaces/User';
import '../styles/facilityManagerMain.css';
import {Link} from 'react-router-dom';
import {useNavigate} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faComments} from '@fortawesome/free-solid-svg-icons';
import {Message} from '../interfaces/Message';

const apiURL = import.meta.env.VITE_API_URL;
/**
 * FacilityManagerMain component.
 *
 * @component
 * @returns {JSX.Element} FacilityManagerMain component.
 */
const FacilityManagerMain: React.FC = () => {
  const [keys, setKeys] = useState<Key[]>([]);
  const {token} = useContext(AuthContext);
  const [user, setUser] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedChatUser, setSelectedChatUser] = useState<string>('');
  const [selectedKey, setSelectedKey] = useState<Key | null>(null);
  const [showSettingsPopup, setShowSettingsPopup] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [userId, setUserId] = useState<User | null>(null);
  const [showMessages, setShowMessages] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const websocketUrl = import.meta.env.VITE_WS_URL;
  const navigate = useNavigate();
  const cookieToken = Cookies.get('token');
  /**
   * useEffect hook to handle WebSocket connection and messages.
   *
   * @function
   * @returns {void}
   */
  useEffect(() => {
    if (userId?.id) {
      const wsServer = new WebSocket(websocketUrl + '?userId=' + userId.id);
      setWs(wsServer);
      wsServer.onopen = () => {
        console.log('WebSocket connection opened');
      };
      wsServer.onmessage = (event) => {
        if (event.data) {
          const message = JSON.parse(event.data);
          console.log('Message received:', message.message);
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              sender: userId.id ?? '',
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
  }, [userId?.id]);

  /**
   * Handles the change event for the user selection.
   *
   * @param {React.ChangeEvent<HTMLSelectElement>} event - The change event.
   */
  const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedChatUser(event.target.value);
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
          recipient: selectedChatUser,
          sender: userId?.id,
        }),
      );
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: userId?.id || '',
          recipient: selectedChatUser,
          content: message,
        },
      ]);
    }
  };

  /**
   * Handles user logout.
   */
  const logout = () => {
    // Clear the token
    Cookies.remove('token');
    // Redirect to login page
    navigate('/login');
  };

  /**
   * Handles the submission of the settings form.
   *
   * @param {React.FormEvent} e - The form event.
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
      token || '',
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

  /**
   * Asynchronously gets users by organization.
   */
  const getUsers = async () => {
    const response = await doGraphQLFetch(
      apiURL,
      usersByOrganization,
      {organization: userId?.organization || ''},
      cookieToken,
    );
    setUsers(response.usersByOrganization);
  };

  /**
   * useEffect hook to fetch keys and user data when the component mounts or when the token or cookieToken changes.
   */
  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const data = await doGraphQLFetch(apiURL, keysOut, {
          token: token || Cookies.get('token'),
        });
        setKeys(data.keysOut || []);
        const userResponse = await doGraphQLFetch(
          apiURL,
          userFromToken,
          {},
          cookieToken,
        );
        setUserId(userResponse.userFromToken);
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
  }, [token, cookieToken]);

  /**
   * Current date and time.
   */
  const now = new Date();

  /**
   * Filters keys to find those that are overdue.
   */
  const overdueKeys = keys.filter((key: Key) => {
    const loanedTime = key.loantime ? new Date(key.loantime) : null;
    return loanedTime && now > loanedTime;
  });

  /**
   * Filters keys to find those that are on time (not overdue).
   */
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
                    message.sender === userId?.id ||
                    message.recipient === selectedUser,
                )
                .map((message, index) => {
                  let messageClass = '';
                  if (message.recipient === userId?.id) {
                    messageClass = 'message other';
                  } else if (message.sender === userId?.id) {
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
