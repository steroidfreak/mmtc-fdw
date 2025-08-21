import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';

export default function Verify() {
    const [params] = useSearchParams();
    const [msg, setMsg] = useState('Verifying...');

    useEffect(() => {
        const token = params.get('token');
        if (!token) {
            setMsg('Missing token');
            return;
        }
        api.get(`/auth/verify?token=${token}`)
            .then(() => setMsg('Email verified! You can now log in.'))
            .catch(() => setMsg('Verification failed'));
    }, [params]);

    return <p>{msg}</p>;
}
