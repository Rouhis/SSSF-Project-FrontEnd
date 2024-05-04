import React, {useContext, useEffect, useState} from 'react';
import '../styles/keys.css';
import {Link} from 'react-router-dom';
import {doGraphQLFetch} from '../graphql/fetch';
import {addKeys, deleteKeys, keysByOrg, userById} from '../graphql/queries';
import Cookies from 'js-cookie';
import {AuthContext} from '../AuthContext';
import {User} from '../interfaces/User';
import {Key} from '../interfaces/Key';
import {Branch} from '../interfaces/Branch';
import {getUser} from '../functions/users';
import {fetchOrganizationByName} from '../functions/organizations';
import {fetchBranchesByOrg} from '../functions/branches';

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
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const addKey = async () => {
    console.log('selected', selectedBranch);
    const response = await doGraphQLFetch(
      apiURL,
      addKeys,
      {
        key: {
          key_name: keyName,
          branch: selectedBranch,
        },
      },
      Cookies.get('token'),
    );
    console.log('res', response);
    if (response.data) {
      // Add the new key to the keys array
      setKeys((prevKeys) => [...prevKeys, response.data.addKey]);
    }
    setShowAddKeyPopup(false);

    window.location.reload();
  };

  const deleteKey = async () => {
    console.log('selected', selectedBranch);
    const response = await doGraphQLFetch(
      apiURL,
      deleteKeys,
      {
        deleteKeyId: selectedKey?.id,
      },
      Cookies.get('token'),
    );
    console.log('res', response);
    if (response.data) {
      // Add the new key to the keys array
      setKeys((prevKeys) => [...prevKeys, response.data.addKey]);
    }
    setShowAddKeyPopup(false);

    window.location.reload();
  };

  const fetchBranches = async (userOrg: string) => {
    try {
      console.log('org1', userOrg);
      const organization = await fetchOrganizationByName(apiURL, userOrg);
      console.log('org', organization?.id); // Fix: Add null check before accessing the 'id' property
      const branches = await fetchBranchesByOrg(apiURL, organization?.id ?? ''); // Fix: Use nullish coalescing operator to provide a default value of an empty string
      console.log('branches', branches);
      setBranches(branches);
    } catch (error) {
      console.error(error);
      setBranches([]);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const {userFromToken} = (await getUser()) as {userFromToken: User | null}; // Fix: Add type assertion to ensure correct property access
      console.log('user2', userFromToken);
      fetchBranches(userFromToken?.organization ?? ''); // Fix: Add nullish coalescing operator to provide a default value of an empty string
    };

    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const data = await doGraphQLFetch(apiURL, keysByOrg, {
          token: token || Cookies.get('token'),
        });
        console.log(data);
        setKeys(data.keysByOrganization || []);
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
  }, [apiURL, token]);
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
              <p>Branch: {selectedKey?.branch?.branch_name}</p>
              {/* Add more key information here */}
              <button onClick={() => setShowDeleteConfirmation(true)}>
                Delete Key
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
                <button type="submit" onClick={() => deleteKey()}>
                  Submit
                </button>
              </form>
              <button onClick={() => setShowDeleteConfirmation(false)}>
                No
              </button>
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
              <select
                value={selectedBranch}
                onChange={(e) => {
                  console.log('onChange event triggered');
                  setSelectedBranch(e.target.value);
                  console.log('Selected branch id:', e.target.value);
                }}
              >
                <option value="" disabled selected>
                  Choose branch
                </option>
                {branches.map((branchItem, index) => (
                  <option key={index} value={branchItem.id}>
                    {branchItem.branch_name}
                  </option>
                ))}
              </select>
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
