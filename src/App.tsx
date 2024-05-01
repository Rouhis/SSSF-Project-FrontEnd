import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import LoginView from '../src/views/login';
import RegisterForm from '../src/views/register';
import FacilityManagerMain from './views/facilityManagerMain';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginView />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/facilityManagerMain" element={<FacilityManagerMain />} />
      </Routes>
    </Router>
  );
};

export default App;
