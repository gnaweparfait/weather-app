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
  
  // État pour savoir si les notifications sont acceptées
  const [notifPermission, setNotifPermission] = useState(
    "Notification" in window ? Notification.permission : "default"
  );

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

  // --- LOGIQUE DES NOTIFICATIONS 🔔 ---
  const handleNotification = () => {
    if (!("Notification" in window)) {
      alert("Votre navigateur ne supporte pas les notifications.");
      return;
    }

    if (Notification.permission === "granted") {
      sendWeatherNotification();
    } else if (Notification.permission !== "denied") {
      // Demande la permission à l'utilisateur
      Notification.requestPermission().then((permission) => {
        setNotifPermission(permission);
        if (permission === "granted") {
          sendWeatherNotification();
        }
      });
    } else {
      alert("Vous avez bloqué les notifications. Veuillez les réactiver dans les paramètres de votre navigateur.");
    }
  };

  const sendWeatherNotification = () => {
    if (weather) {
      const temp = unit === "C" ? weather.temp_c : weather.temp_f;
      
      // On force le type "any" pour que TypeScript accepte "vibrate" sans erreur
      const notifOptions: any = {
        body: `Il fait actuellement ${Math.round(temp)}°${unit}. Condition : ${weather.condition}.`,
        icon: weather.icon,
        badge: '/icon-192x192.png',
        vibrate: [200, 100, 200]
      };

      new Notification(`Météo à ${weather.name} 🌍`, notifOptions);
    } else {
      new Notification("Météo Pro prête ! 🌤️", {
        body: "Les notifications sont activées. Recherchez une ville pour faire un test.",
        badge: '/icon-192x192.png',
      });
    }
  };

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
        setError("Ville introuvable. Vérifiez l'orthographe.");
        return;
      }

      const hourlyData = data.forecast?.forecastday?.[0]?.hour?.map((h: any) => ({
        time: h.time?.split(" ")?.[1] || "00:00",
        temp_c: Math.round(h.temp_c),
        temp_f: Math.round(h.temp_f),
      })) || [];

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
      setError("Erreur de connexion au serveur.");
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
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

          :root {
            --bg-gradient: linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%);
            --glass-bg: rgba(255, 255, 255, 0.7);
            --glass-border: rgba(255, 255, 255, 0.5);
            --text-main: #1e293b;
            --text-secondary: #64748b;
            --primary: #3b82f6;
            --primary-hover: #2563eb;
            --widget-bg: rgba(255, 255, 255, 0.5);
            --shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
          }

          [data-theme="dark"] {
            --bg-gradient: linear-gradient(135deg, #0f172a 0%, #1e1e2f 100%);
            --glass-bg: rgba(30, 41, 59, 0.7);
            --glass-border: rgba(255, 255, 255, 0.08);
            --text-main: #f8fafc;
            --text-secondary: #94a3b8;
            --primary: #60a5fa;
            --primary-hover: #3b82f6;
            --widget-bg: rgba(15, 23, 42, 0.6);
            --shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
          }

          * { box-sizing: border-box; margin: 0; padding: 0; }
          
          body { 
            font-family: 'Outfit', sans-serif; 
            background: var(--bg-gradient); 
            background-attachment: fixed;
            transition: background 0.5s ease; 
            color: var(--text-main);
            -webkit-font-smoothing: antialiased;
          }

          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          .app-container { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem 1rem; }
          .dashboard-grid { width: 100%; max-width: 1100px; display: grid; grid-template-columns: 1fr; gap: 2rem; animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          @media (min-width: 850px) { .dashboard-grid { grid-template-columns: 1.2fr 0.8fr; } }

          .glass-card { background: var(--glass-bg); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-radius: 28px; padding: 2.5rem; box-shadow: var(--shadow); border: 1px solid var(--glass-border); transition: transform 0.3s ease, box-shadow 0.3s ease; }
          
          .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
          .header h1 { font-size: 1.8rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem; letter-spacing: -0.5px; }
          
          .controls { display: flex; gap: 0.8rem; }
          .btn-icon { background: var(--widget-bg); border: 1px solid var(--glass-border); color: var(--text-main); width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; font-weight: 600; font-size: 1.1rem; transition: all 0.2s ease; }
          .btn-icon:hover { transform: scale(1.05); background: var(--primary); color: white; border-color: var(--primary); }
          .btn-icon.active-notif { background: #10b981; color: white; border-color: #10b981; }

          .search-container { position: relative; display: flex; gap: 0.5rem; margin-bottom: 2rem; }
          .search-input { flex: 1; padding: 1.2rem 1.5rem; border-radius: 99px; border: 1px solid var(--glass-border); background: var(--widget-bg); color: var(--text-main); outline: none; font-size: 1.05rem; transition: all 0.3s ease; font-family: inherit; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); }
          .search-input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15); }
          .search-btn { background: var(--primary); color: white; border: none; width: 56px; height: 56px; border-radius: 50%; cursor: pointer; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; transition: all 0.2s; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
          .search-btn:hover { background: var(--primary-hover); transform: scale(1.05); }

          .suggestions-box { position: absolute; top: calc(100% + 10px); left: 0; right: 65px; background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: 20px; box-shadow: var(--shadow); z-index: 20; overflow: hidden; list-style: none; animation: fadeIn 0.2s; }
          .suggestion-item { padding: 1rem 1.5rem; cursor: pointer; border-bottom: 1px solid var(--glass-border); transition: background 0.2s; }
          .suggestion-item:last-child { border-bottom: none; }
          .suggestion-item:hover { background: var(--widget-bg); padding-left: 1.8rem; }

          .weather-main { text-align: center; position: relative; animation: fadeIn 0.5s ease; }
          .fav-btn-main { position: absolute; top: 0; right: 0; background: var(--widget-bg); border: 1px solid var(--glass-border); width: 45px; height: 45px; border-radius: 50%; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
          .fav-btn-main:hover { transform: scale(1.15); }
          
          .weather-title { font-size: 2rem; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 0.2rem; }
          .weather-subtitle { color: var(--text-secondary); font-size: 1rem; font-weight: 500; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 2px; }
          .weather-icon { width: 120px; height: 120px; margin: 0 auto; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.15)); transition: transform 0.3s; }
          .weather-icon:hover { transform: scale(1.05) rotate(2deg); }
          .temp-huge { font-size: 5.5rem; font-weight: 800; line-height: 1; margin: 1rem 0; letter-spacing: -3px; color: var(--text-main); }
          .condition-text { font-size: 1.3rem; font-weight: 600; text-transform: capitalize; margin-bottom: 2.5rem; color: var(--primary); }

          .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2.5rem; }
          .stat-widget { background: var(--widget-bg); border: 1px solid var(--glass-border); padding: 1.2rem; border-radius: 20px; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; transition: transform 0.2s; }
          .stat-widget:hover { transform: translateY(-3px); }
          .stat-icon { font-size: 1.5rem; }
          .stat-label { font-size: 0.75rem; text-transform: uppercase; color: var(--text-secondary); font-weight: 700; letter-spacing: 1px; }
          .stat-value { font-size: 1.2rem; font-weight: 800; }

          .chart-container { width: 100%; height: 220px; margin-top: 1rem; }
          .chart-title { text-align: left; font-size: 1.1rem; font-weight: 700; margin-bottom: 1.5rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.5rem; }

          .fav-list { list-style: none; display: flex; flex-direction: column; gap: 1rem; }
          .fav-item { display: flex; justify-content: space-between; align-items: center; padding: 1.2rem 1.5rem; background: var(--widget-bg); border: 1px solid var(--glass-border); border-radius: 20px; cursor: pointer; transition: all 0.3s ease; }
          .fav-item:hover { transform: translateX(5px); border-color: var(--primary); background: var(--glass-bg); }
          .fav-info { display: flex; align-items: center; gap: 1rem; }
          .fav-pin { font-size: 1.2rem; }
          .fav-name { font-weight: 700; font-size: 1.1rem; }
          .fav-delete { background: rgba(239, 68, 68, 0.1); border: none; color: #ef4444; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1.1rem; transition: all 0.2s; }
          .fav-delete:hover { background: #ef4444; color: white; transform: rotate(10deg); }

          .developer-signature { margin-top: 3rem; padding: 1rem 2rem; background: var(--glass-bg); backdrop-filter: blur(10px); border: 1px solid var(--glass-border); border-radius: 99px; color: var(--text-main); font-size: 0.95rem; font-weight: 600; letter-spacing: 0.5px; display: flex; align-items: center; gap: 0.8rem; box-shadow: 0 4px 15px rgba(0,0,0,0.05); animation: slideUp 0.8s ease forwards; animation-delay: 0.2s; opacity: 0; }
          .dev-badge { background: var(--primary); color: white; padding: 0.3rem 0.8rem; border-radius: 99px; font-size: 0.8rem; font-weight: 800; text-transform: uppercase; }
        `}
      </style>

      <div className="dashboard-grid">
        {/* COLONNE GAUCHE : RECHERCHE ET METEO */}
        <div className="glass-card">
          <div className="header">
            <h1>☁️ Météo Pro</h1>
            <div className="controls">
              {/* BOUTON NOTIFICATION 🔔 */}
              <button 
                className={`btn-icon ${notifPermission === 'granted' ? 'active-notif' : ''}`} 
                onClick={handleNotification} 
                title="Tester les notifications"
              >
                🔔
              </button>
              <button className="btn-icon" onClick={toggleUnit} title="Changer l'unité">
                {unit === "C" ? "°F" : "°C"}
              </button>
              <button className="btn-icon" onClick={toggleTheme} title="Changer le thème">
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
              placeholder="Rechercher une ville, un pays..."
            />
            <button className="search-btn" onClick={() => fetchWeather(city)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>

            {/* SUGGESTIONS */}
            {showSuggestions && suggestions.length > 0 && (
              <ul className="suggestions-box">
                {suggestions.map((sug) => (
                  <li 
                    key={sug.id} 
                    className="suggestion-item"
                    onClick={() => fetchWeather(sug.name)}
                  >
                    <span style={{ fontWeight: 600 }}>{sug.name}</span>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginLeft: "8px" }}>{sug.country}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && <p style={{ color: "#ef4444", marginBottom: "1.5rem", fontWeight: "600", textAlign: "center", background: "rgba(239, 68, 68, 0.1)", padding: "1rem", borderRadius: "12px" }}>{error}</p>}
          {loading && <p style={{ color: "var(--primary)", textAlign: "center", fontWeight: "600", padding: "2rem 0" }}>Analyse des données météo...</p>}

          {weather && !loading && (
            <div className="weather-main">
              <button 
                className="fav-btn-main" 
                onClick={() => toggleFavorite(weather.name)}
                title={favorites.includes(weather.name) ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                {favorites.includes(weather.name) ? "⭐" : "☆"}
              </button>

              <h2 className="weather-title">{weather.name}</h2>
              <p className="weather-subtitle">{weather.country}</p>
              
              <img src={weather.icon} alt={weather.condition} className="weather-icon" />
              <div className="temp-huge">{Math.round(currentTemp!)}°</div>
              <p className="condition-text">{weather.condition}</p>

              {/* Widgets Météo */}
              <div className="stats-grid">
                <div className="stat-widget">
                  <span className="stat-icon">🌡️</span>
                  <span className="stat-label">Ressenti</span>
                  <span className="stat-value">{Math.round(currentFeelsLike!)}°{unit}</span>
                </div>
                <div className="stat-widget">
                  <span className="stat-icon">💧</span>
                  <span className="stat-label">Humidité</span>
                  <span className="stat-value">{weather.humidity}%</span>
                </div>
                <div className="stat-widget">
                  <span className="stat-icon">💨</span>
                  <span className="stat-label">Vent</span>
                  <span className="stat-value">{weather.wind} km/h</span>
                </div>
              </div>

              {/* GRAPHIQUE RECHARTS */}
              {weather.forecast.length > 0 && (
                <>
                  <h3 className="chart-title">
                    <span>📈</span> Évolution aujourd'hui
                  </h3>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={weather.forecast} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.6}/>
                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                        <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} dx={-5} />
                        <Tooltip 
                          contentStyle={{ background: "var(--glass-bg)", backdropFilter: "blur(10px)", borderRadius: "12px", border: "1px solid var(--glass-border)", color: "var(--text-main)", fontWeight: "600", boxShadow: "var(--shadow)" }}
                          itemStyle={{ color: "var(--primary)" }}
                          formatter={(value: any) => [`${value ?? 0}°${unit}`, 'Température']}
                        />
                        <Area type="monotone" dataKey={chartDataKey} stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* COLONNE DROITE : FAVORIS */}
        <div className="glass-card" style={{ height: "fit-content" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.8rem", letterSpacing: "-0.5px" }}>
            <span>📌</span> Lieux épinglés
          </h2>

          {favorites.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", background: "var(--widget-bg)", borderRadius: "20px", border: "1px dashed var(--glass-border)" }}>
              <span style={{ fontSize: "2.5rem", display: "block", marginBottom: "1rem" }}>🌍</span>
              <p style={{ color: "var(--text-secondary)", fontWeight: "500", lineHeight: "1.5" }}>
                Aucune ville enregistrée.<br/>Recherchez une ville et cliquez sur l'étoile pour l'ajouter ici.
              </p>
            </div>
          ) : (
            <ul className="fav-list">
              {favorites.map((fav) => (
                <li key={fav} className="fav-item" onClick={() => fetchWeather(fav)}>
                  <div className="fav-info">
                    <span className="fav-pin">📍</span>
                    <span className="fav-name">{fav}</span>
                  </div>
                  <button 
                    className="fav-delete" 
                    title="Supprimer des favoris"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(fav);
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* SIGNATURE DEVELOPPEUR */}
      <div className="developer-signature">
        <span className="dev-badge">Dev</span>
        <span>Gnawé Parfait — Informaticien & Développeur</span>
      </div>
      
    </div>
  );
}

export default App;