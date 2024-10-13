import { Router, Request, Response } from 'express';
import WeatherService from '../../service/weatherService.js';
import HistoryService from '../../service/historyService.js';
const router = Router();

// POST Request with city name to retrieve weather data



// TODO: POST Request with city name to retrieve weather data
router.post('/', (req, res) => {

  
});





// TODO: GET weather data from city name
  // TODO: save city to search history

// TODO: GET search history
router.get('/history', async (req, res) => {
  // TODO: Implement the logic to retrieve and send search history
});

// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (req, res) => {});

export default router;
