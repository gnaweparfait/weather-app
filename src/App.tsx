import { useState, useEffect, useRef } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// --- TYPES ---
type ForecastHour = {
  time: string;
  temp_c: number;
  temp_f: number;
};

type WeatherType = {
  name: string;
  country: string;
  temp_c: number;
  temp_f: number;
  condition: string;
  icon: string;
  humidity: number;
  wind: number;
  feelslike_c: number;
  feelslike_f: number;
  forecast: ForecastHour[];
} | null;

type Suggestion = {
  id: number;
  name: string;
  country: string;
};

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<WeatherType>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [unit, setUnit] = useState<"C" | "F">("C");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const apiKey = "cc7c674939a14fcaac7172742262704";
  const searchRef = useRef<HTMLDivElement>(null);

  // Initialisation
  useEffect(() => {
    const savedFavs = localStorage.getItem("proWeatherFavorites");
    if (savedFavs) setFavorites(JSON.parse(savedFavs));

    const savedTheme = localStorage.getItem("weatherTheme");
    if (savedTheme === "dark") setIsDarkMode(true);

    const savedUnit = localStorage.getItem("weatherUnit") as "C" | "F";
    if (savedUnit) setUnit(savedUnit);

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeather(`${pos.coords.latitude},${pos.coords.longitude}`),
      () => setLoading(false)
    );

    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Autocomplétion
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCity(value);

    if (value.length > 2) {
      try {
        const res = await fetch(`https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${value}`);
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch {
        console.error("Erreur d'autocomplétion");
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Récupération de la météo principale
  const fetchWeather = async (query: string) => {
    try {
      setLoading(true);
      setError("");
      setShowSuggestions(false);

      const res = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${query}&days=1&lang=fr`);
      const data = await res.json();

      if (data.error) {
        setError("Ville introuvable.");
        return;
      }

      const hourlyData = data.forecast.forecastday[0].hour.map((h: any) => ({
        time: h.time.split(" ")[1],
        temp_c: Math.round(h.temp_c),
        temp_f: Math.round(h.temp_f),
      }));

      setWeather({
        name: data.location.name,
        country: data.location.country,
        temp_c: data.current.temp_c,
        temp_f: data.current.temp_f,
        condition: data.current.condition.text,
        icon: data.current.condition.icon,
        humidity: data.current.humidity,
        wind: data.current.wind_kph,
        feelslike_c: data.current.feelslike_c,
        feelslike_f: data.current.feelslike_f,
        forecast: hourlyData,
      });

      setCity("");
    } catch {
      setError("Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (name: string) => {
    const newFavs = favorites.includes(name)
      ? favorites.filter((f) => f !== name)
      : [...favorites, name];
    setFavorites(newFavs);
    localStorage.setItem("proWeatherFavorites", JSON.stringify(newFavs));
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem("weatherTheme", newTheme ? "dark" : "light");
  };

  const toggleUnit = () => {
    const newUnit = unit === "C" ? "F" : "C";
    setUnit(newUnit);
    localStorage.setItem("weatherUnit", newUnit);
  };

  // Variables calculées pour l'affichage
  const currentTemp = unit === "C" ? weather?.temp_c : weather?.temp_f;
  const currentFeelsLike = unit === "C" ? weather?.feelslike_c : weather?.feelslike_f;
  const chartDataKey = unit === "C" ? "temp_c" : "temp_f";

  return (
    <div data-theme={isDarkMode ? "dark" : "light"} className="app-container">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

          :root {
            --bg-main: #f3f4f6;
            --bg-card: #ffffff;
            --text-main: #1f2937;
            --text-secondary: #64748b;
            --border-color: #e5e7eb;
            --input-bg: #f9fafb;
            --primary: #3b82f6;
            --primary-hover: #2563eb;
            --chart-fill: #93c5fd;
            --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
          }

          [data-theme="dark"] {
            --bg-main: #0f172a;
            --bg-card: #1e293b;
            --text-main: #f8fafc;
            --text-secondary: #94a3b8;
            --border-color: #334155;
            --input-bg: #0f172a;
            --primary: #3b82f6;
            --primary-hover: #60a5fa;
            --chart-fill: #1e3a8a;
            --shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
          }

          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: var(--bg-main); transition: background-color 0.3s; }

          .app-container { min-height: 100vh; display: flex; justify-content: center; padding: 2rem 1rem; color: var(--text-main); }
          .dashboard-grid { width: 100%; max-width: 1000px; display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
          @media (min-width: 800px) { .dashboard-grid { grid-template-columns: 1fr 1fr; } }

          .card { background: var(--bg-card); border-radius: 20px; padding: 2rem; box-shadow: var(--shadow); border: 1px solid var(--border-color); transition: all 0.3s; }
          
          .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
          .header h1 { font-size: 1.5rem; font-weight: 700; display: flex; alignItems: center; gap: 0.5rem; }
          .btn-icon { background: var(--input-bg); border: 1px solid var(--border-color); color: var(--text-main); padding: 0.5rem 1rem; border-radius: 10px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
          .btn-icon:hover { border-color: var(--primary); }

          .search-container { position: relative; display: flex; gap: 0.5rem; margin-bottom: 1.5rem; }
          .search-input { flex: 1; padding: 0.875rem 1rem; border-radius: 12px; border: 1px solid var(--border-color); background: var(--input-bg); color: var(--text-main); outline: none; font-size: 1rem; transition: border-color 0.2s; }
          .search-input:focus { border-color: var(--primary); }
          .search-btn { background: var(--primary); color: white; border: none; padding: 0 1.25rem; border-radius: 12px; cursor: pointer; font-weight: 600; transition: background 0.2s; }
          .search-btn:hover { background: var(--primary-hover); }

          /* Dropdown Suggestions */
          .suggestions-box { position: absolute; top: 110%; left: 0; right: 80px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; box-shadow: var(--shadow); z-index: 10; overflow: hidden; }
          .suggestion-item { padding: 0.75rem 1rem; cursor: pointer; border-bottom: 1px solid var(--border-color); transition: background 0.2s; }
          .suggestion-item:last-child { border-bottom: none; }
          .suggestion-item:hover { background: var(--input-bg); }

          .weather-main { text-align: center; position: relative; }
          .fav-btn { position: absolute; top: 0; right: 0; background: none; border: none; font-size: 1.5rem; cursor: pointer; }
          .weather-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.25rem; }
          .weather-subtitle { color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem; }
          .weather-icon { width: 90px; height: 90px; margin: 0 auto; }
          .temp-huge { font-size: 4rem; font-weight: 800; line-height: 1; margin: 0.5rem 0; }
          .condition-text { font-size: 1.1rem; font-weight: 500; text-transform: capitalize; margin-bottom: 1.5rem; }

          .stats-flex { display: flex; justify-content: space-around; border-top: 1px solid var(--border-color); padding-top: 1.5rem; margin-bottom: 2rem; }
          .stat-box { display: flex; flex-direction: column; gap: 0.25rem; }
          .stat-label { font-size: 0.8rem; text-transform: uppercase; color: var(--text-secondary); font-weight: 600; }
          .stat-value { font-size: 1.1rem; font-weight: 700; }

          .chart-container { width: 100%; height: 200px; margin-top: 1rem; }

          .fav-list { list-style: none; display: flex; flex-direction: column; gap: 0.75rem; }
          .fav-item { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--input-bg); border: 1px solid var(--border-color); border-radius: 12px; cursor: pointer; transition: all 0.2s; }
          .fav-item:hover { border-color: var(--primary); }
          .fav-name { font-weight: 600; }
          .fav-delete { background: none; border: none; color: #ef4444; cursor: pointer; font-size: 1.2rem; }
        `}
      </style>

      <div className="dashboard-grid">
        {/* COLONNE GAUCHE : RECHERCHE ET METEO */}
        <div className="card">
          <div className="header">
            <h1>☁️ Météo Pro</h1>
            <div style={{ display: "flex", gap: "10px" }}>
              <button className="btn-icon" onClick={toggleUnit}>
                {unit === "C" ? "°F" : "°C"}
              </button>
              <button className="btn-icon" onClick={toggleTheme}>
                {isDarkMode ? "☀️" : "🌙"}
              </button>
            </div>
          </div>

          <div className="search-container" ref={searchRef}>
            <input
              className="search-input"
              value={city}
              onChange={handleSearchChange}
              onKeyDown={(e) => e.key === "Enter" && fetchWeather(city)}
              placeholder="Ex: Dakar, Paris..."
            />
            <button className="search-btn" onClick={() => fetchWeather(city)}>
              🔍
            </button>

            {/* AFFICHAGE DES SUGGESTIONS */}
            {showSuggestions && suggestions.length > 0 && (
              <ul className="suggestions-box">
                {suggestions.map((sug) => (
                  <li 
                    key={sug.id} 
                    className="suggestion-item"
                    onClick={() => fetchWeather(sug.name)}
                  >
                    {sug.name}, <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>{sug.country}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && <p style={{ color: "#ef4444", marginBottom: "1rem" }}>{error}</p>}
          {loading && <p style={{ color: "var(--text-secondary)", textAlign: "center" }}>Recherche en cours...</p>}

          {weather && !loading && (
            <div className="weather-main">
              <button className="fav-btn" onClick={() => toggleFavorite(weather.name)}>
                {favorites.includes(weather.name) ? "⭐" : "☆"}
              </button>

              <h2 className="weather-title">{weather.name}</h2>
              <p className="weather-subtitle">{weather.country}</p>
              
              <img src={weather.icon} alt="Météo" className="weather-icon" />
              <div className="temp-huge">{Math.round(currentTemp!)}°{unit}</div>
              <p className="condition-text">{weather.condition}</p>

              <div className="stats-flex">
                <div className="stat-box">
                  <span className="stat-label">Ressenti</span>
                  <span className="stat-value">{Math.round(currentFeelsLike!)}°{unit}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">Humidité</span>
                  <span className="stat-value">{weather.humidity}%</span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">Vent</span>
                  <span className="stat-value">{weather.wind} km/h</span>
                </div>
              </div>

              {/* GRAPHIQUE RECHARTS */}
              <h3 style={{ textAlign: "left", fontSize: "1rem", marginBottom: "1rem", color: "var(--text-secondary)" }}>
                Prévisions aujourd'hui
              </h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weather.forecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "var(--bg-card)", borderRadius: "8px", border: "1px solid var(--border-color)", color: "var(--text-main)" }}
                      formatter={(value: any) => [`${value ?? 0}°${unit}`, 'Température']}
                    />
                    <Area type="monotone" dataKey={chartDataKey} stroke="var(--primary)" fillOpacity={1} fill="url(#colorTemp)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* COLONNE DROITE : FAVORIS */}
        <div className="card">
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>📌</span> Lieux épinglés
          </h2>

          {favorites.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", textAlign: "center", marginTop: "2rem" }}>
              Aucune ville enregistrée.<br/> Cliquez sur l'étoile pour en ajouter.
            </p>
          ) : (
            <ul className="fav-list">
              {favorites.map((fav) => (
                <li key={fav} className="fav-item" onClick={() => fetchWeather(fav)}>
                  <span className="fav-name">{fav}</span>
                  <button 
                    className="fav-delete" 
                    onClick={(e) => {
                      e.stopPropagation(); // Évite de déclencher fetchWeather quand on clique sur supprimer
                      toggleFavorite(fav);
                    }}
                  >
                    🗑️
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;