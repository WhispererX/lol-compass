import React from 'react';
import { FaTrophy } from 'react-icons/fa';
import { useData } from '../contexts/DataContext';

const TopChampions = () => {
	const { champions, masteryData, isDataLoaded } = useData();

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

	const topChampions = getTopChampions();

	return (
		<div className="top-champions-section">
			<h2 className="section-title">
				<FaTrophy className="section-icon" />
				Top Champions
			</h2>
			<div className="top-champions-display">
				{!isDataLoaded ? (
					<div className="section-loading">
						<div className="loading-spinner small"></div>
						<p>Loading top champions...</p>
					</div>
				) : topChampions.length >= 3 ? (
					<>
						<div className="champion-rank second">
							<div className="champion-circle">
								{topChampions[1]?.championData && (
									<img
										src={`https://ddragon.leagueoflegends.com/cdn/${window.api.getVersion()}/img/champion/${
											topChampions[1].championData.id
										}.png`}
										alt={topChampions[1].championData.name}
										className="champion-image"
									/>
								)}
							</div>
							<div className="champion-info">
								<span className="champion-name">
									{topChampions[1]?.championData?.name || 'Unknown'}
								</span>
								<span className="mastery-points">
									{topChampions[1]?.championPoints?.toLocaleString()} pts
								</span>
								<span className="mastery-level">
									Level {topChampions[1]?.championLevel}
								</span>
							</div>
							<div className="rank-indicator">2</div>
						</div>

						<div className="champion-rank first">
							<div className="champion-circle">
								{topChampions[0]?.championData && (
									<img
										src={`https://ddragon.leagueoflegends.com/cdn/${window.api.getVersion()}/img/champion/${
											topChampions[0].championData.id
										}.png`}
										alt={topChampions[0].championData.name}
										className="champion-image"
									/>
								)}
							</div>
							<div className="champion-info">
								<span className="champion-name">
									{topChampions[0]?.championData?.name || 'Unknown'}
								</span>
								<span className="mastery-points">
									{topChampions[0]?.championPoints?.toLocaleString()} pts
								</span>
								<span className="mastery-level">
									Level {topChampions[0]?.championLevel}
								</span>
							</div>
							<div className="rank-indicator">1</div>
						</div>

						<div className="champion-rank third">
							<div className="champion-circle">
								{topChampions[2]?.championData && (
									<img
										src={`https://ddragon.leagueoflegends.com/cdn/${window.api.getVersion()}/img/champion/${
											topChampions[2].championData.id
										}.png`}
										alt={topChampions[2].championData.name}
										className="champion-image"
									/>
								)}
							</div>
							<div className="champion-info">
								<span className="champion-name">
									{topChampions[2]?.championData?.name || 'Unknown'}
								</span>
								<span className="mastery-points">
									{topChampions[2]?.championPoints?.toLocaleString()} pts
								</span>
								<span className="mastery-level">
									Level {topChampions[2]?.championLevel}
								</span>
							</div>
							<div className="rank-indicator">3</div>
						</div>
					</>
				) : (
					<div className="no-mastery-data">
						<p>
							No champion mastery data available. Play some matches to see your
							top champions!
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default TopChampions;
