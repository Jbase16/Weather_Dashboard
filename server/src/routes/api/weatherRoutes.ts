import { Router } from "express";
import HistoryService from "../../service/historyService.js";
import WeatherService from "../../service/weatherService.js";

const router = Router();
const historyService = new HistoryService(); // Instantiate the service

// POST Request with city name to retrieve weather data
router.post("/", async (_req, _res) => {
  const { city } = _req.body;

  if (!city) {
    return _res.status(400).json({ error: "City name is required" });
  }

  try {
    // GET weather data from city name
    const weatherData = await WeatherService.getWeatherForCity(city);
    _res.json(weatherData);

    // Save city to search history
    await historyService.addCity(city);

    // Return success message
    return _res.status(200).json({ message: "City added to search history" });
  } catch (error) {
    return _res.status(500).json({ error: "Error retrieving weather data" });
  }
});

// GET search history
router.get("/history", async (_req, _res) => {
  try {
    const cities = await historyService.getCities();
    _res.json(cities);
  } catch (error) {
    _res.status(500).json({ error: "Could not retrieve search history" });
  }
});

// BONUS: DELETE city from search history
router.delete("/history/:id", async (_req, _res) => {
  const { id } = _req.params;

  try {
    await historyService.removeCity(id);
    _res.json({ message: "City removed from search history" });
  } catch (error) {
    _res.status(500).json({ error: "Error removing city from search history" });
  }
});

export default router;
