import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrophy, FaHome, FaCog, FaChartBar, FaGamepad } from 'react-icons/fa';
import MatchHistoryTab from '../components/MatchHistoryTab';
import LiveMatchTab from '../components/LiveMatchTab';
import SettingsTab from '../components/SettingsTab';
import TopChampions from '../components/TopChampions';
import RecommendedPick from '../components/RecommendedPick';
import StatisticsSections from '../components/StatisticsSections';
import ChampionMasteryPage from './ChampionMasteryPage';
import { useData } from '../contexts/DataContext';

export default function HomePage() {
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState('home');

	const { userCredentials, accountData, isDataLoaded } = useData();

	const [summonerData, setSummonerData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const loadUserData = async () => {
			const credentials = window.storage.getItem('userCredentials');
			if (!credentials) {
				navigate('/');
				return;
			}

			if (userCredentials && accountData) {
				try {
					const summoner = await window.riot.getSummoner(accountData.puuid);
					if (summoner.ok !== false) {
						setSummonerData(summoner);
					}
				} catch (error) {
					console.error('Error loading summoner data:', error);
				}
			}

			setIsLoading(false);
		};

		if (isDataLoaded) {
			loadUserData();
		}
	}, [navigate, userCredentials, accountData, isDataLoaded]);

	const handleLogout = () => {
		window.storage.removeItem('userCredentials');
		navigate('/');
	};

	const renderTabContent = () => {
		switch (activeTab) {
			case 'home':
				return (
					<div className="tab-content">
						<h1 className="tab-title">Account Overview</h1>

						<div className="account-card">
							<div className="profile-section">
								<div className="profile-picture">
									<img
										src={`https://ddragon.leagueoflegends.com/cdn/${window.api.getVersion()}/img/profileicon/${
											summonerData?.profileIconId || 1
										}.png`}
										alt="Profile Icon"
										className="profile-icon"
									/>
								</div>

								<div className="account-info">
									<div className="summoner-name">
										{userCredentials?.username}
										<span className="riot-tag">
											#{userCredentials?.tagLine}
										</span>
									</div>

									{summonerData && (
										<div className="level-badge">
											<FaTrophy className="level-icon" />
											<span className="level-text">
												Level {summonerData.summonerLevel}
											</span>
										</div>
									)}
								</div>
							</div>
						</div>

						<TopChampions />
						<RecommendedPick />
						<StatisticsSections />
					</div>
				);

			case 'matches':
				return <MatchHistoryTab />;

			case 'mastery':
				return <ChampionMasteryPage />;

			case 'live':
				return <LiveMatchTab />;

			case 'settings':
				return <SettingsTab />;

			default:
				return (
					<div className="tab-content">
						<h1 className="tab-title">Coming Soon</h1>
						<p className="tab-subtitle">This feature is under development</p>
					</div>
				);
		}
	};

	if (isLoading) {
		return (
			<div className="home-page">
				<div className="loading-message"></div>
			</div>
		);
	}

	return (
		<div className="home-page">
			<div className="sidebar">
				<div className="sidebar-nav">
					<button
						className={`sidebar-item ${activeTab === 'home' ? 'active' : ''}`}
						onClick={() => setActiveTab('home')}
						title="Home">
						<FaHome size={20} />
					</button>

					<button
						className={`sidebar-item ${
							activeTab === 'mastery' ? 'active' : ''
						}`}
						onClick={() => setActiveTab('mastery')}
						title="Analytics">
						<FaTrophy size={20} />
					</button>

					<button
						className={`sidebar-item ${
							activeTab === 'matches' ? 'active' : ''
						}`}
						onClick={() => setActiveTab('matches')}
						title="Match History">
						<FaChartBar size={20} />
					</button>

					<button
						className={`sidebar-item ${activeTab === 'live' ? 'active' : ''}`}
						onClick={() => setActiveTab('live')}
						title="Live Game">
						<FaGamepad size={20} />
					</button>
				</div>

				<div className="sidebar-bottom">
					<button
						className={`sidebar-item ${
							activeTab === 'settings' ? 'active' : ''
						}`}
						onClick={() => setActiveTab('settings')}
						title="Settings">
						<FaCog size={20} />
					</button>
				</div>
			</div>

			<div className="main-content">{renderTabContent()}</div>
		</div>
	);
}
