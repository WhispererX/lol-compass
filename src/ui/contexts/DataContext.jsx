import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export const useData = () => {
	const context = useContext(DataContext);
	if (!context) {
		throw new Error('useData must be used within a DataProvider');
	}
	return context;
};

export const DataProvider = ({ children }) => {
	const [champions, setChampions] = useState({});
	const [items, setItems] = useState({});
	const [manualMatches, setManualMatches] = useState([]);
	const [apiMatches, setApiMatches] = useState([]);
	const [masteryData, setMasteryData] = useState([]);
	const [isDataLoaded, setIsDataLoaded] = useState(false);
	const [userCredentials, setUserCredentials] = useState(null);
	const [accountData, setAccountData] = useState(null);
	const [hasMoreMatches, setHasMoreMatches] = useState(true);
	const [isLoadingMatches, setIsLoadingMatches] = useState(false);

	const loadStaticGameData = async () => {
		try {
			const [championsData, itemsData] = await Promise.all([
				window.riot.getChampionData(),
				window.riot.getItemsData(),
			]);

			setChampions(championsData || {});
			setItems(itemsData || {});
		} catch (error) {}
	};

	const loadUserData = async (credentials = null) => {
		try {
			const storedManualMatches =
				window.storage?.getItem('manualMatches') || [];
			const parsedManualMatches = storedManualMatches.map((match) => ({
				...match,
				isManual: true,
			}));
			setManualMatches(parsedManualMatches);

			const userCreds =
				credentials || window.storage?.getItem('userCredentials');
			if (userCreds) {
				const account = await window.riot.getAccount(
					userCreds.username,
					userCreds.tagLine
				);
				if (account && account.ok !== false) {
					setUserCredentials(userCreds);
					setAccountData(account);

					await Promise.all([
						loadApiMatches(account.puuid),
						loadMasteryData(account.puuid),
					]);
				} else {
					window.storage.removeItem('userCredentials');
					setUserCredentials(null);
					setAccountData(null);
					await loadCachedData();
				}
			} else {
				setUserCredentials(null);
				setAccountData(null);
				await loadCachedData();
			}
		} catch (error) {
			window.storage.removeItem('userCredentials');
			setUserCredentials(null);
			setAccountData(null);
			await loadCachedData();
		}
	};

	const initializeData = async () => {
		await loadStaticGameData();
		await loadUserData();
		setIsDataLoaded(true);
	};

	const loadCachedData = async () => {
		const storedApiMatches = window.storage?.getItem('cachedMatches') || [];
		const processedApiMatches = storedApiMatches.map((match) => ({
			...match,
			isManual: false,
		}));
		setApiMatches(processedApiMatches);

		const storedMastery = window.storage?.getItem('championMastery') || [];
		setMasteryData(storedMastery);
	};

	const loadApiMatches = async (puuid, startIndex = 0) => {
		try {
			const matchIds = await window.riot.getMatches(puuid, {
				start: startIndex,
				count: 20,
			});

			if (matchIds && matchIds.ok === false) {
				console.warn(
					'DataContext: API error getting match IDs:',
					matchIds.message || 'Unknown error'
				);

				const storedApiMatches = window.storage?.getItem('cachedMatches') || [];
				const processedApiMatches = storedApiMatches.map((match) => ({
					...match,
					isManual: false,
				}));
				setApiMatches(processedApiMatches);
			} else if (matchIds && Array.isArray(matchIds) && matchIds.length > 0) {
				const matchPromises = matchIds.map((matchId) =>
					window.riot.getMatch(matchId)
				);
				const matches = await Promise.all(matchPromises);
				const validMatches = matches.filter((match) => match && match.info);

				const processedMatches = validMatches.map((match) => ({
					...match.info,
					matchId: match.metadata.matchId,
					participant: match.info.participants.find((p) => p.puuid === puuid),
					isManual: false,
				}));

				if (startIndex === 0) {
					setApiMatches(processedMatches);
				} else {
					setApiMatches((prev) => [...prev, ...processedMatches]);
				}

				if (matchIds.length < 20) {
					setHasMoreMatches(false);
				} else {
					setHasMoreMatches(true);
				}
			} else {
				const storedApiMatches = window.storage?.getItem('cachedMatches') || [];
				const processedApiMatches = storedApiMatches.map((match) => ({
					...match,
					isManual: false,
				}));
				setApiMatches(processedApiMatches);
			}
		} catch (error) {
			const storedApiMatches = window.storage?.getItem('cachedMatches') || [];
			const processedApiMatches = storedApiMatches.map((match) => ({
				...match,
				isManual: false,
			}));
			setApiMatches(processedApiMatches);
		}
	};

	const loadMasteryData = async (puuid) => {
		try {
			const mastery = await window.riot.getChampionMasteries(puuid);
			if (mastery && mastery.ok === false) {
				const storedMastery = window.storage?.getItem('championMastery') || [];
				setMasteryData(storedMastery);
			} else if (mastery && Array.isArray(mastery)) {
				setMasteryData(mastery);
			} else {
				const storedMastery = window.storage?.getItem('championMastery') || [];
				setMasteryData(storedMastery);
			}
		} catch (error) {
			const storedMastery = window.storage?.getItem('championMastery') || [];
			setMasteryData(storedMastery);
		}
	};

	const refreshData = async () => {
		if (userCredentials && accountData) {
			setHasMoreMatches(true);
			await Promise.all([
				loadApiMatches(accountData.puuid, 0),
				loadMasteryData(accountData.puuid),
			]);
		}
	};

	const loadMoreMatches = async () => {
		if (userCredentials && accountData && !isLoadingMatches && hasMoreMatches) {
			setIsLoadingMatches(true);
			try {
				await loadApiMatches(accountData.puuid, apiMatches.length);
			} catch (error) {
			} finally {
				setIsLoadingMatches(false);
			}
		}
	};

	const updateManualMatches = (newMatches) => {
		const parsedMatches = newMatches.map((match) => ({
			...match,
			isManual: true,
		}));
		setManualMatches(parsedMatches);
	};

	useEffect(() => {
		if (window.storage && window.riot) {
			initializeData();
		}
	}, []);

	const value = {
		champions,
		items,
		manualMatches,
		apiMatches,
		masteryData,
		isDataLoaded,
		userCredentials,
		accountData,
		hasMoreMatches,
		isLoadingMatches,
		refreshData,
		loadMoreMatches,
		updateManualMatches,
		loadUserData,
		setUserCredentials,
		setAccountData,
	};

	return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
