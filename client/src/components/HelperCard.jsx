// client/src/components/HelperCard.jsx
import { Link } from 'react-router-dom';
import './HelperCard.css';

const API_BASE = import.meta?.env?.VITE_API_BASE_URL || 'http://localhost:4000';

function getPhotoUrl(h) {
    const first = Array.isArray(h?.photos) ? h.photos[0] : null;
    if (!first) return '/placeholder-helper.png';

    // Support string or object {url|path}
    const raw = typeof first === 'string' ? first : first?.url || first?.path || '';
    if (!raw) return '/placeholder-helper.png';

    // If it’s already absolute, use as-is
    if (/^https?:\/\//i.test(raw)) return raw;

    // If it’s your uploads path, prefix with API base
    if (raw.startsWith('/uploads') || raw.startsWith('uploads')) {
        const rel = raw.startsWith('/') ? raw : `/${raw}`;
        return `${API_BASE}${rel}`;
    }

    // Fallback
    return raw;
}

export default function HelperCard({ h, shortlisted, onToggle }) {
    const photo = getPhotoUrl(h);

    return (
        <div className="helper-card">
            <img
                src={photo}
                alt={h.name}
                loading="lazy"
                onError={(e) => { e.currentTarget.src = '/placeholder-helper.png'; }}
            />

            <div className="helper-card-header">
                <h3>{h.name}</h3>
                <span>
                    {h.age ? `${h.age} yrs` : ''}{h.age && h.nationality ? ' • ' : ''}{h.nationality || ''}
                </span>
            </div>

            <div className="helper-card-skills">
                {Array.isArray(h.skills) && h.skills.length ? h.skills.slice(0, 4).join(', ') : '—'}
            </div>

            <div className="helper-card-actions">
                <Link to={`/helpers/${h._id}`}>View</Link>
                <span
                    className="helper-availability"
                    style={{ color: h.availability ? 'green' : '#999' }}
                >
                    {h.availability ? 'Available' : 'Not available'}
                </span>
                <button onClick={() => onToggle(h._id)}>
                    {shortlisted ? '★ Shortlisted' : '☆ Shortlist'}
                </button>
            </div>
        </div>
    );
}
