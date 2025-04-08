import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AuthCallback = () => {
    const location = useLocation();
    const navigate = useNavigate(); 

    useEffect(() => {
        const params = new URLSearchParams(location.search); 
        const token = params.get('token'); 

        console.log("AuthCallback Component: Token from URL:", token); 

        if (token) {
            localStorage.setItem('authToken', token);
            console.log(">>> authToken SAVED to localStorage (Google Login Callback)"); 
            navigate('/dashboard');

        } else {
            console.error("!!! AuthCallback Component: No token found in URL params.");
            navigate('/login?error=google-token-missing');
        }
    }, [location, navigate]); 
    return (
        <div style={{ padding: '50px', textAlign: 'center' }}>
            <h2>Processing authentication...</h2>
            <p>Please wait while we securely log you in.</p>
        </div>
    );
};

export default AuthCallback;