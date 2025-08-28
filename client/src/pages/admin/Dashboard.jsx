import { Outlet, Link } from 'react-router-dom';
export default function Dashboard() {
    return (
        <div>
            <h2>Admin Dashboard</h2>
            <nav style={{ marginBottom: 16 }}>
                <Link to="helpers">Manage Helpers</Link> |
                <Link to="users" style={{ marginLeft: 8 }}>Manage Users</Link>
            </nav>
            <Outlet />
        </div>
    );
}
