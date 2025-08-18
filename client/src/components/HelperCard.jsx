import { Link } from 'react-router-dom';

export default function HelperCard({ h, shortlisted, onToggle }) {
    return (
        <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
            <h3 style={{ margin: '4px 0' }}>
                {h.name} <small>({h.nationality})</small>
            </h3>
            <div style={{ fontSize: 13, color: '#555' }}>
                <div>Experience: {h.experience} yr(s)</div>
                <div>Skills: {Array.isArray(h.skills) ? h.skills.join(', ') : '-'}</div>
                <div>Availability: {h.availability ? 'Available' : 'Not available'}</div>
                <div>Expected Salary: {h.expectedSalary ? `S$${h.expectedSalary}` : '-'}</div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <Link to={`/helpers/${h._id}`}>View profile</Link>
                <button onClick={() => onToggle(h._id)}>
                    {shortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
                </button>
            </div>
        </div>
    );
}
