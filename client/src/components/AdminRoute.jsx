import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function AdminRoute({ children }) {
    const { me } = useAuth();
    if (!me) return <Navigate to="/login" replace />;
    if (me.role !== 'staff' && me.role !== 'admin') return <Navigate to="/" replace />;
    return children;
}
