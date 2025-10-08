const { contextBridge, ipcRenderer } = require('electron');

let region = 'europe';
let subRegion = 'euw1';
let version = '15.19.1';

const loadSettings = () => {
	try {
		const savedSettings = localStorage.getItem('appSettings');
		if (savedSettings) {
			const settings = JSON.parse(savedSettings);
			region = settings.region || 'europe';
			subRegion = settings.subRegion || 'euw1';
			version = settings.version || '15.19.1';
		}
	} catch (error) {
		console.error('Failed to load settings:', error);
	}
};

const saveSettings = () => {
	try {
		const settings = { region, subRegion, version };
		localStorage.setItem('appSettings', JSON.stringify(settings));
	} catch (error) {
		console.error('Failed to save settings:', error);
	}
};

loadSettings();

contextBridge.exposeInMainWorld('api', {
	getRegion: () => region,
	getSubRegion: () => subRegion,
	setRegion: (newRegion) => {
		region = newRegion;
		saveSettings();
	},
	setSubRegion: (newSubRegion) => {
		subRegion = newSubRegion;
		saveSettings();
	},
	getVersion: () => version,
	setVersion: (newVersion) => {
		version = newVersion;
		saveSettings();
	},
});

contextBridge.exposeInMainWorld('storage', {
	setItem: (key, value) => {
		localStorage.setItem(key, JSON.stringify(value));
	},
	getItem: (key) => {
		const item = localStorage.getItem(key);
		return item ? JSON.parse(item) : null;
	},
	removeItem: (key) => {
		localStorage.removeItem(key);
	},
	clear: () => {
		localStorage.clear();
	},
});

contextBridge.exposeInMainWorld('riot', {
	async getChampionRotations() {
		return await ipcRenderer.invoke('riot:champion-rotations', {
			region,
			subRegion,
		});
	},

	async getAccount(username, tagLine) {
		return await ipcRenderer.invoke('riot:account', {
			region,
			subRegion,
			username,
			tagLine,
		});
	},

	async getSummoner(puuid) {
		return await ipcRenderer.invoke('riot:summoner', {
			region,
			subRegion,
			puuid,
		});
	},

	async getChampionMasteries(puuid) {
		return await ipcRenderer.invoke('riot:champion-masteries', {
			region,
			subRegion,
			puuid,
		});
	},

	async getChampionMastery(puuid, championId) {
		return await ipcRenderer.invoke('riot:champion-mastery', {
			region,
			subRegion,
			puuid,
			championId,
		});
	},

	async getMatches(puuid, options = {}) {
		return await ipcRenderer.invoke('riot:matches', {
			region,
			subRegion,
			puuid,
			options,
		});
	},

	async getMatch(matchId) {
		return await ipcRenderer.invoke('riot:match', {
			region,
			subRegion,
			matchId,
		});
	},

	async getLiveMatch(puuid) {
		return await ipcRenderer.invoke('riot:live-match', {
			region,
			subRegion,
			puuid,
		});
	},

	async getLatestVersion() {
		return ipcRenderer.invoke('riot:latest-version');
	},

	async getChampionData() {
		return await ipcRenderer.invoke('riot:champion-data');
	},

	async getItemsData() {
		return await ipcRenderer.invoke('riot:items-data');
	},

	async getProfileIconsData() {
		return await ipcRenderer.invoke('riot:profile-icons-data');
	},

	async getSummonerData() {
		return await ipcRenderer.invoke('riot:summoner-data');
	},

	async getRunesData() {
		return await ipcRenderer.invoke('riot:runes-data');
	},
});
