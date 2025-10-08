import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCompass, FaHashtag, FaUser } from 'react-icons/fa6';
import PrimaryButton from '../components/PrimaryButton';

export default function LoginPage() {
	const [username, setUsername] = useState('');
	const [tagLine, setTagLine] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();

	const handleLogin = async (e) => {
		e.preventDefault();

		if (!username.trim() || !tagLine.trim()) {
			return;
		}

		setIsLoading(true);

		try {
			const accountData = await window.riot.getAccount(
				username.trim(),
				tagLine.trim().replace('#', '')
			);

			if (accountData?.ok === false) {
				alert(accountData.message);
				setIsLoading(false);
				return;
			}

			window.storage.setItem('userCredentials', {
				username: username.trim(),
				tagLine: tagLine.trim(),
				puuid: accountData.puuid,
			});

			navigate('/home');
		} catch (error) {
			console.error(error);
			alert('Failed to connect to Riot Games. Please try again.');
		}

		setIsLoading(false);
	};

	return (
		<div className="login-page">
			<div className="login-container">
				<div className="login-header">
					<h1 className="login-title">LoL Compass</h1>
					<p className="login-subtitle">
						Connect your Riot Games account to get started
					</p>
				</div>

				<form className="login-form" onSubmit={handleLogin}>
					<div className="input-row">
						<div className="input-group">
							<label htmlFor="username" className="input-label">
								<FaUser style={{ marginRight: '8px' }} />
								Username
							</label>
							<input
								id="username"
								type="text"
								className="input-field"
								placeholder="GamerPerson"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								disabled={isLoading}
								required
							/>
						</div>

						<div className="input-group">
							<label htmlFor="tagline" className="input-label">
								<FaHashtag style={{ marginRight: '8px' }} />
								Tag
							</label>
							<input
								id="tagline"
								type="text"
								className="input-field"
								placeholder="#0000"
								value={tagLine}
								onChange={(e) => setTagLine(e.target.value)}
								disabled={isLoading}
								required
							/>
						</div>
					</div>

					<PrimaryButton
						type="submit"
						disabled={isLoading || !username.trim() || !tagLine.trim()}
						className="login-button">
						{isLoading ? 'Connecting...' : 'Connect Account'}
					</PrimaryButton>
				</form>
			</div>
		</div>
	);
}
