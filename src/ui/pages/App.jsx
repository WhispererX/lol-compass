import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import LoginPage from './LoginPage';
import HomePage from './HomePage';
import { DataProvider } from '../contexts/DataContext';

export default function App() {
	const [isInitialized, setIsInitialized] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		const checkAutoLogin = async () => {
			const userCredentials = window.storage?.getItem('userCredentials');

			if (userCredentials) {
				try {
					const accountData = await window.riot.getAccount(
						userCredentials.username,
						userCredentials.tagLine
					);

					if (accountData.ok !== false) {
						if (location.pathname === '/') {
							navigate('/home');
						}
					} else {
						window.storage.removeItem('userCredentials');
						if (location.pathname === '/home') {
							navigate('/');
						}
					}
				} catch (error) {
					window.storage.removeItem('userCredentials');
					if (location.pathname === '/home') {
						navigate('/');
					}
				}
			} else {
				if (location.pathname === '/home') {
					navigate('/');
				}
			}

			setIsInitialized(true);
		};

		if (window.storage && window.riot) {
			checkAutoLogin();
		} else {
			setIsInitialized(true);
		}
	}, [navigate, location.pathname]);

	if (!isInitialized) {
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

	return (
		<DataProvider>
			<Routes>
				<Route path="/" element={<LoginPage />} />
				<Route path="/home" element={<HomePage />} />
			</Routes>
		</DataProvider>
	);
}
