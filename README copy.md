# Forensic Assistance

Forensic Assistance is a web application designed to assist in cataloging and analyzing evidence related to narcotics and firearms. The project is built using React, Vite, and TailwindCSS, and includes features such as filtering, sorting, and detailed profiles for drugs and guns.

## Features

- **Drug Catalog**: Browse, filter, and view detailed profiles of various narcotics.
- **Gun Catalog**: Explore, filter, and view detailed profiles of firearms.
- **Interactive Map**: Visualize drug routes, distribution points, and hotspots.
- **Responsive Design**: Optimized for both desktop and mobile devices.

## Tech Stack

- **Frontend**: React, Vite, TailwindCSS
- **Backend**: REST API (assumed to be running locally)
- **Data Visualization**: D3.js, Leaflet.js
- **Build Tools**: Vite, PostCSS
- **Linting**: ESLint

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/forensic-assistance.git
   cd forensic-assistance
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open the application in your browser at `http://localhost:5173`.

## Scripts

- `npm run dev`: Start the development server.
- `npm run build`: Build the project for production.
- `npm run preview`: Preview the production build.
- `npm run lint`: Run ESLint to check for code issues.

## API Endpoints

The application interacts with a REST API for data. Below are some example endpoints:

- **Guns**:
  - `GET /guns/`: Fetch all guns.
  - `GET /guns/:id`: Fetch details of a specific gun.
- **Narcotics**:
  - `GET /narcotics/`: Fetch all narcotics.
  - `GET /narcotics/:id`: Fetch details of a specific narcotic.

## Project Structure

```
catalog/
├── public/                 # Static assets
├── src/                    # Source code
│   ├── components/         # Reusable components
│   ├── pages/              # Page components
│   ├── App.jsx             # Main application component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── package.json            # Project metadata and dependencies
├── vite.config.js          # Vite configuration
└── README.md               # Project documentation
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add feature-name"
   ```
4. Push to your fork:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [D3.js](https://d3js.org/)
- [Leaflet.js](https://leafletjs.com/)

---
