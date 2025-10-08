// Core Electron imports
import { app, BrowserWindow, nativeImage, ipcMain, Menu } from 'electron';

// Node.js built-in modules
import path from 'path';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

// Application constants
const DIST_REACT_PATH = '/dist-react/index.html';
const DEVELOPMENT_PORT = 5123;
const DEFAULT_WINDOW_WIDTH = 800;
const DEFAULT_WINDOW_HEIGHT = 600;

// Environment and path configurations
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
const APP_PATH = app.getAppPath();
const ICON_PATH = path.join(APP_PATH, 'icon.png');
const RIOT_API_KEY = process.env.RIOT_PROJECT_API_KEY.trim();

// Application state
let mainWindow = null;

/**
 * Creates the main application window with appropriate settings for development and production
 */
const createWindow = () => {
	mainWindow = new BrowserWindow({
		width: DEFAULT_WINDOW_WIDTH,
		height: DEFAULT_WINDOW_HEIGHT,
		icon: ICON_PATH,
		menuBarVisible: false,
		title: 'LoL Compass',
		webPreferences: {
			preload: path.join(APP_PATH, 'src', 'electron', 'preload.js'),
			webSecurity: !IS_DEVELOPMENT,
		},
	});

	Menu.setApplicationMenu(null);

	mainWindow.on('closed', () => {
		mainWindow = null;
	});

	if (IS_DEVELOPMENT) {
		mainWindow.loadURL(`http://localhost:${DEVELOPMENT_PORT}`);
	} else {
		mainWindow.loadFile(path.join(app.getAppPath() + DIST_REACT_PATH));
	}
};

/**
 * Initializes the application when ready
 */
function initializeApp() {
	createWindow();

	const icon = nativeImage.createFromPath(ICON_PATH);

	if (process.platform === 'darwin') {
		app.dock.setIcon(icon);
	}

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
}

// Application event handlers
app.whenReady().then(initializeApp);

/**
 * Handles the window-all-closed event
 * On macOS, applications typically stay active until the user quits explicitly with Cmd + Q
 */
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

//#region Helper Functions

/**
 * Constructs a Riot Games API URL with the given endpoint and region
 * @param {string} endpoint - The API endpoint to access
 * @param {string} region - The region for the API request
 * @returns {string} - The full URL for the API request
 */
function buildRiotApiUrl(endpoint, region) {
	const separator = endpoint.includes('?') ? '&' : '?';
	return `https://${region}.api.riotgames.com${endpoint}${separator}api_key=${RIOT_API_KEY}`;
}

function getRiotErrorMessage(status) {
	switch (status) {
		case 400:
			return 'Bad Request: The request was invalid or cannot be served.';
		case 401:
			return 'Unauthorized: API key is missing or invalid.';
		case 403:
			return 'Forbidden: You do not have permission to access this resource.';
		case 404:
			return 'Not Found: The requested resource could not be found.';
		case 405:
			return 'Method Not Allowed: The HTTP method is not supported for this resource.';
		case 415:
			return 'Unsupported Media Type: The request entity has a media type which the server or resource does not support.';
		case 429:
			return 'Too Many Requests: You have exceeded your rate limit.';
		case 500:
			return 'Internal Server Error: An error occurred on the server.';
		case 502:
			return 'Bad Gateway: The server was acting as a gateway or proxy and received an invalid response from the upstream server.';
		case 503:
			return 'Service Unavailable: The server is currently unavailable (overloaded or down).';
		case 504:
			return 'Gateway Timeout: The server did not receive a timely response from an upstream server.';
		default:
			return 'An unknown error occurred.';
	}
}

async function fetchRiotStaticData(category) {
	const versions = await fetch(
		'https://ddragon.leagueoflegends.com/api/versions.json'
	).then((res) => res.json());
	const latestVersion = versions[0];

	const data = await fetch(
		`http://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/${category}.json`
	).then((r) => r.json());

	return data.data;
}
//#endregion

//#region IPC Handlers

