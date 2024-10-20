import dotenv from 'dotenv';
dotenv.config();

// Define an interface for the Coordinates object

interface Coordinates {
  lat: number;
  lon: number;
}

// Define a class for the Weather object

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

// Complete the WeatherService class

// Define the baseURL and API key properties

class WeatherService {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL =
      "api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API key}";
    this.apiKey = 'c6d2bdc1894f94cef0bb2e192a210c0c';
  }

  //Create fetchLocationData method
  
  private async fetchLocationData(query: string): Promise<any> {
    const url = `${this.baseURL}/geo/1.0/direct?q=${query}&limit=1&appid=${this.apiKey}`;
    const response = await fetch(url);
    return response.json();
  }

  //Create destructureLocationData method

  private destructureLocationData(locationData: any): Coordinates {
    const { lat, lon } = locationData[0];
    return { lat, lon };
  }

  //Create buildWeatherQuery method
  
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}`;
  }
  
  //Create fetchAndDestructureLocationData method

  private async fetchAndDestructureLocationData(query: string): Promise<Coordinates> {
    const locationData = await this.fetchLocationData(query);
    return this.destructureLocationData(locationData);
  }

  //Create fetchWeatherData method

  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    const url = this.buildWeatherQuery(coordinates);
    const response = await fetch(url);
    return response.json();
  }

  //Build parseCurrentWeather method
  
  private parseCurrentWeather(response: any): Weather {
    const { temp } = response.list[0].main;
    const { speed } = response.list[0].wind;
    const { humidity } = response.list[0].main;

    return new Weather(temp, speed, humidity);
  }

  //Complete getWeatherForCity method
  
  async getWeatherForCity(city: string): Promise<Weather> {
    const coordinates = await this.fetchAndDestructureLocationData(city);
    const weatherData = await this.fetchWeatherData(coordinates);
    return this.parseCurrentWeather(weatherData);
  }
}

export default new WeatherService();
