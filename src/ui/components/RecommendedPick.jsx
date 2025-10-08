import React from 'react';
import { FaChartLine } from 'react-icons/fa';
import { useData } from '../contexts/DataContext';

const RecommendedPick = ({ isRefreshing }) => {
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
			.sort((a, b) => b.winrate - a.winrate);
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

	const getRecommendation = () => {
		const championWinrates = getChampionWinrates();
		const roleWinrates = getRoleWinrates();

		if (championWinrates.length === 0 || roleWinrates.length === 0) {
			return null;
		}

		const bestChampion =
			championWinrates
				.filter((champ) => champ.games >= 2)
				.sort((a, b) => b.winrate - a.winrate)[0] || championWinrates[0];

		const bestRole =
			roleWinrates
				.filter((role) => role.games >= 2)
				.sort((a, b) => b.winrate - a.winrate)[0] || roleWinrates[0];

		const filteredMatches = getFilteredMatches();
		let bestCombination = null;
		let bestCombinationWinrate = 0;

		const combinations = {};
		filteredMatches.forEach((match) => {
			let championName, role, won;

			if (match.isManual === true) {
				championName = match.championPlayed;
				role = match.role?.toUpperCase();
				won = match.result?.toLowerCase() === 'win';
			} else if (match.participant) {
				const champion = Object.values(champions).find(
					(c) => c.key === match.participant.championId.toString()
				);
				championName = champion?.name;
				role = match.participant.individualPosition;
				won = match.participant.win;
			}

			if (!championName || !role) return;

			const comboKey = `${championName}-${role}`;
			if (!combinations[comboKey]) {
				combinations[comboKey] = { wins: 0, total: 0, championName, role };
			}

			combinations[comboKey].total++;
			if (won) combinations[comboKey].wins++;
		});

		Object.values(combinations).forEach((combo) => {
			if (combo.total >= 1) {
				const winrate = (combo.wins / combo.total) * 100;
				if (winrate > bestCombinationWinrate) {
					bestCombination = { ...combo, winrate };
					bestCombinationWinrate = winrate;
				}
			}
		});

		return {
			bestChampion,
			bestRole,
			bestCombination: bestCombination || {
				championName: bestChampion.name,
				role: bestRole.name,
				winrate: Math.min(bestChampion.winrate, bestRole.winrate),
			},
		};
	};

	const recommendation = getRecommendation();

	return (
		<div className="stat-section recommended-section">
			<h3 className="stat-title">
				<FaChartLine className="stat-icon" />
				Recommended Pick
			</h3>
			<div className="recommended-content">
				{isRefreshing ? (
					<div className="section-loading">
						<div className="loading-spinner small"></div>
						<p>Calculating recommendations...</p>
					</div>
				) : recommendation ? (
					<div className="recommendation-display">
						<div className="recommended-champion">
							<div className="recommended-champion-icon">
								{(() => {
									const champion = Object.values(champions).find(
										(c) =>
											c.name === recommendation.bestCombination.championName
									);
									return champion ? (
										<img
											src={`https://ddragon.leagueoflegends.com/cdn/${window.api.getVersion()}/img/champion/${
												champion.id
											}.png`}
											alt={champion.name}
											className="champion-image"
										/>
									) : null;
								})()}
							</div>
							<div className="recommended-info">
								<h4 className="recommended-champ-name">
									{recommendation.bestCombination.championName}
								</h4>
								<p className="recommended-role">
									{recommendation.bestCombination.role}
								</p>
								<p className="recommended-winrate">
									{recommendation.bestCombination.winrate.toFixed(1)}% Winrate
								</p>
							</div>
						</div>
						<div className="recommendation-details">
							<div className="rec-detail">
								<span className="rec-label">Best Champion:</span>
								<span className="rec-value">
									{recommendation.bestChampion.name} (
									{recommendation.bestChampion.winrate.toFixed(1)}%)
								</span>
							</div>
							<div className="rec-detail">
								<span className="rec-label">Best Role:</span>
								<span className="rec-value">
									{recommendation.bestRole.name} (
									{recommendation.bestRole.winrate.toFixed(1)}%)
								</span>
							</div>
						</div>
					</div>
				) : (
					<p className="no-data">
						Play more matches to get personalized recommendations!
					</p>
				)}
			</div>
		</div>
	);
};

export default RecommendedPick;
