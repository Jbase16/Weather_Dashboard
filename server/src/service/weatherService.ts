import dotenv from "dotenv";
dotenv.config();

// Define an interface for the Coordinates object
interface Coordinates {
  latitude: number;
  longitude: number;
}

// Define a class for the Weather object
class Weather {
  temperature: number;
  description: string;
  constructor(temperature: number, description: string) {
    this.temperature = temperature;
    this.description = description;
  }
}

// Complete the WeatherService class
class WeatherService {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = "https://api.weatherapi.com/v1";
    this.apiKey = process.env.WEATHER_API_KEY || "";
  }

  // Create fetchLocationData method
  private async fetchLocationData(query: string): Promise<Coordinates> {
    // Mock implementation for fetching location data
    return { latitude: 0, longitude: 0 };
  }

  // Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates): Promise<Weather> {
    // Mock implementation for fetching weather data
    return new Weather(25, "Sunny");
  }

  // Complete getWeatherForCity method
  async getWeatherForCity(city: string): Promise<Weather> {
    const coordinates = await this.fetchLocationData(city);
    return this.fetchWeatherData(coordinates);
  }
}

export default new WeatherService();
