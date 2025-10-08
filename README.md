
# LoL Compass

LoL Compass is a **League of Legends progress tracker app** designed to help players monitor their in-game performance, track improvement over time, and gain insights into their gameplay. Whether you want to improve your win rate, master certain champions, or analyze your matches, LoL Compass keeps your progress clear and organized.

---

## Features

- **Match History Tracking** — Automatically track your recent matches with detailed stats.
- **Win Rate Analysis** — See your overall and champion-specific win rates.
- **Role & Champion Performance** — Track performance per role and champion.
- **Custom Notes** — Log mistakes or observations to improve future play.
- **Progress Graphs** — Visualize your improvement over time.
- **Role Icons & Profile Pictures** — Fetch static resources for easy reference.
- **Cross-Platform** — Runs on Windows, macOS, and Linux.

---

## Technologies Used

- **Frontend:** HTML, CSS, React
- **Backend:** Node.js, Electron.js
- **APIs:** Riot Games API
- **Data Storage:** Local storage or cloud sync (TBD)
- **Tools:** Git, Webpack, ESLint

---

## Installation

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [Git](https://git-scm.com/)

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/WhispererX/lol-compass.git
   cd lol-compass
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the app:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

---

## ⚙️ Configuration

LoL Compass requires access to the Riot Games API.
Create a `.env` file in the root directory with the following:
```env
RIOT_API_KEY=your_api_key_here
```

> **Important:** Keep your API key secure and never share it publicly.

---

## Usage

1. Open LoL Compass and log in with your Riot Games account.
2. Browse through match history and performance stats.
3. Add personal notes for improvement.
4. Use charts and insights to track your progression over time.

---

## Security

- API key stored locally in `.env`
- No user data stored on external servers unless cloud sync is implemented in future versions.

---

## License

LoL Compass is licensed under the MIT License — see [LICENSE](LICENSE) for details.

---

## Contact

Developer: Whisperer  
Email: whisperer.meta@gmail.com  
GitHub: [github.com/WhispererX/lol-compass](https://github.com/WhispererX/lol-compass)
