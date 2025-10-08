import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import HomePage from './HomePage';
import { DataProvider } from '../contexts/DataContext';
import AuthWrapper from '../components/AuthWrapper';

export default function App() {
	return (
		<DataProvider>
			<AuthWrapper>
				<Routes>
					<Route path="/" element={<LoginPage />} />
					<Route path="/home" element={<HomePage />} />
				</Routes>
			</AuthWrapper>
		</DataProvider>
	);
}
