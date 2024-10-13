import fs from 'fs/promises';
import path from 'path';

class City {
  id: string;
  name: string;

  constructor(name: string) {
    this.id = Date.now().toString();
    this.name = name;
  }
}

class HistoryService {
  private filePath: string;

  constructor() {
    this.filePath = path.join(__dirname, '..', '..', 'data', 'searchHistory.json');
  }

  private async read(): Promise<City[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  private async write(cities: City[]): Promise<void> {
    await fs.writeFile(this.filePath, JSON.stringify(cities, null, 2));
  }

  async getCities(): Promise<City[]> {
    return this.read();
  }

  async addCity(cityName: string): Promise<void> {
    const cities = await this.read();
    const newCity = new City(cityName);
    cities.push(newCity);
    await this.write(cities);
  }

  async removeCity(cityId: string): Promise<void> {
    let cities = await this.read();
    cities = cities.filter(city => city.id !== cityId);
    await this.write(cities);
  }
}

export default new HistoryService();
