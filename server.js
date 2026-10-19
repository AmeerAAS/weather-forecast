const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;
const API_KEY = process.env.WEATHER_API_KEY;

// Cities mapped by requested global regions
const REGIONS = {
  "Asia": [
    { city: "Tokyo", country: "JP" },
    { city: "Singapore", country: "SG" },
    { city: "Kuala Lumpur", country: "MY" },
    { city: "Beijing", country: "CN" },
    { city: "Bangkok", country: "TH" }
  ],
  "Main Europe": [
    { city: "Paris", country: "FR" },
    { city: "Berlin", country: "DE" },
    { city: "Madrid", country: "ES" },
    { city: "Rome", country: "IT" },
    { city: "Amsterdam", country: "NL" }
  ],
  "London": [
    { city: "London", country: "GB" }
  ],
  "USA": [
    { city: "New York", country: "US" },
    { city: "Los Angeles", country: "US" },
    { city: "Chicago", country: "US" }
  ],
  "South America": [
    { city: "Sao Paulo", country: "BR" },
    { city: "Buenos Aires", country: "AR" },
    { city: "Bogota", country: "CO" }
  ],
  "Canada": [
    { city: "Toronto", country: "CA" },
    { city: "Vancouver", country: "CA" },
    { city: "Montreal", country: "CA" }
  ],
  "Australia": [
    { city: "Sydney", country: "AU" },
    { city: "Melbourne", country: "AU" }
  ],
  "South Africa": [
    { city: "Johannesburg", country: "ZA" },
    { city: "Cape Town", country: "ZA" }
  ]
};

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/weather', async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({ error: "WEATHER_API_KEY environment variable is missing" });
  }

  try {
    const weatherData = {};

    for (const [regionName, cities] of Object.entries(REGIONS)) {
      weatherData[regionName] = await Promise.all(
        cities.map(async ({ city, country }) => {
          try {
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${API_KEY}&units=metric`;
            const response = await axios.get(url);
            return {
              city: response.data.name,
              country: response.data.sys.country,
              temp: Math.round(response.data.main.temp),
              feels_like: Math.round(response.data.main.feels_like),
              condition: response.data.weather[0].main,
              humidity: response.data.main.humidity,
              icon: response.data.weather[0].icon
            };
          } catch (err) {
            return { city, country, error: "Unavailable" };
          }
        })
      );
    }

    res.json({ timestamp: new Date().toISOString(), regions: weatherData });
  } catch (error) {
    res.status(500).json({ error: "Failed to query weather API", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Live Weather Service listening on port ${PORT}`);
});
