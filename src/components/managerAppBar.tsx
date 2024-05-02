import React from 'react';
import {AppBar, Toolbar, Typography, Button} from '@mui/material';
import {Link} from 'react-router-dom';

interface AppBarProps {
  title: string;
}

const ManagerAppBar: React.FC<AppBarProps> = ({title}) => (
  <AppBar position="static" style={{backgroundColor: 'black'}}>
    <Toolbar>
      <Button color="inherit" component={Link} to="/keys">
        Keys
      </Button>
      <Button color="inherit" component={Link} to="/employees">
        Employees
      </Button>
      <Button color="inherit" component={Link} to="/organization">
        Organization
      </Button>
      <Typography variant="h6">{title}</Typography>
    </Toolbar>
  </AppBar>
);

export default ManagerAppBar;
