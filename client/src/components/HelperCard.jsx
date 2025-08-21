// client/src/components/HelperCard.jsx
import { Link } from 'react-router-dom';

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
        <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <img
                src={photo}
                alt={h.name}
                loading="lazy"
                onError={(e) => { e.currentTarget.src = '/placeholder-helper.png'; }}
                style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb', alignSelf: 'center' }}
            />

            <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                <h3 style={{ margin: 0, fontSize: 16 }}>{h.name}</h3>
                <span style={{ color: '#666', fontSize: 13 }}>
                    {h.age ? `${h.age} yrs` : ''}{h.age && h.nationality ? ' • ' : ''}{h.nationality || ''}
                </span>
            </div>

            <div style={{ color: '#555', fontSize: 13 }}>
                {Array.isArray(h.skills) && h.skills.length ? h.skills.slice(0, 4).join(', ') : '—'}
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                <Link to={`/helpers/${h._id}`} style={{ fontSize: 14 }}>View</Link>
                <span style={{ marginLeft: 'auto', fontSize: 13, color: h.availability ? 'green' : '#999' }}>
                    {h.availability ? 'Available' : 'Not available'}
                </span>
                <button onClick={() => onToggle(h._id)} style={{ fontSize: 14 }}>
                    {shortlisted ? '★ Shortlisted' : '☆ Shortlist'}
                </button>
            </div>
        </div>
    );
}
