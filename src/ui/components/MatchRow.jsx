import React, { useState } from 'react';
import { FaEdit, FaTrash, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const ROLE_ICONS = {
	TOP: '/src/ui/assets/top.png',
	JUNGLE: '/src/ui/assets/jungle.png',
	MIDDLE: '/src/ui/assets/mid.png',
	BOTTOM: '/src/ui/assets/bottom.png',
	UTILITY: '/src/ui/assets/support.png',
};

const ROLE_DISPLAY = {
	TOP: 'TOP',
	JUNGLE: 'JGL',
	MIDDLE: 'MID',
	BOTTOM: 'ADC',
	UTILITY: 'SUP',
	MID: 'MID',
	SUPPORT: 'SUP',
	ADC: 'ADC',
	JGL: 'JGL',
	Invalid: 'ARAM',
};

export default function MatchRow({
	match,
	champions,
	items,
	isManual,
	onEdit,
	onDelete,
}) {
	const [isExpanded, setIsExpanded] = useState(false);
	const [isHovered, setIsHovered] = useState(false);

	const renderItems = () => {
		if (isManual || !items) return null;

		const playerItems = [
			match.participant?.item0,
			match.participant?.item1,
			match.participant?.item2,
			match.participant?.item3,
			match.participant?.item4,
			match.participant?.item5,
		];

		return (
			<div className="items-container">
				<div className="items-grid">
					{playerItems.map((itemId, index) => (
						<div key={index} className="item-slot">
							{itemId && itemId !== 0 ? (
								<img
									src={`https://ddragon.leagueoflegends.com/cdn/${window.api.getVersion()}/img/item/${itemId}.png`}
									alt={items[itemId]?.name || 'Item'}
									className="item-icon"
									title={items[itemId]?.name || 'Unknown Item'}
								/>
							) : (
								<div className="empty-item-slot" title="Empty Item Slot"></div>
							)}
						</div>
					))}
				</div>
			</div>
		);
	};

	const getChampionIcon = (championData) => {
		if (!championData || !champions) return null;

		if (typeof championData === 'string') {
			const champion = Object.values(champions).find(
				(c) => c.name === championData
			);
			return champion
				? `https://ddragon.leagueoflegends.com/cdn/${window.api.getVersion()}/img/champion/${
						champion.id
				  }.png`
				: null;
		}

		const champion = Object.values(champions).find(
			(c) => c.key === championData.toString()
		);
		return champion
			? `https://ddragon.leagueoflegends.com/cdn/${window.api.getVersion()}/img/champion/${
					champion.id
			  }.png`
			: null;
	};

	const getMatchResult = () => {
		if (isManual) {
			return match.result?.toUpperCase();
		} else {
			return match.participant?.win ? 'WIN' : 'LOSS';
		}
	};

	const getRole = () => {
		if (isManual) {
			return match.role?.toUpperCase();
		} else {
			return match.participant?.individualPosition || 'UNKNOWN';
		}
	};

	const getKDA = () => {
		if (isManual) {
			return match.kda || '0/0/0';
		} else {
			const p = match.participant;
			return `${p?.kills || 0}/${p?.deaths || 0}/${p?.assists || 0}`;
		}
	};

	const getChampionPlayed = () => {
		if (isManual) {
			return match.championPlayed;
		}
		const champion = Object.values(champions).find(
			(c) => c.key === match.participant?.championId?.toString()
		);
		return champion?.name || 'Unknown';
	};

	const getChampionVs = () => {
		if (isManual) {
			return match.championVs;
		} else {
			const userRole = match.participant?.individualPosition;
			const userTeamId = match.participant?.teamId;

			const roleMap = {
				TOP: ['TOP'],
				JUNGLE: ['JUNGLE'],
				MIDDLE: ['MIDDLE', 'MID'],
				BOTTOM: ['BOTTOM', 'ADC'],
				UTILITY: ['UTILITY', 'SUPPORT'],
			};

			const possibleRoles = roleMap[userRole] || [userRole];

			const opponent = match.participants?.find(
				(p) =>
					p.teamId !== userTeamId &&
					possibleRoles.includes(p.individualPosition)
			);

			console.log('Found opponent:', opponent);

			if (opponent) {
				const champion = Object.values(champions).find(
					(c) => c.key === opponent.championId?.toString()
				);
				return champion?.name || 'Unknown';
			}

			return 'Unknown';
		}
	};

	const result = getMatchResult();
	const role = getRole();
	const kda = getKDA();
	const championPlayed = getChampionPlayed();
	const championVs = getChampionVs();

	const championPlayedIcon = getChampionIcon(
		isManual ? championPlayed : match.participant?.championId
	);

	const getOpponentChampionId = () => {
		if (isManual) return championVs;

		const userRole = match.participant?.individualPosition;
		const userTeamId = match.participant?.teamId;

		const roleMap = {
			TOP: ['TOP'],
			JUNGLE: ['JUNGLE'],
			MIDDLE: ['MIDDLE', 'MID'],
			BOTTOM: ['BOTTOM', 'ADC'],
			UTILITY: ['UTILITY', 'SUPPORT'],
		};

		const possibleRoles = roleMap[userRole] || [userRole];

		const opponent = match.participants?.find(
			(p) =>
				p.teamId !== userTeamId && possibleRoles.includes(p.individualPosition)
		);

		if (opponent) {
			const champion = Object.values(champions).find(
				(c) => c.key === opponent.championId?.toString()
			);
			return champion?.name || 'Unknown';
		}

		return 'Unknown';
	};

	const championVsIcon = getChampionIcon(getOpponentChampionId());

	const formatGameTime = (timestamp) => {
		const date = new Date(timestamp);
		return (
			date.toLocaleDateString() +
			' ' +
			date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
		);
	};

	const formatMatchDate = () => {
		if (isManual) {
			return match.createdAt ? formatGameTime(match.createdAt) : 'Unknown';
		} else {
			return formatGameTime(match.gameCreation);
		}
	};

	return (
		<div
			className={`match-row ${result?.toLowerCase()} ${
				isExpanded ? 'expanded' : ''
			}`}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			onClick={() => setIsExpanded(!isExpanded)}>
			<div className="match-main">
				<div className="match-result">
					<span className="result-text">{result}</span>
				</div>

				<div className="match-role">
					<img
						src={ROLE_ICONS[role] || '/src/ui/assets/mid.png'}
						alt={role}
						className="role-icon"
					/>
					<span className="role-text">{ROLE_DISPLAY[role] || '?'}</span>
				</div>

				<div className="match-champions">
					<div className="champion-section">
						<div className="champion-icon-container">
							{championPlayedIcon && (
								<img
									src={championPlayedIcon}
									alt={championPlayed}
									title={championPlayed}
									className="champion-icon"
								/>
							)}
						</div>
						<span className="champion-name">{championPlayed}</span>
					</div>

					<div className="vs-separator">
						<span className="vs-text">VS</span>
					</div>

					<div className="champion-section">
						<div className="champion-icon-container">
							{championVsIcon && (
								<img
									src={championVsIcon}
									alt={championVs}
									title={championVs}
									className="champion-icon"
								/>
							)}
						</div>
						<span className="champion-name">{championVs}</span>
					</div>
				</div>

				<div className="match-kda">
					<span className="kda-text">{kda}</span>
				</div>

				{isManual && match.cs && (
					<div className="match-cs">
						<span className="cs-text">{match.cs} CS</span>
					</div>
				)}

				<div className="match-actions">
					{isManual && isHovered && (
						<div className="action-buttons">
							<button
								className="action-btn edit-btn"
								onClick={(e) => {
									e.stopPropagation();
									onEdit && onEdit(match.id);
								}}
								title="Edit match">
								<FaEdit />
							</button>
							<button
								className="action-btn delete-btn"
								onClick={(e) => {
									e.stopPropagation();
									onDelete && onDelete(match.id);
								}}
								title="Delete match">
								<FaTrash />
							</button>
						</div>
					)}

					{!isManual && (
						<button className="expand-btn">
							{isExpanded ? <FaChevronUp /> : <FaChevronDown />}
						</button>
					)}
				</div>

				<div className="match-time">{formatMatchDate()}</div>
			</div>

			{!isManual && renderItems()}

			{isExpanded && (
				<div className="match-details">
					{isManual ? (
						<div className="manual-match-details">
							{match.notes && match.notes.length > 0 && (
								<div className="match-notes">
									{match.notes.map((note, index) => (
										<span key={index} className="note-tag">
											{note}
										</span>
									))}
								</div>
							)}
						</div>
					) : (
						<div className="details-grid">
							<div className="detail-item">
								<span className="detail-label">Damage Dealt</span>
								<span className="detail-value">
									{match.participant?.totalDamageDealtToChampions?.toLocaleString() ||
										'N/A'}
								</span>
							</div>

							<div className="detail-item">
								<span className="detail-label">CS</span>
								<span className="detail-value">
									{match.participant?.totalMinionsKilled || 0}
								</span>
							</div>

							<div className="detail-item">
								<span className="detail-label">Gold Earned</span>
								<span className="detail-value">
									{match.participant?.goldEarned?.toLocaleString() || 'N/A'}
								</span>
							</div>

							<div className="detail-item">
								<span className="detail-label">Vision Score</span>
								<span className="detail-value">
									{match.participant?.visionScore || 0}
								</span>
							</div>

							<div className="detail-item">
								<span className="detail-label">Game Duration</span>
								<span className="detail-value">
									{Math.floor(match.gameDuration / 60)}m{' '}
									{match.gameDuration % 60}s
								</span>
							</div>

							<div className="detail-item">
								<span className="detail-label">Game Mode</span>
								<span className="detail-value">{match.gameMode}</span>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
