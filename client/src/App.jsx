import './App.css';
import { Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import HomePage from './pages/HomePage';
import LeaderboardPage from './pages/LeaderboardPage';
import FriendsPage from './pages/FriendsPage';
import ContestPage from './pages/ContestPage';
import AdminPage from './pages/AdminPage';
import ProblemPage from './pages/ProblemPage';
import ProtectedAdminRoute from './components/Admin/ProtectedAdminRoute';

function App() {
  return (
    <Routes>
      
      <Route path="/" element={<AuthPage />} />
      <Route path="/admin" element={
        <ProtectedAdminRoute>
          <AdminPage />
        </ProtectedAdminRoute>
      } />
      <Route path="/dashboard" element={<Dashboard />} >
        <Route index element={<HomePage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="friends" element={<FriendsPage />} />
        <Route path="contest" element={<ContestPage />} />
        <Route path="problem/:id" element={<ProblemPage />} />
      </Route>
    </Routes>
  );
}

export default App;

