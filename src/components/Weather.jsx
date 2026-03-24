import { useState } from "react";
import axios from "axios";
import { useEffect } from "react";

function Weather() {
  const [city, setCity] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
  const saved = JSON.parse(localStorage.getItem("history"));
  if (saved) setHistory(saved);
  setCity("Bengaluru");
  fetchDefaultWeather("Bengaluru");
}, []);
  const API_KEY = import.meta.env.VITE_API_KEY;

  const fetchDefaultWeather = async (defaultCity) => {
  try {
    setLoading(true);

    const res = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${defaultCity}&appid=${API_KEY}&units=metric`
    );

    const forecastRes = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=${defaultCity}&appid=${API_KEY}&units=metric`
    );

    const dailyData = forecastRes.data.list.filter(
      (item, index) => index % 8 === 0
    );

    setData(res.data);
    setForecast(dailyData);
    setError("");
  } catch {
    setError("Default city not loaded");
  } finally {
    setLoading(false);
  }
};
  const getWeather = async () => {
    if (!city) {
      setError("Please enter a city");
      return;
    }
    setLoading(true);

    try {
      // Current weather
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`,
      );

      // Forecast
      const forecastRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`,
      );

      // Filter: one item per day (every 8th item ≈ 24h)
      const dailyData = forecastRes.data.list.filter(
        (item, index) => index % 8 === 0,
      );
      const updatedHistory = [city, ...history.filter((c) => c !== city)].slice(
        0,
        5,
      );
      setHistory(updatedHistory);
      localStorage.setItem("history", JSON.stringify(updatedHistory));

      setData(res.data);
      setForecast(dailyData);
      setError("");
    } catch (err) {
      setError("City not found");
      setData(null);
      setForecast([]);
    } finally {
      setLoading(false);
    }
  };
  const getLocationWeather = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          setLoading(true);

          const res = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`,
          );

          setData(res.data);
          setError("");
        } catch {
          setError("Location not found");
        } finally {
          setLoading(false);
        }
      });
    }
  };
  // Dynamic background
  const getBackground = () => {
    if (!data) return "bg-light";

    const weather = data.weather[0].main;

    if (weather === "Clear") return "bg-warning";
    if (weather === "Rain") return "bg-dark text-white";
    if (weather === "Clouds") return "bg-secondary text-white";

    return "bg-info text-white";
  };

  return (
    <div
      className={`container-fluid d-flex justify-content-center  align-items-start min-vh-100 ${getBackground()}`}
    >
      <div className="card shadow p-4 w-100" style={{ maxWidth: "900px",width:"100%" }}>
        <h3 className="text-center mb-3">Weather App</h3>

        {/* Input */}
       
       <div className="mb-3">
  <input
    type="text"
    className="form-control mb-2"
    placeholder="Enter city"
    value={city}
    onChange={(e) => setCity(e.target.value)}
    onKeyDown={(e) => e.key === "Enter" && getWeather()}
  />

  <div className="d-flex gap-2 flex-wrap">
    <button className="btn btn-primary w-50" onClick={getWeather}>
      Search
    </button>

    <button className="btn btn-success w-50" onClick={getLocationWeather}>
      My Location
    </button>
  </div>
</div>
          {history.length > 0 && (
            <div className="mb-3">
              <small>Recent:</small>
              <div>
                {history.map((item, index) => (
                  <button
                    key={index}
                    className="btn btn-sm btn-outline-secondary m-1"
                    onClick={() => {
                      setCity(item);
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

        {/* Error */}
        {error && <div className="alert alert-danger">{error}
          </div>}

        {/* Loader */}
        {loading && (
          <div className="text-center">
            <div className="spinner-border text-primary">

            </div>
          </div>
        )}

        {/* Weather Data */}
        {data && !loading && (
          <div className="text-center">
            <h4>{data.name}</h4>

            {/* Weather Icon */}
            <img
              src={`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`}
              alt="weather"
            />
            <p>{new Date().toLocaleString()}</p>
            <h1>{data.main.temp} °C</h1>
            <p className="text-muted">{data.weather[0].main}</p>

            <p>Humidity: {data.main.humidity}%</p>
            <p>Wind: {data.wind.speed} km/h</p>
          </div>
        )}
        {forecast.length > 0 && !loading && (
  <div className="mt-4">
    <h5 className="text-center">5-Day Forecast</h5>

    <div className="d-flex justify-content-center flex-wrap">
      {forecast.map((item, index) => (
        <div
          key={index}
          className="card p-2 m-1 text-center flex-fill"
          style={{ width: "120px" }}
        >
          <small>
            {new Date(item.dt_txt).toLocaleDateString("en-US", {
              weekday: "short",
            })}
          </small>

          <img
            src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
            alt="icon"
          />

          <small>{Math.round(item.main.temp)}°C</small>
        </div>
      ))}
    </div>
  </div>
)}
        </div>
      
    </div>
  );
}

export default Weather;
