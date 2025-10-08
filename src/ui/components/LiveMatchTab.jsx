import React, { useState, useEffect } from 'react';
import {
	FaSyncAlt,
	FaGamepad,
	FaClock,
	FaUsers,
	FaBan,
	FaMapMarkerAlt,
	FaExclamationTriangle,
} from 'react-icons/fa';
import { useData } from '../contexts/DataContext';

export default function LiveMatchTab() {
	const { userCredentials, accountData, champions, isDataLoaded } = useData();

	const [liveMatch, setLiveMatch] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [error, setError] = useState(null);
	const [lastUpdated, setLastUpdated] = useState(null);

	useEffect(() => {
		if (isDataLoaded && accountData) {
			handleRefresh();
		}
	}, [isDataLoaded, accountData]);

	const handleRefresh = async () => {
		if (!accountData) {
			setError('No account data available');
			return;
		}

		setIsRefreshing(true);
		setError(null);

		try {
			const response = await window.riot.getLiveMatch(accountData.puuid);

			if (response.ok === false) {
				if (
					response.message.includes('404') ||
					response.message.includes('Not Found')
				) {
					setLiveMatch(null);
					setError('No active game found');
				} else {
					setError(response.message || 'Failed to fetch live match data');
				}
			} else {
				setLiveMatch(response);
				setError(null);
				setLastUpdated(new Date());
			}
		} catch (err) {
			console.error('Error fetching live match:', err);
			setError('Failed to fetch live match data');
		} finally {
			setIsRefreshing(false);
			setIsLoading(false);
		}
	};

	const formatGameDuration = (gameLength) => {
		const minutes = Math.floor(gameLength / 60);
		const seconds = gameLength % 60;
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	};

	const formatLastUpdated = (date) => {
		if (!date) return '';
		const now = new Date();
		const diff = Math.floor((now - date) / 1000);
		if (diff < 60) return 'Just now';
		if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
		return `${Math.floor(diff / 3600)}h ago`;
	};

	const getGameModeDisplay = (gameMode, gameType) => {
		const modeMap = {
			CLASSIC: "Summoner's Rift",
			ARAM: 'ARAM',
			TUTORIAL: 'Tutorial',
			URF: 'URF',
			DOOMBOTSTEEMO: 'Doom Bots',
			ONEFORALL: 'One For All',
			ASCENSION: 'Ascension',
			FIRSTBLOOD: 'Snowdown Showdown',
			KINGPORO: 'Legend of the Poro King',
			SIEGE: 'Nexus Siege',
			ASSASSINATE: 'Blood Hunt Assassin',
			ARSR: "All Random Summoner's Rift",
			DARKSTAR: 'Dark Star: Singularity',
			STARGUARDIAN: 'Star Guardian Invasion',
			PROJECT: 'PROJECT: Hunters',
			GAMEMODEX: 'Nexus Blitz',
			ODYSSEY: 'Odyssey: Extraction',
			NEXUSBLITZ: 'Nexus Blitz',
			ULTBOOK: 'Ultimate Spellbook',
		};
		return modeMap[gameMode] || gameMode;
	};

	const getChampionById = (championId) => {
		if (!champions) return null;
		return Object.values(champions).find(
			(champ) => champ.key === championId.toString()
		);
	};

	const getCurrentUserParticipant = () => {
		if (!liveMatch || !accountData) return null;
		return liveMatch.participants.find((p) => p.puuid === accountData.puuid);
	};

	const getTeamParticipants = (teamId) => {
		if (!liveMatch) return [];
		return liveMatch.participants.filter((p) => p.teamId === teamId);
	};

	const renderParticipant = (participant, isCurrentUser = false) => {
		const champion = getChampionById(participant.championId);

		return (
			<div
				key={participant.puuid}
				className={`participant-row ${isCurrentUser ? 'current-user' : ''}`}>
				<div className="participant-champion">
					<div className="champion-icon-container">
						{champion ? (
							<img
								src={`https://ddragon.leagueoflegends.com/cdn/${window.api.getVersion()}/img/champion/${
									champion.id
								}.png`}
								alt={champion.name}
								className="champion-icon"
							/>
						) : (
							<div className="champion-placeholder">?</div>
						)}
					</div>
					<span className="champion-name">
						{champion ? champion.name : `Champion ${participant.championId}`}
					</span>
				</div>

				<div className="participant-summoners">
					<img
						src={`https://ddragon.leagueoflegends.com/cdn/${window.api.getVersion()}/img/spell/Summoner${getSummonerSpellName(
							participant.spell1Id
						)}.png`}
						alt="Summoner Spell 1"
						className="summoner-spell"
					/>
					<img
						src={`https://ddragon.leagueoflegends.com/cdn/${window.api.getVersion()}/img/spell/Summoner${getSummonerSpellName(
							participant.spell2Id
						)}.png`}
						alt="Summoner Spell 2"
						className="summoner-spell"
					/>
				</div>

				{isCurrentUser && (
					<div className="you-indicator">
						<span>YOU</span>
					</div>
				)}
			</div>
		);
	};

	const getSummonerSpellName = (spellId) => {
		const spellMap = {
			1: 'Boost',
			3: 'Exhaust',
			4: 'Flash',
			6: 'Haste',
			7: 'Heal',
			11: 'Smite',
			12: 'Teleport',
			13: 'Mana',
			14: 'Dot',
			21: 'Barrier',
			30: 'PoroRecall',
			31: 'PoroThrow',
			32: 'Snowball',
			39: 'SnowURFSnowball_Mark',
		};
		return spellMap[spellId] || 'Flash';
	};

	const renderTeam = (teamId, teamName) => {
		const teamParticipants = getTeamParticipants(teamId);
		const currentUser = getCurrentUserParticipant();

		return (
			<div className="team-section">
				<h3 className="team-title">{teamName}</h3>
				<div className="participants-list">
					{teamParticipants.map((participant) =>
						renderParticipant(
							participant,
							currentUser && participant.puuid === currentUser.puuid
						)
					)}
				</div>
			</div>
		);
	};

	const renderBannedChampions = () => {
		if (!liveMatch.bannedChampions || liveMatch.bannedChampions.length === 0) {
			return <div className="no-bans">No champions banned</div>;
		}

		const team1Bans = liveMatch.bannedChampions.filter(
			(ban) => ban.teamId === 100
		);
		const team2Bans = liveMatch.bannedChampions.filter(
			(ban) => ban.teamId === 200
		);

		return (
			<div className="bans-container">
				<div className="bans-team">
					<h4>Blue Team Bans</h4>
					<div className="bans-list">
						{team1Bans.length > 0 ? (
							team1Bans.map((ban, index) => {
								const champion = getChampionById(ban.championId);
								return (
									<div key={index} className="ban-item">
										{champion ? (
											<img
												src={`https://ddragon.leagueoflegends.com/cdn/${window.api.getVersion()}/img/champion/${
													champion.id
												}.png`}
												alt={champion.name}
												className="banned-champion-icon"
												title={champion.name}
											/>
										) : (
											<div
												className="champion-placeholder"
												title={`Champion ${ban.championId}`}>
												?
											</div>
										)}
									</div>
								);
							})
						) : (
							<span className="no-bans-text">No bans</span>
						)}
					</div>
				</div>
				<div className="bans-team">
					<h4>Red Team Bans</h4>
					<div className="bans-list">
						{team2Bans.length > 0 ? (
							team2Bans.map((ban, index) => {
								const champion = getChampionById(ban.championId);
								return (
									<div key={index} className="ban-item">
										{champion ? (
											<img
												src={`https://ddragon.leagueoflegends.com/cdn/${window.api.getVersion()}/img/champion/${
													champion.id
												}.png`}
												alt={champion.name}
												className="banned-champion-icon"
												title={champion.name}
											/>
										) : (
											<div
												className="champion-placeholder"
												title={`Champion ${ban.championId}`}>
												?
											</div>
										)}
									</div>
								);
							})
						) : (
							<span className="no-bans-text">No bans</span>
						)}
					</div>
				</div>
			</div>
		);
	};

	return (
		<div className="live-match-tab">
			<div className="live-match-header">
				<h1 className="tab-title">Live Match</h1>
				<p className="tab-subtitle">View your current game in real-time</p>

				<div className="live-match-controls">
					<button
						className="action-btn refresh-btn"
						onClick={handleRefresh}
						disabled={isRefreshing}
						title="Refresh live match data">
						<FaSyncAlt className={isRefreshing ? 'spinning' : ''} />
					</button>
					{lastUpdated && (
						<span className="last-updated">
							Last updated: {formatLastUpdated(lastUpdated)}
						</span>
					)}
				</div>
			</div>

			<div className="live-match-content">
				{isLoading && !isRefreshing && (
					<div className="loading-container">
						<div className="loading-spinner"></div>
						<span>Loading live match data...</span>
					</div>
				)}

				{error && (
					<div className="error-container">
						<FaExclamationTriangle className="error-icon" />
						<div className="error-content">
							<h3>Unable to load live match</h3>
							<p>{error}</p>
							<button className="primary-button" onClick={handleRefresh}>
								Try Again
							</button>
						</div>
					</div>
				)}

				{!isLoading && !error && !liveMatch && (
					<div className="no-match-container">
						<FaGamepad className="no-match-icon" />
						<div className="no-match-content">
							<h3>No active game</h3>
							<p>
								You are not currently in a game. Start a match and refresh to
								see live data.
							</p>
							<button className="primary-button" onClick={handleRefresh}>
								<FaSyncAlt />
								Refresh
							</button>
						</div>
					</div>
				)}

				{liveMatch && (
					<div className="live-match-data">
						{/* Game Info */}
						<div className="game-info-section">
							<h2 className="section-title">
								<FaGamepad className="section-icon" />
								Game Information
							</h2>
							<div className="game-info-grid">
								<div className="info-item">
									<FaMapMarkerAlt className="detail-icon" />
									<div className="info-content">
										<span className="info-label">Game Mode</span>
										<span className="info-value">
											{getGameModeDisplay(
												liveMatch.gameMode,
												liveMatch.gameType
											)}
										</span>
									</div>
								</div>
								<div className="info-item">
									<FaClock className="detail-icon" />
									<div className="info-content">
										<span className="info-label">Duration</span>
										<span className="info-value">
											{formatGameDuration(liveMatch.gameLength)}
										</span>
									</div>
								</div>
								<div className="info-item">
									<FaUsers className="detail-icon" />
									<div className="info-content">
										<span className="info-label">Queue Type</span>
										<span className="info-value">
											Queue {liveMatch.gameQueueConfigId}
										</span>
									</div>
								</div>
							</div>
						</div>

						{/* Teams */}
						<div className="teams-section">
							<h2 className="section-title">
								<FaUsers className="section-icon" />
								Teams
							</h2>
							<div className="teams-container">
								{renderTeam(100, 'Blue Team')}
								{renderTeam(200, 'Red Team')}
							</div>
						</div>

						{/* Banned Champions */}
						<div className="bans-section">
							<h2 className="section-title">
								<FaBan className="section-icon" />
								Banned Champions
							</h2>
							{renderBannedChampions()}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
