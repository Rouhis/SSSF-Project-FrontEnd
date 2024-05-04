import React, {useEffect, useState, useContext} from 'react';
import {doGraphQLFetch} from '../graphql/fetch';
import {keysOut, userById} from '../graphql/queries';
import {AuthContext} from '../AuthContext';
import Cookies from 'js-cookie';
import {Key} from '../interfaces/Key';
import {User} from '../interfaces/User';
import '../styles/facilityManagerMain.css';
import {Link} from 'react-router-dom';

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
    const loanedTime = key.loantime ? new Date(key.loantime) : new Date();
    return now > loanedTime;
  });
  const onTimeKeys = keys.filter((key: Key) => !overdueKeys.includes(key));

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
          {onTimeKeys.map((key: Key, index: number) => (
            <div
              key={keys[index].id}
              className="key-div"
              onClick={() => {
                setSelectedUser(user[index]);
                setSelectedKey(key);
              }}
            >
              <p>{keys[index].key_name}</p>
            </div>
          ))}
        </div>
        <div className="division-2">
          <p>Keys late</p>
          {overdueKeys.map((key: Key, index: number) => (
            <div
              key={key.id}
              className="key-div"
              onClick={() => {
                setSelectedUser(user[index]);
                setSelectedKey(key);
              }}
            >
              <p>
                {key.key_name} {user[index] && user[index].user_name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FacilityManagerMain;
