import React, { useState, useEffect } from 'react';
import {
	FaSearch,
	FaSyncAlt,
	FaPlus,
	FaChevronDown,
	FaChevronUp,
} from 'react-icons/fa';
import MatchRow from './MatchRow';
import AddMatchDialog from './AddMatchDialog';
import { useData } from '../contexts/DataContext';

export default function MatchHistoryTab() {
	const {
		champions,
		items,
		manualMatches: contextManualMatches,
		apiMatches,
		isDataLoaded,
		hasMoreMatches,
		isLoadingMatches,
		refreshData,
		loadMoreMatches,
		updateManualMatches,
	} = useData();

	const [manualMatches, setManualMatches] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [isManualExpanded, setIsManualExpanded] = useState(true);
	const [isApiExpanded, setIsApiExpanded] = useState(true);
	const [showAddDialog, setShowAddDialog] = useState(false);
	const [editingMatch, setEditingMatch] = useState(null);

	useEffect(() => {
		setManualMatches(contextManualMatches);
	}, [contextManualMatches]);

	const handleRefreshApiMatches = async () => {
		setIsRefreshing(true);
		try {
			await refreshData();
		} catch (error) {
			console.error('Error refreshing data:', error);
		} finally {
			setIsRefreshing(false);
		}
	};

	const handleAddMatch = (matchData) => {
		const newMatch = {
			id: Date.now(),
			...matchData,
			createdAt: new Date().toISOString(),
		};

		const updatedMatches = [newMatch, ...manualMatches];
		setManualMatches(updatedMatches);
		window.storage.setItem('manualMatches', updatedMatches);
		updateManualMatches(updatedMatches);
	};

	const handleEditClick = (matchId) => {
		const matchToEdit = manualMatches.find((match) => match.id === matchId);
		setEditingMatch(matchToEdit);
		setShowAddDialog(true);
	};

	const handleEditMatch = (matchId, updatedData) => {
		const updatedMatches = manualMatches.map((match) =>
			match.id === matchId ? { ...match, ...updatedData } : match
		);
		setManualMatches(updatedMatches);
		window.storage.setItem('manualMatches', updatedMatches);
		updateManualMatches(updatedMatches);
		setEditingMatch(null);
	};

	const handleDeleteMatch = (matchId) => {
		const updatedMatches = manualMatches.filter(
			(match) => match.id !== matchId
		);
		setManualMatches(updatedMatches);
		window.storage.setItem('manualMatches', updatedMatches);
		updateManualMatches(updatedMatches);
	};

	const filteredManualMatches = manualMatches.filter((match) => {
		if (!searchTerm) return true;
		const searchLower = searchTerm.toLowerCase();

		if (match.result?.toLowerCase().includes(searchLower)) return true;
		if (match.role?.toLowerCase().includes(searchLower)) return true;

		const roleDisplayMap = {
			support: 'utility',
			adc: 'bottom',
			mid: 'middle',
			top: 'top',
			jungle: 'jungle',
			Invalid: 'aram',
		};
		const mappedRole = roleDisplayMap[searchLower];
		if (mappedRole && match.role?.toLowerCase() === mappedRole) return true;

		if (match.championPlayed?.toLowerCase().includes(searchLower)) return true;
		if (match.championVs?.toLowerCase().includes(searchLower)) return true;
		if (match.notes?.some((note) => note.toLowerCase().includes(searchLower)))
			return true;

		if (match.createdAt) {
			const matchDate = new Date(match.createdAt);
			const dateStr = matchDate.toLocaleDateString().toLowerCase();
			if (dateStr.includes(searchLower)) return true;

			// Check relative dates
			const now = new Date();
			const diffDays = Math.floor((now - matchDate) / (1000 * 60 * 60 * 24));
			if (
				(searchLower.includes('today') && diffDays === 0) ||
				(searchLower.includes('yesterday') && diffDays === 1)
			)
				return true;
		}

		return false;
	});

	const filteredApiMatches = apiMatches.filter((match) => {
		if (!searchTerm) return true;
		const searchLower = searchTerm.toLowerCase();

		const result = match.participant?.win ? 'WIN' : 'LOSS';
		if (result.toLowerCase().includes(searchLower)) return true;

		const role = match.participant?.individualPosition?.toLowerCase();
		if (role?.includes(searchLower)) return true;

		const roleDisplayMap = {
			support: 'utility',
			adc: 'bottom',
			mid: 'middle',
			top: 'top',
			jungle: 'jungle',
			Invalid: 'aram',
		};
		const mappedRole = roleDisplayMap[searchLower];
		if (mappedRole && role === mappedRole) return true;

		if (champions) {
			const champion = Object.values(champions).find(
				(c) => c.key === match.participant?.championId?.toString()
			);
			if (champion?.name?.toLowerCase().includes(searchLower)) return true;
		}

		if (match.gameCreation) {
			const matchDate = new Date(match.gameCreation);
			const dateStr = matchDate.toLocaleDateString().toLowerCase();
			if (dateStr.includes(searchLower)) return true;

			const now = new Date();
			const diffDays = Math.floor((now - matchDate) / (1000 * 60 * 60 * 24));
			if (
				(searchLower.includes('today') && diffDays === 0) ||
				(searchLower.includes('yesterday') && diffDays === 1)
			)
				return true;
		}

		return false;
	});

	return (
		<div className="match-history-tab">
			<div className="match-history-header">
				<h1 className="tab-title">Match History</h1>
				<p className="tab-subtitle">
					Track and analyze your League of Legends matches
				</p>

				<div className="match-controls">
					<div className="search-container">
						<FaSearch className="search-icon" />
						<input
							type="text"
							placeholder="Search by result, role, champion, or date..."
							className="search-input"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>

					<div className="action-buttons">
						<button
							className="action-btn refresh-btn"
							onClick={handleRefreshApiMatches}
							disabled={isRefreshing}
							title="Refresh API matches">
							<FaSyncAlt className={isRefreshing ? 'spinning' : ''} />
						</button>

						<button
							className="action-btn add-btn"
							onClick={() => setShowAddDialog(true)}
							title="Add manual match">
							<FaPlus />
						</button>
					</div>
				</div>
			</div>

			<div className="match-sections">
				<div className="match-section">
					<button
						className="section-header"
						onClick={() => setIsManualExpanded(!isManualExpanded)}>
						<h3>Manual Matches ({filteredManualMatches.length})</h3>
						{isManualExpanded ? <FaChevronUp /> : <FaChevronDown />}
					</button>

					{isManualExpanded && (
						<div className="match-list">
							{filteredManualMatches.length > 0 ? (
								filteredManualMatches.map((match) => (
									<MatchRow
										key={match.id}
										match={match}
										champions={champions}
										items={items}
										isManual={true}
										onEdit={handleEditClick}
										onDelete={handleDeleteMatch}
									/>
								))
							) : (
								<div className="empty-state">
									No manual matches found. Click the + button to add one!
								</div>
							)}
						</div>
					)}
				</div>

				<div className="match-section">
					<button
						className="section-header"
						onClick={() => setIsApiExpanded(!isApiExpanded)}>
						<h3>Recent Matches ({filteredApiMatches.length})</h3>
						{isApiExpanded ? <FaChevronUp /> : <FaChevronDown />}
					</button>

					{isApiExpanded && (
						<div className="match-list">
							{filteredApiMatches.length > 0 ? (
								<>
									{filteredApiMatches.map((match) => (
										<MatchRow
											key={match.matchId}
											match={match}
											champions={champions}
											items={items}
											isManual={false}
										/>
									))}
									{hasMoreMatches && !searchTerm && (
										<div className="load-more-container">
											<button
												className="load-more-btn"
												onClick={loadMoreMatches}
												disabled={isLoadingMatches}>
												{isLoadingMatches ? 'Loading...' : 'Load More Matches'}
											</button>
										</div>
									)}
								</>
							) : (
								<div className="empty-state">
									{!isDataLoaded
										? 'Loading matches...'
										: 'No recent matches found.'}
								</div>
							)}
						</div>
					)}
				</div>
			</div>

			{showAddDialog && (
				<AddMatchDialog
					champions={champions}
					onAdd={handleAddMatch}
					onClose={() => {
						setShowAddDialog(false);
						setEditingMatch(null);
					}}
					editMatch={editingMatch}
					onEdit={handleEditMatch}
				/>
			)}
		</div>
	);
}
