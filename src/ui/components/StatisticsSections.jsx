import React from 'react';
import { FaTrophy, FaFistRaised, FaGamepad } from 'react-icons/fa';
import { useData } from '../contexts/DataContext';

const StatisticsSections = ({ isRefreshing }) => {
	const { champions, manualMatches, apiMatches, isDataLoaded } = useData();

	const getFilteredMatches = () => {
		return [...manualMatches, ...apiMatches];
	};

	const getChampionWinrates = () => {
		const filteredMatches = getFilteredMatches();
		const championStats = {};

		filteredMatches.forEach((match) => {
			let championName;
			let won;

			if (match.isManual === true) {
				championName = match.championPlayed;
				won = match.result?.toLowerCase() === 'win';
			} else if (match.participant) {
				const champion = Object.values(champions).find(
					(c) => c.key === match.participant.championId.toString()
				);
				championName = champion?.name;
				won = match.participant.win;
			}

			if (!championName || championName === 'Unknown') return;

			if (!championStats[championName]) {
				championStats[championName] = { wins: 0, total: 0 };
			}

			championStats[championName].total++;
			if (won) championStats[championName].wins++;
		});

		return Object.entries(championStats)
			.map(([name, stats]) => ({
				name,
				winrate: (stats.wins / stats.total) * 100,
				games: stats.total,
				wins: stats.wins,
				losses: stats.total - stats.wins,
			}))
			.filter((champ) => champ.games >= 1)
			.sort((a, b) => b.winrate - a.winrate)
			.slice(0, 8);
	};

	const getRoleWinrates = () => {
		const filteredMatches = getFilteredMatches();
		const roleStats = {};

		filteredMatches.forEach((match) => {
			let role;
			let won;

			if (match.isManual === true) {
				role = match.role?.toUpperCase();
				won = match.result?.toLowerCase() === 'win';
			} else if (match.participant) {
				role = match.participant.individualPosition;
				won = match.participant.win;
			}

			if (!role) return;

			const roleMapping = {
				TOP: 'TOP',
				JUNGLE: 'JUNGLE',
				MIDDLE: 'MIDDLE',
				MID: 'MIDDLE',
				BOTTOM: 'BOTTOM',
				ADC: 'BOTTOM',
				UTILITY: 'UTILITY',
				SUPPORT: 'UTILITY',
				ARAM: 'ARAM',
				Invalid: 'ARAM',
			};

			const normalizedRole = roleMapping[role] || role;

			if (!roleStats[normalizedRole]) {
				roleStats[normalizedRole] = { wins: 0, total: 0 };
			}

			roleStats[normalizedRole].total++;
			if (won) roleStats[normalizedRole].wins++;
		});

		return Object.entries(roleStats)
			.map(([name, stats]) => ({
				name,
				winrate: (stats.wins / stats.total) * 100,
				games: stats.total,
				wins: stats.wins,
				losses: stats.total - stats.wins,
			}))
			.filter((role) => role.games >= 1)
			.sort((a, b) => b.winrate - a.winrate);
	};

	const getChampionVsWinrates = () => {
		const filteredMatches = getFilteredMatches();
		const vsStats = {};

		filteredMatches.forEach((match) => {
			let enemyChampion, won;

			if (match.isManual === true) {
				enemyChampion = match.championVs;
				won = match.result?.toLowerCase() === 'win';
			} else if (match.participant && match.participants) {
				const userRole = match.participant?.individualPosition;
				const userTeamId = match.participant?.teamId;

				const roleMap = {
					TOP: ['TOP'],
					JUNGLE: ['JUNGLE'],
					MIDDLE: ['MIDDLE', 'MID'],
					BOTTOM: ['BOTTOM', 'ADC'],
					UTILITY: ['UTILITY', 'SUPPORT'],
					Invalid: ['ARAM'],
				};

				const possibleRoles = roleMap[userRole] || [userRole];
				const opponent = match.participants?.find(
					(p) =>
						p.teamId !== userTeamId &&
						possibleRoles.includes(p.individualPosition)
				);

				if (opponent) {
					const champion = Object.values(champions).find(
						(c) => c.key === opponent.championId?.toString()
					);
					enemyChampion = champion?.name;
				}
				won = match.participant.win;
			}

			if (!enemyChampion || enemyChampion === 'Unknown') return;

			if (!vsStats[enemyChampion]) {
				vsStats[enemyChampion] = { wins: 0, total: 0 };
			}

			vsStats[enemyChampion].total++;
			if (won) vsStats[enemyChampion].wins++;
		});

		return Object.entries(vsStats)
			.map(([name, stats]) => ({
				name,
				winrate: (stats.wins / stats.total) * 100,
				games: stats.total,
				wins: stats.wins,
				losses: stats.total - stats.wins,
			}))
			.filter((champ) => champ.games >= 1)
			.sort((a, b) => b.winrate - a.winrate)
			.slice(0, 8);
	};

	const championWinrates = getChampionWinrates();
	const roleWinrates = getRoleWinrates();
	const championVsWinrates = getChampionVsWinrates();

	return (
		<div className="statistics-sections">
			<div className="stat-section">
				<h3 className="stat-title">
					<FaTrophy className="stat-icon" />
					Champion Winrates
				</h3>
				<div className="champion-stats-list">
					{isRefreshing ? (
						<div className="section-loading">
							<div className="loading-spinner small"></div>
							<p>Loading stats...</p>
						</div>
					) : championWinrates.length > 0 ? (
						championWinrates.map((champ, index) => {
							const champion = Object.values(champions).find(
								(c) => c.name === champ.name
							);
							return (
								<div key={index} className="champion-stat-item">
									<div className="champion-stat-info">
										{champion && (
											<img
												src={`https://ddragon.leagueoflegends.com/cdn/${window.api.getVersion()}/img/champion/${
													champion.id
												}.png`}
												alt={champion.name}
												className="champion-stat-icon"
											/>
										)}
										<div className="champion-stat-details">
											<span className="champion-stat-name">{champ.name}</span>
											<span className="champion-stat-games">
												{champ.games} games
											</span>
										</div>
									</div>
									<div className="champion-stat-winrate">
										<span
											className={`winrate-text ${
												champ.winrate >= 60
													? 'high'
													: champ.winrate >= 40
													? 'medium'
													: 'low'
											}`}>
											{champ.winrate.toFixed(1)}%
										</span>
									</div>
								</div>
							);
						})
					) : (
						<div className="no-data">
							No champion data available for analysis
						</div>
					)}
				</div>
			</div>

			<div className="stat-section">
				<h3 className="stat-title">
					<FaFistRaised className="stat-icon" />
					Winrate vs Champions
				</h3>
				<div className="champion-vs-list">
					{isRefreshing ? (
						<div className="section-loading">
							<div className="loading-spinner small"></div>
							<p>Loading matchups...</p>
						</div>
					) : championVsWinrates.length > 0 ? (
						championVsWinrates.map((vsChamp, index) => {
							const champion = Object.values(champions).find(
								(c) => c.name === vsChamp.name
							);
							return (
								<div key={index} className="champion-vs-item">
									<div className="champion-vs-info">
										{champion && (
											<img
												src={`https://ddragon.leagueoflegends.com/cdn/${window.api.getVersion()}/img/champion/${
													champion.id
												}.png`}
												alt={champion.name}
												className="champion-vs-icon"
											/>
										)}
										<div className="champion-vs-details">
											<span className="champion-vs-name">
												vs {vsChamp.name}
											</span>
											<span className="champion-vs-record">
												{vsChamp.wins}W - {vsChamp.losses}L
											</span>
										</div>
									</div>
									<div className="champion-vs-winrate">
										<span
											className={`winrate-text ${
												vsChamp.winrate >= 60
													? 'high'
													: vsChamp.winrate >= 40
													? 'medium'
													: 'low'
											}`}>
											{vsChamp.winrate.toFixed(1)}%
										</span>
									</div>
								</div>
							);
						})
					) : (
						<div className="no-data">
							No matchup data available for analysis
						</div>
					)}
				</div>
			</div>
			
			<div className="stat-section">
				<h3 className="stat-title">
					<FaGamepad className="stat-icon" />
					Role Performance
				</h3>
				<div className="role-stats-list">
					{isRefreshing ? (
						<div className="section-loading">
							<div className="loading-spinner small"></div>
							<p>Loading role stats...</p>
						</div>
					) : roleWinrates.length > 0 ? (
						roleWinrates.map((role, index) => {
							const roleDisplayNames = {
								TOP: 'Top Lane',
								JUNGLE: 'Jungle',
								MIDDLE: 'Mid Lane',
								MID: 'Mid Lane',
								BOTTOM: 'Bot Lane',
								ADC: 'Bot Lane',
								UTILITY: 'Support',
								SUPPORT: 'Support',
								ARAM: 'ARAM',
								Invalid: 'ARAM',
							};

							return (
								<div key={index} className="role-stat-item">
									<div className="role-stat-info">
										<div className="role-stat-details">
											<span className="role-stat-name">
												{roleDisplayNames[role.name] || role.name}
											</span>
											<span className="role-stat-games">
												{role.games} games
											</span>
										</div>
									</div>
									<div className="role-stat-winrate">
										<span
											className={`winrate-text ${
												role.winrate >= 60
													? 'high'
													: role.winrate >= 40
													? 'medium'
													: 'low'
											}`}>
											{role.winrate.toFixed(1)}%
										</span>
									</div>
								</div>
							);
						})
					) : (
						<div className="no-data">No role data available for analysis</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default StatisticsSections;
