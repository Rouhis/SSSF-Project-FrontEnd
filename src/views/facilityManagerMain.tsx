import React, {useEffect, useState, useContext} from 'react';
import {Link} from 'react-router-dom';
import '../styles/facilityManagerMain.css';
import {doGraphQLFetch} from '../graphql/fetch';
import {keysOut, userById} from '../graphql/queries';
import {AuthContext} from '../AuthContext';
import Cookies from 'js-cookie';
import {Key} from '../interfaces/Key';
import {User} from '../interfaces/User';

const apiURL = import.meta.env.VITE_API_URL;

const FacilityManagerMain: React.FC = () => {
  const [keys, setKeys] = useState<Key[]>([]);
  const {token} = useContext(AuthContext);
  const [user, setUser] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedKey, setSelectedKey] = useState<Key | null>(null);
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
          data.keysOut.map((key: Key) =>
            doGraphQLFetch(apiURL, userById, {
              userByIdId: key.user,
            }),
          ),
        );

        // Extract the user data from the responses
        const usersData = users.map((response) => response.userById);
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
        <Link to="/keys">Keys</Link>
        <Link to="/employees">Employees</Link>
        <Link to="/organization">Organization</Link>
      </div>
      <div>
          {selectedUser && selectedKey && (
            <div className="popup">
              <h2>User Information</h2>
              <p>Name: {selectedUser.user_name}</p>
              {/* Add more user information here */}

              <h2>Key Information</h2>
              <p>Key Name: {selectedKey.key_name}</p>
              {/* Add more key information here */}

              <button onClick={() => setSelectedUser(null)}>Close</button>
            </div>
          )}
        </div>
      <div className="content">
        <div className="division-1">
          <p>Keys out</p>
          {user.map((user: User, index: number) => (
            <div
              key={keys[index].id}
              className="key-div"
              onClick={() => {
                setSelectedUser(user);
                setSelectedKey(keys[index]);
              }}
            >
              <p>
                {keys[index].key_name} {user.user_name}
              </p>
            </div>
          ))}
        </div>
        <div className="division-2">
          <p>Keys late</p>
        </div>
      </div>
    </div>
  );
};

export default FacilityManagerMain;
