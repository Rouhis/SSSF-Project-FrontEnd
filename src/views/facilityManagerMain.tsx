import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/facilityManagerMain.css';
const FacilityManagerMain: React.FC = () => {
    return (
        <div className="main-container">
            <div className="app-bar">
                <Link to="/keys">Keys</Link>
                <Link to="/employees">Employees</Link>
                <Link to="/organization">Organization</Link>
            </div>
            <div className="content">
                <div className="division-1">
                    <p>Keys out</p>
                </div>
                <div className="division-2">
                <p>Keys late</p>
                </div>
            </div>
        </div>
    );
};

export default FacilityManagerMain;