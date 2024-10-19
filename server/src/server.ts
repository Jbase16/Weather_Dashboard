import express from "express";
import fs from "fs";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

dotenv.config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.static(path.join(__dirname, "../../client")));
app.use(express.json());

const searchHistoryPath = path.join(__dirname, "../db/searchHistory.json");

app.get("*", (_, res) => {
  res.sendFile(path.join(__dirname, "../../client/index.html"));
});

// API Route: Get Search History
app.get("/api/weather/history", (_, res) => {
  fs.readFile(searchHistoryPath, "utf8", (err, data) => {
    if (err) {
      res.status(500).json({ error: "Could not read search history" });
      return;
    }
    res.json(JSON.parse(data));
  });
});

// API Route: Post Weather Data for City
app.post("/api/weather", async (req, res) => {
  const { city } = req.body;

  if (!city) {
    res.status(400).json({ error: "City name is required" });
    return;
  }

  try {
    const geoResponse = await axios.get(
      `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${process.env.API_KEY}`
    );

    if (geoResponse.data.length === 0) {
      res.status(404).json({ error: "City not found" });
      return;
    }

    const { lat, lon } = geoResponse.data[0];
    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.API_KEY}`
    );

    const cityData = {
      id: uuidv4(),
      name: city,
      lat,
      lon,
    };

    fs.readFile(searchHistoryPath, "utf8", (err, data) => {
      let searchHistory = [];
      if (!err && data) {
        searchHistory = JSON.parse(data);
      }
      searchHistory.push(cityData);
      fs.writeFile(
        searchHistoryPath,
        JSON.stringify(searchHistory, null, 2),
        (err) => {
          if (err) {
            res.status(500).json({ error: "Could not save search history" });
            return;
          }

          res.json(weatherResponse.data);
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: "Error fetching weather data" });
  }
});

// API Route: Delete City from Search History
app.delete("/api/weather/history/:id", (req, res) => {
  const { id } = req.params;

  fs.readFile(searchHistoryPath, "utf8", (err, data) => {
    if (err) {
      res.status(500).json({ error: "Could not read search history" });
      return;
    }

    let searchHistory = JSON.parse(data);
    const updatedHistory = searchHistory.filter(
      (city: { id: string }) => city.id !== id
    );

    fs.writeFile(
      searchHistoryPath,
      JSON.stringify(updatedHistory, null, 2),
      (err) => {
        if (err) {
          res.status(500).json({ error: "Could not update search history" });
          return;
        }

        res.json({ message: "City deleted successfully" });
      }
    );
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// import routes from "./routes/index.js";

// TODO: Serve static files of entire client dist folder

// TODO: Implement middleware for parsing JSON and urlencoded form data

// TODO: Implement middleware to connect the routes