//#region Riot Local
ipcMain.handle(
	'riot:champion-rotations',
	async (event, { region, subRegion }) => {
		const url = buildRiotApiUrl(
			'/lol/platform/v3/champion-rotations',
			subRegion
		);
		const response = await fetch(url);

		if (!response.ok) {
			return { ok: false, message: getRiotErrorMessage(response.status) };
		}

		return response.json();
	}
);

ipcMain.handle(
	'riot:account',
	async (event, { region, subRegion, username, tagLine }) => {
		const url = buildRiotApiUrl(
			`/riot/account/v1/accounts/by-riot-id/${username}/${tagLine}`,
			region
		);
		const response = await fetch(url);
		console.log('Response:', response);

		if (!response.ok) {
			return { ok: false, message: getRiotErrorMessage(response.status) };
		}

		return response.json();
	}
);

ipcMain.handle('riot:summoner', async (event, { region, subRegion, puuid }) => {
	const url = buildRiotApiUrl(
		`/lol/summoner/v4/summoners/by-puuid/${puuid}`,
		subRegion
	);
	const response = await fetch(url);

	if (!response.ok) {
		return { ok: false, message: getRiotErrorMessage(response.status) };
	}

	return response.json();
});

ipcMain.handle(
	'riot:champion-masteries',
	async (event, { region, subRegion, puuid }) => {
		const url = buildRiotApiUrl(
			`/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}`,
			subRegion
		);
		const response = await fetch(url);

		if (!response.ok) {
			return { ok: false, message: getRiotErrorMessage(response.status) };
		}

		return response.json();
	}
);

ipcMain.handle(
	'riot:champion-mastery',
	async (event, { region, subRegion, puuid, championId }) => {
		const url = buildRiotApiUrl(
			`/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/by-champion/${championId}`,
			subRegion
		);
		const response = await fetch(url);

		if (!response.ok) {
			return { ok: false, message: getRiotErrorMessage(response.status) };
		}

		return response.json();
	}
);

ipcMain.handle(
	'riot:matches',
	async (event, { region, subRegion, puuid, options }) => {
		const { count = 20, start = 0, queue = null, type = null } = options;
		let url = buildRiotApiUrl(
			`/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${start}&count=${count}`,
			region
		);
		if (queue) url += `&queue=${queue}`;
		if (type) url += `&type=${type}`;
		const response = await fetch(url);

		if (!response.ok) {
			return { ok: false, message: getRiotErrorMessage(response.status) };
		}

		return response.json();
	}
);

ipcMain.handle('riot:match', async (event, { region, subRegion, matchId }) => {
	const url = buildRiotApiUrl(`/lol/match/v5/matches/${matchId}`, region);
	const response = await fetch(url);

	if (!response.ok) {
		return { ok: false, message: getRiotErrorMessage(response.status) };
	}

	return response.json();
});

ipcMain.handle(
	'riot:live-match',
	async (event, { region, subRegion, puuid }) => {
		const url = buildRiotApiUrl(
			`/lol/spectator/v5/active-games/by-summoner/${puuid}`,
			subRegion
		);
		const response = await fetch(url);

		if (!response.ok) {
			return { ok: false, message: getRiotErrorMessage(response.status) };
		}

		return response.json();
	}
);
//#endregion

//#region Riot Static
ipcMain.handle('riot:champion-data', async (event) => {
	return await fetchRiotStaticData('champion');
});

ipcMain.handle('riot:items-data', async (event) => {
	return await fetchRiotStaticData('item');
});

ipcMain.handle('riot:profile-icons-data', async (event) => {
	return await fetchRiotStaticData('profileicon');
});

ipcMain.handle('riot:summoner-data', async (event) => {
	return await fetchRiotStaticData('summoner');
});

ipcMain.handle('riot:runes-data', async (event) => {
	return await fetchRiotStaticData('runesReforged');
});

ipcMain.handle('riot:map-data', async (event) => {
	return await fetchRiotStaticData('map');
});

ipcMain.handle('riot:latest-version', async (event) => {
	const versions = await fetch(
		'https://ddragon.leagueoflegends.com/api/versions.json'
	).then((res) => res.json());
	return versions[0];
});

//#endregion
//#endregion
