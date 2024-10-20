import express, { Request, Response } from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url"; 
import axios from "axios";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import routes from "./routes/index.js"; 

dotenv.config(); 

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize the Express application
const app = express();
const PORT = process.env.PORT || 3001;

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;

if (!API_BASE_URL || !API_KEY) {
  throw new Error("API_BASE_URL and API_KEY must be defined in environment variables");
}

app.use(express.static(path.join(__dirname, "../../client")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(routes);

const searchHistoryPath = path.join(__dirname, "../db/searchHistory.json");


app.get("*", (_: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../../client/index.html"));
});


app.get("/api/weather/history", async (_, res: Response) => {
  try {
    const data = await fs.readFile(searchHistoryPath, "utf8");
    res.json(JSON.parse(data));
  } catch (err) {
    console.error("Error reading search history:", err);
    res.status(500).json({ error: "Could not read search history" });
  }
});


app.post("/api/weather", async (req: Request, res: Response) => {
  const { city } = req.body;

  if (!city) {
    res.status(400).json({ error: "City name is required" });
    return;
  }

  try {
    const geoResponse = await axios.get(
      `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`
    );

    if (geoResponse.data.length === 0) {
      res.status(404).json({ error: "City not found" });
      return;
    }

    const { lat, lon } = geoResponse.data[0];

    const url = `${API_BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    const weatherResponse = await axios.get(url);

    const cityData = {
      id: uuidv4(),
      name: city,
      lat,
      lon,
    };

    let searchHistory = [];
    try {
      const data = await fs.readFile(searchHistoryPath, "utf8");
      searchHistory = JSON.parse(data);
    } catch (err) {
      console.warn("No existing search history, creating new one.");
    }

    searchHistory.push(cityData);
    await fs.writeFile(
      searchHistoryPath,
      JSON.stringify(searchHistory, null, 2)
    );
    res.json(weatherResponse.data);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).json({ error: "Error fetching weather data" });
  }
});

  

app.delete("/api/weather/history/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const data = await fs.readFile(searchHistoryPath, "utf8");
    let searchHistory = JSON.parse(data);
    const updatedHistory = searchHistory.filter(
      (city: { id: string }) => city.id !== id
    );

    await fs.writeFile(searchHistoryPath, JSON.stringify(updatedHistory, null, 2));
    res.json({ message: "City deleted successfully" });

  } catch (err) {
    console.error("Error deleting city from search history:", err);
    res.status(500).json({ error: "Could not update search history" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
    





  
      

    
        

    
    
    
    



