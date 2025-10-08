import React, { useState } from 'react';
import {
	FaToggleOn,
	FaToggleOff,
	FaTrophy,
	FaChartLine,
	FaFistRaised,
	FaExclamationTriangle,
	FaGamepad,
	FaSyncAlt,
} from 'react-icons/fa';
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from 'recharts';
import { useData } from '../contexts/DataContext';

const ChampionMasteryPage = () => {
	const [includeApiMatches, setIncludeApiMatches] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);

	const {
		champions,
		manualMatches,
		apiMatches,
		masteryData,
		isDataLoaded,
		refreshData,
	} = useData();

	const handleRefresh = async () => {
		setIsRefreshing(true);
		try {
			await refreshData();
		} catch (error) {
			console.error('Error refreshing data:', error);
		} finally {
			setIsRefreshing(false);
		}
	};

	const getFilteredMatches = () => {
		if (includeApiMatches) {
			return [...manualMatches, ...apiMatches];
		}
		return manualMatches;
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
			.slice(0, 10);
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

	const getWinrateOverTime = () => {
		const filteredMatches = getFilteredMatches();
		if (filteredMatches.length === 0) return [];

		const dailyStats = {};

		filteredMatches.forEach((match) => {
			let matchDate, won;

			if (match.isManual === true) {
				matchDate = new Date(match.createdAt);
				won = match.result?.toLowerCase() === 'win';
			} else if (match.participant) {
				matchDate = new Date(match.gameCreation);
				won = match.participant.win;
			}

			const dateKey = matchDate.toISOString().split('T')[0];

			if (!dailyStats[dateKey]) {
				dailyStats[dateKey] = { wins: 0, total: 0, date: dateKey };
			}

			dailyStats[dateKey].total++;
			if (won) dailyStats[dateKey].wins++;
		});

		const sortedDates = Object.keys(dailyStats).sort();
		let totalWins = 0;
		let totalGames = 0;

		return sortedDates.map((date) => {
			const dayStats = dailyStats[date];
			totalWins += dayStats.wins;
			totalGames += dayStats.total;

			return {
				date: new Date(date).toLocaleDateString(),
				winrate: ((totalWins / totalGames) * 100).toFixed(1),
				dailyWinrate: ((dayStats.wins / dayStats.total) * 100).toFixed(1),
				games: totalGames,
			};
		});
	};

	const getCSOverTime = () => {
		const filteredMatches = getFilteredMatches();
		if (filteredMatches.length === 0) return [];

		return filteredMatches
			.filter((match) => {
				if (match.isManual === true) {
					return match.cs && !isNaN(match.cs);
				} else if (match.participant) {
					return match.participant?.totalMinionsKilled !== undefined;
				}
				return false;
			})
			.map((match, index) => {
				let cs, matchDate;

				if (match.isManual === true) {
					cs = parseInt(match.cs) || 0;
					matchDate = new Date(match.createdAt);
				} else {
					cs = match.participant.totalMinionsKilled || 0;
					matchDate = new Date(match.gameCreation);
				}

				return {
					game: index + 1,
					cs: cs,
					date: matchDate.toLocaleDateString(),
				};
			})
			.sort((a, b) => new Date(a.date) - new Date(b.date))
			.slice(-20);
	};

	const getKDAOverTime = () => {
		const filteredMatches = getFilteredMatches();
		if (filteredMatches.length === 0) return [];

		return filteredMatches
			.filter((match) => {
				if (match.isManual === true) {
					return match.kda && match.kda !== 'N/A';
				} else if (match.participant) {
					return match.participant?.kills !== undefined;
				}
				return false;
			})
			.map((match, index) => {
				let kda, matchDate;

				if (match.isManual === true) {
					const kdaParts = match.kda.split('/');
					if (kdaParts.length === 3) {
						const kills = parseInt(kdaParts[0]) || 0;
						const deaths = parseInt(kdaParts[1]) || 0;
						const assists = parseInt(kdaParts[2]) || 0;
						kda =
							deaths > 0
								? ((kills + assists) / deaths).toFixed(2)
								: kills + assists;
					} else {
						kda = 0;
					}
					matchDate = new Date(match.createdAt);
				} else {
					const kills = match.participant.kills || 0;
					const deaths = match.participant.deaths || 0;
					const assists = match.participant.assists || 0;
					kda =
						deaths > 0
							? ((kills + assists) / deaths).toFixed(2)
							: kills + assists;
					matchDate = new Date(match.gameCreation);
				}

				return {
					game: index + 1,
					kda: parseFloat(kda),
					date: matchDate.toLocaleDateString(),
				};
			})
			.sort((a, b) => new Date(a.date) - new Date(b.date))
			.slice(-20);
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

	const getTopMistakes = () => {
		const manualMatchesWithNotes = manualMatches.filter(
			(match) => match.notes && match.notes.length > 0
		);
		if (manualMatchesWithNotes.length === 0) return [];

		const mistakeCounts = {};

		manualMatchesWithNotes.forEach((match) => {
			match.notes.forEach((note) => {
				const normalizedNote = note.toLowerCase().trim();
				mistakeCounts[normalizedNote] =
					(mistakeCounts[normalizedNote] || 0) + 1;
			});
		});

		return Object.entries(mistakeCounts)
			.map(([mistake, count]) => ({
				mistake,
				count,
				percentage: ((count / manualMatchesWithNotes.length) * 100).toFixed(1),
			}))
			.sort((a, b) => b.count - a.count)
			.slice(0, 5);
	};

	const getTopChampions = () => {
		if (!masteryData || masteryData.length === 0) return [];

		return masteryData
			.sort((a, b) => b.championPoints - a.championPoints)
			.slice(0, 3)
			.map((mastery) => {
				const champion = Object.values(champions).find(
					(c) => c.key === mastery.championId.toString()
				);
				return {
					...mastery,
					championData: champion,
				};
			});
	};

	const winrateOverTime = getWinrateOverTime();
	const csOverTime = getCSOverTime();
	const kdaOverTime = getKDAOverTime();
	const topMistakes = getTopMistakes();

	if (!isDataLoaded) {
		return (
			<div className="champion-mastery-page">
				<div className="loading-container">
					<div className="loading-spinner"></div>
					<p>Loading champion mastery data...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="champion-mastery-page">
			<div className="page-header">
				<h1 className="tab-title">Analytics</h1>
				<p className="tab-subtitle">
					Analyze your performance and champion expertise
				</p>
			</div>

			<div className="filter-section">
				<div className="filter-toggle">
					<div className="toggle-controls">
						<span className="toggle-label">Show All Matches:</span>
						<button
							className={`toggle-btn ${includeApiMatches ? 'active' : ''}`}
							onClick={() => setIncludeApiMatches(!includeApiMatches)}
							title={
								includeApiMatches
									? 'Including all matches'
									: 'Manual matches only'
							}>
							{includeApiMatches ? <FaToggleOn /> : <FaToggleOff />}
						</button>
						<span className="toggle-description">
							{includeApiMatches
								? 'Analyzing all matches'
								: 'Analyzing manual matches only'}
						</span>
					</div>
					<button
						className="refresh-btn"
						onClick={handleRefresh}
						disabled={isRefreshing}
						title="Refresh data">
						<FaSyncAlt className={isRefreshing ? 'spinning' : ''} />
					</button>
				</div>
			</div>

			<div className="stats-grid">
				<div className="stat-section">
					<h3 className="stat-title">
						<FaChartLine className="stat-icon" />
						Winrate Over Time
					</h3>
					<div className="chart-container">
						{isRefreshing ? (
							<div className="section-loading">
								<div className="loading-spinner small"></div>
								<p>Loading chart...</p>
							</div>
						) : winrateOverTime.length > 0 ? (
							<ResponsiveContainer width="100%" height={250}>
								<LineChart data={winrateOverTime}>
									<CartesianGrid strokeDasharray="3 3" stroke="#3a3f47" />
									<XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
									<YAxis stroke="#9ca3af" fontSize={12} domain={[0, 100]} />
									<Tooltip
										contentStyle={{
											backgroundColor: '#1e2328',
											border: '1px solid #463714',
											borderRadius: '8px',
											color: '#f0e6d2',
										}}
									/>
									<Line
										type="monotone"
										dataKey="winrate"
										stroke="#c89b3c"
										strokeWidth={3}
										dot={{ fill: '#c89b3c', strokeWidth: 2, r: 4 }}
									/>
								</LineChart>
							</ResponsiveContainer>
						) : (
							<div className="no-data">
								No match data available for winrate analysis
							</div>
						)}
					</div>
				</div>

				<div className="stat-section">
					<h3 className="stat-title">
						<FaGamepad className="stat-icon" />
						CS Performance
					</h3>
					<div className="chart-container">
						{isRefreshing ? (
							<div className="section-loading">
								<div className="loading-spinner small"></div>
								<p>Loading chart...</p>
							</div>
						) : csOverTime.length > 0 ? (
							<ResponsiveContainer width="100%" height={250}>
								<LineChart data={csOverTime}>
									<CartesianGrid strokeDasharray="3 3" stroke="#3a3f47" />
									<XAxis dataKey="game" stroke="#9ca3af" fontSize={12} />
									<YAxis stroke="#9ca3af" fontSize={12} />
									<Tooltip
										contentStyle={{
											backgroundColor: '#1e2328',
											border: '1px solid #463714',
											borderRadius: '8px',
											color: '#f0e6d2',
										}}
									/>
									<Line
										type="monotone"
										dataKey="cs"
										stroke="#0596aa"
										strokeWidth={3}
										dot={{ fill: '#0596aa', strokeWidth: 2, r: 4 }}
									/>
								</LineChart>
							</ResponsiveContainer>
						) : (
							<div className="no-data">No CS data available for analysis</div>
						)}
					</div>
				</div>

				<div className="stat-section">
					<h3 className="stat-title">
						<FaFistRaised className="stat-icon" />
						Average KDA
					</h3>
					<div className="chart-container">
						{isRefreshing ? (
							<div className="section-loading">
								<div className="loading-spinner small"></div>
								<p>Loading chart...</p>
							</div>
						) : kdaOverTime.length > 0 ? (
							<ResponsiveContainer width="100%" height={250}>
								<LineChart data={kdaOverTime}>
									<CartesianGrid strokeDasharray="3 3" stroke="#3a3f47" />
									<XAxis dataKey="game" stroke="#9ca3af" fontSize={12} />
									<YAxis stroke="#9ca3af" fontSize={12} />
									<Tooltip
										contentStyle={{
											backgroundColor: '#1e2328',
											border: '1px solid #463714',
											borderRadius: '8px',
											color: '#f0e6d2',
										}}
									/>
									<Line
										type="monotone"
										dataKey="kda"
										stroke="#c9aa71"
										strokeWidth={3}
										dot={{ fill: '#c9aa71', strokeWidth: 2, r: 4 }}
									/>
								</LineChart>
							</ResponsiveContainer>
						) : (
							<div className="no-data">No KDA data available for analysis</div>
						)}
					</div>
				</div>

				<div className="stat-section">
					<h3 className="stat-title">
						<FaExclamationTriangle className="stat-icon" />
						Common Mistakes
					</h3>
					<div className="mistakes-list">
						{isRefreshing ? (
							<div className="section-loading">
								<div className="loading-spinner small"></div>
								<p>Analyzing mistakes...</p>
							</div>
						) : topMistakes.length > 0 ? (
							topMistakes.map((mistake, index) => (
								<div key={index} className="mistake-item">
									<div className="mistake-rank">#{index + 1}</div>
									<div className="mistake-details">
										<span className="mistake-text">{mistake.mistake}</span>
										<span className="mistake-frequency">
											{mistake.count} times ({mistake.percentage}%)
										</span>
									</div>
									<div className="mistake-bar">
										<div
											className="mistake-bar-fill"
											style={{
												width: `${
													(mistake.count / topMistakes[0].count) * 100
												}%`,
											}}></div>
									</div>
								</div>
							))
						) : (
							<div className="no-data">
								No mistake data available. Add notes to your manual matches to
								see common mistakes!
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default ChampionMasteryPage;
