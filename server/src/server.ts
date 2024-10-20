import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url"; // Import fileURLToPath from 'url' module
import axios from "axios";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import routes from "./routes/index.js"; // Import the central router from the routes folder

dotenv.config(); // Load environment variables from .env file

// Get the directory name using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize the Express application
const app = express();
const PORT = process.env.PORT || 3000;

// 1. Serve static files from the 'client' folder
// This line serves all the client-side static assets, such as CSS, JS, and HTML
app.use(express.static(path.join(__dirname, "../../client")));

// 2. Middleware for parsing request bodies
// Middleware to parse JSON request bodies
app.use(express.json());
// Middleware to parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// 3. Implement middleware to connect the routes from 'index.ts'
// This will connect all the API and HTML routes defined in your router files.
app.use(routes);

// Example file path for storing search history
const searchHistoryPath = path.join(__dirname, "../db/searchHistory.json");

// 4. Fallback route to serve the main HTML page
// This is used to serve the main index.html for any unmatched routes to enable SPA (Single Page Application) behavior.
app.get("*", (_: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../../client/index.html"));
});

// 5. Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// GET /api/weather/history: Get the search history
app.get("/api/weather/history", (_, res: Response) => {
  fs.readFile(searchHistoryPath, "utf8", (err, data) => {
    if (err) {
      res.status(500).json({ error: "Could not read search history" });
      return;
    }
    res.json(JSON.parse(data));
  });
});

// POST /api/weather: Add city weather data to search history
app.post("/api/weather", async (req: Request, res: Response) => {
  const { city } = req.body;

  if (!city) {
    res.status(400).json({ error: "City name is required" });
    return;
  }

  try {
    // Get coordinates for the city using OpenWeatherMap Geocoding API
    const geoResponse = await axios.get(
      `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${process.env.API_KEY}`
    );

    if (geoResponse.data.length === 0) {
      res.status(404).json({ error: "City not found" });
      return;
    }

    const { lat, lon } = geoResponse.data[0];

    // Ensure API_BASE_URL is defined
    const apiBaseUrl = process.env.API_BASE_URL;
    const apiKey = process.env.API_KEY || '';

    if (!apiBaseUrl) {
      throw new Error("API_BASE_URL is not defined in the environment variables.");
    }

    // Get the 5-day weather forecast data for the coordinates
    const weatherResponse = await axios.get(
      `${apiBaseUrl.replace('{lat}', lat).replace('{lon}', lon).replace('{API key}', apiKey)}`
    );

    // Add the city data with a unique ID to searchHistory.json
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

// DELETE /api/weather/history/:id: Delete city from search history by ID
app.delete("/api/weather/history/:id", (req: Request, res: Response) => {
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
