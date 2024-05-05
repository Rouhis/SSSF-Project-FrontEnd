import React, {useEffect, useState, useContext} from 'react';
import {doGraphQLFetch} from '../graphql/fetch';
import {
  checkToken,
  keysByOrg,
  keysOut,
  loanKey,
  userById,
  userFromToken,
} from '../graphql/queries';
import {AuthContext} from '../AuthContext';
import Cookies from 'js-cookie';
import {Key} from '../interfaces/Key';
import {User} from '../interfaces/User';
import '../styles/facilityManagerMain.css';
import {Link} from 'react-router-dom';
import {useNavigate} from 'react-router-dom';

const apiURL = import.meta.env.VITE_API_URL;

const EmployeeMain: React.FC = () => {
  const [keys, setKeys] = useState<Key[]>([]);
  const [user, setUser] = useState<User>();
  const [showPopup, setShowPopup] = useState(false);
  const [selectedKey, setSelectedKey] = useState<Key | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userKeys, setUserKeys] = useState<Key[]>([]);
  const [returnTime, setReturnTime] = useState('');
  const [showReturnPopup, setShowReturnPopup] = useState(false);
  const [returnKey, setReturnKey] = useState<Key | null>(null);
  const navigate = useNavigate();
  const token = Cookies.get('token');

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
      console.log('user', userResponse);
      setUser(userResponse.userFromToken);

      // Filter keys to only include keys where key.user equals user.id
      const userKeys = allKeys.filter(
        (key: Key) => key.user === userResponse.userFromToken.id,
      );
      setKeys(allKeys.filter((key: Key) => key.loaned == false));
      setUserKeys(userKeys);
    };
    fetchKeys();
  }, [apiURL, token]);

  return (
    <div className="main-container">
      <div className="app-bar">
        <Link to="/settings">Settings</Link>
      </div>
      <button
        onClick={logout}
        style={{position: 'absolute', right: '20px', top: '100px'}}
      >
        Logout
      </button>
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
