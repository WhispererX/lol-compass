import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	FaCog,
	FaGlobe,
	FaServer,
	FaDownload,
	FaSignOutAlt,
	FaCheck,
	FaSpinner,
	FaExclamationTriangle,
} from 'react-icons/fa';

export default function SettingsTab() {
	const navigate = useNavigate();

	const [region, setRegion] = useState('');
	const [subRegion, setSubRegion] = useState('');
	const [version, setVersion] = useState('');

	const [isUpdatingVersion, setIsUpdatingVersion] = useState(false);
	const [versionUpdateSuccess, setVersionUpdateSuccess] = useState(false);
	const [versionUpdateError, setVersionUpdateError] = useState(null);

	const regionOptions = {
		americas: 'Americas',
		asia: 'Asia',
		europe: 'Europe',
		sea: 'Southeast Asia',
	};

	const subRegionOptions = {
		americas: {
			br1: 'Brazil',
			la1: 'Latin America North',
			la2: 'Latin America South',
			na1: 'North America',
			oc1: 'Oceania',
		},
		asia: {
			jp1: 'Japan',
			kr: 'Korea',
		},
		europe: {
			eun1: 'Europe Nordic & East',
			euw1: 'Europe West',
			tr1: 'Turkey',
			ru: 'Russia',
		},
		sea: {
			ph2: 'Philippines',
			sg2: 'Singapore',
			th2: 'Thailand',
			tw2: 'Taiwan',
			vn2: 'Vietnam',
		},
    };
    
	useEffect(() => {
		setRegion(window.api.getRegion());
		setSubRegion(window.api.getSubRegion());
		setVersion(window.api.getVersion());
	}, []);

	const handleRegionChange = (newRegion) => {
		setRegion(newRegion);
		window.api.setRegion(newRegion);

		const availableSubRegions = Object.keys(subRegionOptions[newRegion] || {});
		if (availableSubRegions.length > 0) {
			const newSubRegion = availableSubRegions[0];
			setSubRegion(newSubRegion);
			window.api.setSubRegion(newSubRegion);
		}
	};

	const handleSubRegionChange = (newSubRegion) => {
		setSubRegion(newSubRegion);
		window.api.setSubRegion(newSubRegion);
	};

	const handleUpdateVersion = async () => {
		setIsUpdatingVersion(true);
		setVersionUpdateError(null);
		setVersionUpdateSuccess(false);

		try {
			const latestVersion = await window.riot.getLatestVersion();
			setVersion(latestVersion);
			window.api.setVersion(latestVersion);
			setVersionUpdateSuccess(true);

			setTimeout(() => {
				setVersionUpdateSuccess(false);
			}, 3000);
		} catch (error) {
			console.error('Error fetching latest version:', error);
			setVersionUpdateError('Failed to fetch latest version');
		} finally {
			setIsUpdatingVersion(false);
		}
	};

	const handleLogout = () => {
		window.storage.clear();
		navigate('/');
	};

	return (
		<div className="settings-tab">
			<div className="settings-header">
				<h1 className="tab-title">Settings</h1>
				<p className="tab-subtitle">Configure your application preferences</p>
			</div>

			<div className="settings-content">
				<div className="settings-section">
					<h2 className="section-title">
						<FaGlobe className="section-icon" />
						Region Configuration
					</h2>
					<p className="section-description">
						Select your League of Legends region and server for accurate data
						fetching.
					</p>

					<div className="settings-form">
						<div className="form-row">
							<div className="form-group">
								<label htmlFor="region">Region</label>
								<select
									id="region"
									value={region}
									onChange={(e) => handleRegionChange(e.target.value)}>
									{Object.entries(regionOptions).map(([key, label]) => (
										<option key={key} value={key}>
											{label}
										</option>
									))}
								</select>
							</div>

							<div className="form-group">
								<label htmlFor="subregion">Server</label>
								<select
									id="subregion"
									value={subRegion}
									onChange={(e) => handleSubRegionChange(e.target.value)}>
									{Object.entries(subRegionOptions[region] || {}).map(
										([key, label]) => (
											<option key={key} value={key}>
												{label}
											</option>
										)
									)}
								</select>
							</div>
						</div>
					</div>
				</div>

				<div className="settings-section">
					<h2 className="section-title">
						<FaServer className="section-icon" />
						Game Version
					</h2>
					<p className="section-description">
						Update to the latest League of Legends version for accurate champion
						and item data.
					</p>

					<div className="version-section">
						<div className="version-info">
							<span className="version-label">Current Version:</span>
							<span className="version-value">{version}</span>
						</div>

						<button
							className="action-btn version-btn"
							onClick={handleUpdateVersion}
							disabled={isUpdatingVersion}
							title="Fetch latest League of Legends version">
							{isUpdatingVersion ? (
								<FaSpinner className="spinning" />
							) : (
								<FaDownload />
							)}

						</button>
					</div>

					{versionUpdateSuccess && (
						<div className="status-message success">
							<FaCheck className="status-icon" />
							Version updated successfully!
						</div>
					)}

					{versionUpdateError && (
						<div className="status-message error">
							<FaExclamationTriangle className="status-icon" />
							{versionUpdateError}
						</div>
					)}
				</div>

				<div className="settings-section">
					<h2 className="section-title">
						<FaCog className="section-icon" />
						Account
					</h2>
					<p className="section-description">
						Manage your account settings and session.
					</p>

					<div className="account-actions">
						<button
							className="logout-btn"
							onClick={handleLogout}
							title="Logout and return to login screen">
							<FaSignOutAlt className="logout-icon" />
							Logout
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}