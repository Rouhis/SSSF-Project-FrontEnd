import React, {useEffect, useState, useContext} from 'react';
import {Link} from 'react-router-dom';
import '../styles/facilityManagerMain.css';
import {doGraphQLFetch} from '../graphql/fetch';
import {keysOut} from '../graphql/queries';
import {AuthContext} from '../AuthContext';
import Cookies from 'js-cookie';

const apiURL = import.meta.env.VITE_API_URL;

const FacilityManagerMain: React.FC = () => {
  const [keys, setKeys] = useState([]);
  const {token} = useContext(AuthContext);

  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const data = await doGraphQLFetch(apiURL, keysOut, {
          token: token || Cookies.get('token'),
        });
        console.log(data);
        setKeys(data.keysOut || []);
      } catch (error) {
        console.error(error);
        setKeys([]);
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
      <div className="content">
        <div className="division-1">
          {keys.map((key: {id: string; key_name: string}) => (
            <div key={key.id}>
              <p>{key.key_name}</p>
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
