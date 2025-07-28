import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLogin from '../Auth/AdminLogin';

function ProtectedAdminRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAuth = async () => {
      const adminToken = localStorage.getItem('adminToken');
      const isAdmin = localStorage.getItem('isAdmin');

      console.log('Checking admin auth...', { adminToken: !!adminToken, isAdmin });

      if (!adminToken || isAdmin !== 'true') {
        console.log('No admin token or isAdmin flag, showing login');
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        console.log('Verifying admin token with backend...');
        // Verify admin token with backend
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify-admin`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        });

        console.log('Backend verification response:', res.status);

        if (res.ok) {
          console.log('Admin token verified, showing admin page');
          setIsAuthenticated(true);
        } else {
          console.log('Admin token invalid, clearing storage');
          // Token is invalid, clear storage
          localStorage.removeItem('adminToken');
          localStorage.removeItem('isAdmin');
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Admin auth check failed:', err);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('isAdmin');
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    };

    checkAdminAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return children;
}

export default ProtectedAdminRoute; 