import dotenv from 'dotenv';
dotenv.config();

// TODO: Define an interface for the Coordinates object

interface Coordinates {
  lat: number;
  lon: number;
}

// TODO: Define a class for the Weather object

class Weather {
  temperature: number;
  windSpeed: number;
  humidity: number;

  constructor(temperature: number, windSpeed: number, humidity: number) {
    this.temperature = temperature;
    this.windSpeed = windSpeed;
    this.humidity = humidity;
  }
}

// TODO: Complete the WeatherService class
class WeatherService {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = 'https://api.openweathermap.org/data/2.5/';
    this.apiKey = 'c6d2bdc1894f94cef0bb2e192a210c0c';
 }
}

// TODO: Define the baseURL, API key, and city name properties



  // TODO: Create fetchLocationData method
  
private async fetchLocationData(query: string): Promise<any> {
  const url = `${this.baseURL}/geo/1.0/direct?q=${query}&limit=1&appid=${this.apiKey}`;
  const response = await fetch(url);
  return response.json();

}

  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: any): Coordinates {
    const { lat, lon } = locationData[0];
    return { lat, lon };
  }
  // TODO: Create buildGeocodeQuery method
  // private buildGeocodeQuery(): string {}
  // TODO: Create buildWeatherQuery method
  // private buildWeatherQuery(coordinates: Coordinates): string {}
  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData(query: string): Promise<Coordinates> {
    const locationData: Coordinates = await this.fetchLocationData(query);
    return this.destructureLocationData(locationData);
  }
  // TODO: Create fetchWeatherData method
  // private async fetchWeatherData(coordinates: Coordinates) {}
  // TODO: Build parseCurrentWeather method
  // private parseCurrentWeather(response: any) {}
  // TODO: Complete buildForecastArray method
  // private buildForecastArray(currentWeather: Weather, weatherData: any[]) {}
  // TODO: Complete getWeatherForCity method
  // async getWeatherForCity(city: string) {}
}

export default new WeatherService();
