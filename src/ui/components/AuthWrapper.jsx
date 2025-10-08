import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useData } from '../contexts/DataContext';

export default function AuthWrapper({ children }) {
	const navigate = useNavigate();
	const location = useLocation();
	const { isDataLoaded, userCredentials } = useData();

	useEffect(() => {
		if (!isDataLoaded) return;

		if (userCredentials) {
			if (location.pathname === '/') {
				navigate('/home');
			}
		} else {
			if (location.pathname === '/home') {
				navigate('/');
			}
		}
	}, [isDataLoaded, userCredentials, location.pathname, navigate]);

	if (!isDataLoaded) {
		return (
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					height: '100vh',
					background:
						'linear-gradient(135deg, #0f1419 0%, #1e2328 50%, #0f1419 100%)',
					color: 'var(--color-heading)',
					fontSize: '18px',
				}}>
				Loading LoL Compass...
			</div>
		);
	}

	return children;
}
