import React, {useContext, useEffect, useState} from 'react';
import '../styles/keys.css';
import {Link} from 'react-router-dom';
import {doGraphQLFetch} from '../graphql/fetch';
import {
  addKeys,
  branchesByOrganization,
  checkToken,
  keysByOrg,
  userById,
} from '../graphql/queries';
import Cookies from 'js-cookie';
import {AuthContext} from '../AuthContext';
import {User} from '../interfaces/User';
import {Key} from '../interfaces/Key';
import {Branch} from '../interfaces/Branch';
import {getUser} from '../GetUser';

const KeysView: React.FC = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [showAddKeyPopup, setShowAddKeyPopup] = useState(false);
  const apiURL = import.meta.env.VITE_API_URL;
  const [keys, setKeys] = useState<Key[]>([]);
  const {token} = useContext(AuthContext);
  const [user, setUser] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedKey, setSelectedKey] = useState<Key | null>(null);
  const [keyName, setKeyName] = useState('');
  const [branch, setBranch] = useState('');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [userData, setUserData] = useState<User | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const addKey = async () => {
    const response = await doGraphQLFetch(apiURL, addKeys, {
      key: {
        key_name: keyName,
        branch: branch,
      },
    });
    console.log('res', response.data);
    if (response.data) {
      // Add the new key to the keys array
      setKeys((prevKeys) => [...prevKeys, response.data.addKey]);
    }
    setShowAddKeyPopup(false);
  };

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getUser();
      console.log('user2', userData);
      setUserData(userData);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const data = await doGraphQLFetch(apiURL, keysByOrg, {
          token: token || Cookies.get('token'),
        });
        console.log(data);
        setKeys(data.keysByOrganization || []);
        console.log('org', data.keysByOrganization);
        // Fetch users for each key
        const users = await Promise.all(
          data.keysByOrganization.map((key: Key) =>
            doGraphQLFetch(apiURL, userById, {
              userByIdId: key.user,
            }),
          ),
        );

        console.log(users);
        // Extract the user data from the responses
        const usersData = users.map((response) => response?.userById || null);
        setUser(usersData);
      } catch (error) {
        console.error(error);
        setKeys([]);
        setUser([]);
      }
    };
    fetchKeys();
  }, [token]);
  return (
    <div className="main-container">
      <div className="app-bar">
        <Link to={'/facilitymanagermain'}>Main</Link>
        <Link to={'/organization'}>Organization</Link>
        <Link to={'/employees'}>Employees</Link>
      </div>
      <div className="container">
        <div className="division">
          <p>All keys</p>
          <button onClick={() => setShowAddKeyPopup(true)}>Add Key</button>
          {keys.map((key: Key, index: number) => (
            <div
              key={keys[index].id}
              className="key-div"
              onClick={() => {
                setSelectedUser(user[index]);
                setSelectedKey(key);
                setShowPopup(true); // Show the popup when a key is clicked
              }}
            >
              <p>{keys[index].key_name}</p>
            </div>
          ))}
        </div>
        {showPopup && (
          <div className="popup" onClick={() => setShowPopup(false)}>
            <div className="popup-inner">
              <h2>Key Information</h2>
              <p>Name: {selectedKey?.key_name}</p>
              <p>Loaned: {selectedKey?.loaned}</p>
              <p>Holder: {selectedUser?.user_name}</p>
              {/* Add more key information here */}
            </div>
          </div>
        )}
        {showAddKeyPopup && (
          <div className="popup2">
            <div className="popup-inner2">
              <h2>Add Key</h2>
              <p>Key Name: </p>
              <input
                type="text"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
              />
              <p>Branch: </p>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
              />
              <button type="submit" onClick={addKey}>
                Add Key
              </button>
              <button type="button" onClick={() => setShowAddKeyPopup(false)}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KeysView;
