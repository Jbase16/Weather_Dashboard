// TODO: Define a City class with name and id properties

class City {
  name: string;
  id: string;

  constructor(name: string, id: string) {
    this.name = name;
    this.id = Date.now().toString();
  }
}




// TODO: Complete the HistoryService class

class HistoryService {
  private filePath: string;
  
  constructor() {
    this.filePath = path.join(__dirname, '..', 'data', 'searchHistory.json');
  }
    
    // Add methods here later  
  }

// TODO: Define a read method that reads from the searchHistory.json file

private async read(): Promise<City[]> {
  try {
    const data = await fs.readFile(this.filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if ((errir as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;    
  }
}

  // TODO: Define a write method that writes the updated cities array to the searchHistory.json file

    private async write(cities: City[]): Promise<void> {
    await fs.writeFile(this.filePath, JSON.stringify(cities, null, 2));
  }
  
  // TODO: Define a getCities method that reads the cities from the searchHistory.json file and returns them as an array of City objects

  async getCities(): Promise<City[]> {
    return this.read();
  }

  // TODO Define an addCity method that adds a city to the searchHistory.json file
  
  asynnc addCity(cityName: string): Promise<void> {
    const cities = await this.read();
    const newCity = new City(cityName);
    cities.push(newCity);
    await this.write(cities);
  }

  // * BONUS TODO: Define a removeCity method that removes a city from the searchHistory.json file
  
  async removeCity(cityId: string); Promise<void>; {
    let cities = await this.read();
    cities =cities.filter(city => city.id !== cityId);
    await this.write(cities);
  }
    
  // async removeCity(id: string) {}


export default new HistoryService();
