export interface Restaurant {
  id: number;
  name: string;
  address: string;
  coordinates: [number, number]; // [latitude, longitude]
  rating: number;
  establishmentType: string; // Кафе, Ресторан, Фастфуд, Бар, Кофейня, Общепит
  cuisineType: string[];
  priceRange: string; // $ - $$$$$
  openingHours: string;
  description: string;
  imageUrl?: string;
  distance?: number; // Will be calculated based on user location
}

export interface FilterOptions {
  minRating?: number;
  maxRating?: number;
  establishmentType?: string;
  cuisineTypes?: string[];
  maxDistance?: number;
  searchTerm?: string;
}
