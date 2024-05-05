import React, {useContext, useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {Branch} from '../interfaces/Branch'; // Replace with your actual import
import {AuthContext} from '../AuthContext';
import {fetchBranchesByOrg} from '../functions/branches';
import {getUser} from '../functions/users';
import {User} from '../interfaces/User';
import {fetchOrganizationByName} from '../functions/organizations';
import '../styles/organization.css';
import {doGraphQLFetch} from '../graphql/fetch';
import {addBranch, deleteBranch} from '../graphql/queries';
import Cookies from 'js-cookie';
import {Organization} from '../interfaces/Organization';

const OrganizationView: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const apiURL = import.meta.env.VITE_API_URL;
  const {token} = useContext(AuthContext);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [showAddBranchPopup, setShowAddBranchPopup] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [userOrg, setUserOrg] = useState<Organization | null>(null);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const addBranches = async () => {
    const response = await doGraphQLFetch(
      apiURL,
      addBranch,
      {
        branch: {
          branch_name: newBranchName,
          organization: userOrg?.id || '',
        },
      },
      Cookies.get('token'),
    );
    console.log('res', response);
    if (response.data) {
      setBranches((prevBranches) => [...prevBranches, response.data.addBranch]);
    }
    setShowAddBranchPopup(false);
    window.location.reload();
  };
  const deleteBranches = async () => {
    console.log('selected', selectedBranch);
    const response = await doGraphQLFetch(
      apiURL,
      deleteBranch,
      {
        deleteBranchId: selectedBranch?.id,
      },
      Cookies.get('token'),
    );
    console.log('res', response);
    if (response) {
      console.log('deleted');
    }
    setShowAddBranchPopup(false);
    window.location.reload();
  };
  useEffect(() => {
    const fetchUserAndBranches = async () => {
      const {userFromToken} = (await getUser()) as {userFromToken: User | null};
      console.log('user', userFromToken);

      if (userFromToken?.organization) {
        const usersOrg = await fetchOrganizationByName(
          apiURL,
          userFromToken.organization || '',
        );
        setUserOrg(usersOrg);
        const fetchedBranches = await fetchBranchesByOrg(
          apiURL,
          usersOrg?.id || '',
        );
        if (fetchedBranches) {
          setBranches(fetchedBranches);
          console.log('branches', fetchedBranches);
        } else {
          console.error('No branches found');
        }
      }
    };

    fetchUserAndBranches();
  }, [apiURL, token]);

  return (
    <div className="main-container">
      <div className="app-bar">
        <Link to={'/facilitymanagermain'}>Main</Link>
        <Link to={'/keys'}>Keys</Link>
        <Link to={'/employees'}>Employees</Link>
      </div>
      <div className="container">
        <div className="division">
          <p>All Branches</p>
          <button
            onClick={() => {
              setShowAddBranchPopup(true);
            }}
          >
            Add Branch
          </button>

          {showAddBranchPopup && (
            <div className="popup2">
              <div className="popup2-inner">
                <h2>Add Branch</h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                  }}
                >
                  <label>
                    Name:
                    <input
                      type="text"
                      value={newBranchName}
                      onChange={(e) => setNewBranchName(e.target.value)}
                    />
                  </label>
                  <button type="submit" onClick={() => addBranches()}>
                    Submit
                  </button>
                </form>
                <button onClick={() => setShowAddBranchPopup(false)}>No</button>
              </div>
            </div>
          )}
          {branches.map((branch: Branch) => (
            <div
              key={branch.id}
              className="branch-div"
              onClick={() => {
                setSelectedBranch(branch);
                setShowPopup(true); // Show the popup when a branch is clicked
              }}
            >
              <p>{branch.branch_name}</p>
            </div>
          ))}

          {showPopup && (
            <div className="popup" onClick={() => setShowPopup(false)}>
              <div className="popup-inner">
                <h2>Branch Information</h2>
                <p>Name: {selectedBranch?.branch_name}</p>
                <p>ID: {selectedBranch?.id}</p>
                <button onClick={() => setShowConfirmPopup(true)}>
                  Delete Branch
                </button>
                {/* Add more branch information here */}
              </div>
            </div>
          )}

          {showConfirmPopup && (
            <div className="popup">
              <p>Are you sure you want to delete this branch?</p>
              <button onClick={() => deleteBranches()}>Yes</button>
              <button onClick={() => setShowConfirmPopup(false)}>No</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizationView;
