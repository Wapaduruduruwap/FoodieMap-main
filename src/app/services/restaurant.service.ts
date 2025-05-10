import { Injectable } from '@angular/core';
import { Observable, of, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Restaurant, FilterOptions } from '../models/restaurant.model';

declare const ymaps: any;

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  private restaurants: Restaurant[] = [];
  private establishmentTypes: string[] = [
    'Кафе', 'Ресторан', 'Фастфуд', 'Бар', 'Кофейня', 'Общепит'
  ];

  private cuisineTypes: string[] = [
    'Европейская', 'Русская', 'Итальянская', 'Азиатская',
    'Японская', 'Китайская', 'Грузинская', 'Кавказская',
    'Американская', 'Мексиканская', 'Индийская', 'Тайская', 'Вегетарианская'
  ];

  // Примерные данные ресторанов для использования в случае сбоя API
  private sampleRestaurants: Restaurant[] = [
    {
      id: 1,
      name: 'Ресторан "Уральские пельмени"',
      address: 'ул. Ленина, 25, Екатеринбург',
      coordinates: [56.8372, 60.5994],
      rating: 4.7,
      establishmentType: 'Ресторан',
      cuisineType: ['Русская', 'Европейская'],
      priceRange: '$$$',
      openingHours: '10:00-22:00',
      description: 'Ресторан "Уральские пельмени" - Русская, Европейская',
      imageUrl: 'https://avatars.mds.yandex.net/get-altay/4526625/2a0000017c0e1f5f5e5a1c1e9d9c9e9f9c9c/XXL'
    },
    {
      id: 2,
      name: 'Кафе "Вкусно и точка"',
      address: 'ул. 8 Марта, 46, Екатеринбург',
      coordinates: [56.8290, 60.6050],
      rating: 4.2,
      establishmentType: 'Кафе',
      cuisineType: ['Фастфуд'],
      priceRange: '$',
      openingHours: '08:00-23:00',
      description: 'Кафе "Вкусно и точка" - Фастфуд',
      imageUrl: 'https://avatars.mds.yandex.net/get-altay/4526625/2a0000017c0e1f5f5e5a1c1e9d9c9e9f9c9c/XXL'
    },
    {
      id: 3,
      name: 'Суши-бар "Сакура"',
      address: 'пр. Ленина, 51, Екатеринбург',
      coordinates: [56.8370, 60.6120],
      rating: 4.5,
      establishmentType: 'Бар',
      cuisineType: ['Японская', 'Азиатская'],
      priceRange: '$$',
      openingHours: '11:00-23:00',
      description: 'Суши-бар "Сакура" - Японская, Азиатская',
      imageUrl: 'https://avatars.mds.yandex.net/get-altay/4526625/2a0000017c0e1f5f5e5a1c1e9d9c9e9f9c9c/XXL'
    },
    {
      id: 4,
      name: 'Ресторан "Грузинский дворик"',
      address: 'ул. Малышева, 56, Екатеринбург',
      coordinates: [56.8320, 60.6180],
      rating: 4.8,
      establishmentType: 'Ресторан',
      cuisineType: ['Грузинская', 'Кавказская'],
      priceRange: '$$$',
      openingHours: '12:00-00:00',
      description: 'Ресторан "Грузинский дворик" - Грузинская, Кавказская',
      imageUrl: 'https://avatars.mds.yandex.net/get-altay/4526625/2a0000017c0e1f5f5e5a1c1e9d9c9e9f9c9c/XXL'
    },
    {
      id: 5,
      name: 'Кофейня "Французский пекарь"',
      address: 'ул. Вайнера, 9, Екатеринбург',
      coordinates: [56.8280, 60.6000],
      rating: 4.6,
      establishmentType: 'Кофейня',
      cuisineType: ['Европейская'],
      priceRange: '$$',
      openingHours: '08:00-21:00',
      description: 'Кофейня "Французский пекарь" - Европейская',
      imageUrl: 'https://avatars.mds.yandex.net/get-altay/4526625/2a0000017c0e1f5f5e5a1c1e9d9c9e9f9c9c/XXL'
    },
    {
      id: 6,
      name: 'Бар "Хмельной дворик"',
      address: 'ул. Бориса Ельцина, 3, Екатеринбург',
      coordinates: [56.8440, 60.6070],
      rating: 4.3,
      establishmentType: 'Бар',
      cuisineType: ['Европейская'],
      priceRange: '$$',
      openingHours: '16:00-02:00',
      description: 'Бар "Хмельной дворик" - Европейская',
      imageUrl: 'https://avatars.mds.yandex.net/get-altay/4526625/2a0000017c0e1f5f5e5a1c1e9d9c9e9f9c9c/XXL'
    },
    {
      id: 7,
      name: 'Ресторан "Пекин"',
      address: 'ул. Декабристов, 20, Екатеринбург',
      coordinates: [56.8200, 60.6150],
      rating: 4.4,
      establishmentType: 'Ресторан',
      cuisineType: ['Китайская', 'Азиатская'],
      priceRange: '$$',
      openingHours: '11:00-23:00',
      description: 'Ресторан "Пекин" - Китайская, Азиатская',
      imageUrl: 'https://avatars.mds.yandex.net/get-altay/4526625/2a0000017c0e1f5f5e5a1c1e9d9c9e9f9c9c/XXL'
    },
    {
      id: 8,
      name: 'Пиццерия "Мама Мия"',
      address: 'ул. Куйбышева, 32, Екатеринбург',
      coordinates: [56.8310, 60.6220],
      rating: 4.1,
      establishmentType: 'Кафе',
      cuisineType: ['Итальянская', 'Европейская'],
      priceRange: '$$',
      openingHours: '10:00-22:00',
      description: 'Пиццерия "Мама Мия" - Итальянская, Европейская',
      imageUrl: 'https://avatars.mds.yandex.net/get-altay/4526625/2a0000017c0e1f5f5e5a1c1e9d9c9e9f9c9c/XXL'
    },
    {
      id: 9,
      name: 'Фастфуд "Бургер Кинг"',
      address: 'ул. Вайнера, 15, Екатеринбург',
      coordinates: [56.8275, 60.6010],
      rating: 4.0,
      establishmentType: 'Фастфуд',
      cuisineType: ['Американская'],
      priceRange: '$',
      openingHours: '08:00-23:00',
      description: 'Фастфуд "Бургер Кинг" - Американская',
      imageUrl: 'https://avatars.mds.yandex.net/get-altay/4526625/2a0000017c0e1f5f5e5a1c1e9d9c9e9f9c9c/XXL'
    },
    {
      id: 10,
      name: 'Общепит "Столовая №1"',
      address: 'ул. Ленина, 40, Екатеринбург',
      coordinates: [56.8380, 60.6000],
      rating: 3.9,
      establishmentType: 'Общепит',
      cuisineType: ['Русская'],
      priceRange: '$',
      openingHours: '09:00-20:00',
      description: 'Общепит "Столовая №1" - Русская',
      imageUrl: 'https://avatars.mds.yandex.net/get-altay/4526625/2a0000017c0e1f5f5e5a1c1e9d9c9e9f9c9c/XXL'
    },
    {
      id: 11,
      name: 'Кафе "Тайский рай"',
      address: 'ул. Малышева, 30, Екатеринбург',
      coordinates: [56.8310, 60.6150],
      rating: 4.6,
      establishmentType: 'Кафе',
      cuisineType: ['Тайская', 'Азиатская'],
      priceRange: '$$',
      openingHours: '11:00-22:00',
      description: 'Кафе "Тайский рай" - Тайская, Азиатская',
      imageUrl: 'https://avatars.mds.yandex.net/get-altay/4526625/2a0000017c0e1f5f5e5a1c1e9d9c9e9f9c9c/XXL'
    },
    {
      id: 12,
      name: 'Ресторан "Индийские специи"',
      address: 'ул. 8 Марта, 60, Екатеринбург',
      coordinates: [56.8260, 60.6070],
      rating: 4.5,
      establishmentType: 'Ресторан',
      cuisineType: ['Индийская'],
      priceRange: '$$$',
      openingHours: '12:00-23:00',
      description: 'Ресторан "Индийские специи" - Индийская',
      imageUrl: 'https://avatars.mds.yandex.net/get-altay/4526625/2a0000017c0e1f5f5e5a1c1e9d9c9e9f9c9c/XXL'
    },
    {
      id: 13,
      name: 'Кофейня "Кофе и Книги"',
      address: 'пр. Ленина, 35, Екатеринбург',
      coordinates: [56.8360, 60.6050],
      rating: 4.7,
      establishmentType: 'Кофейня',
      cuisineType: ['Европейская'],
      priceRange: '$$',
      openingHours: '08:00-22:00',
      description: 'Кофейня "Кофе и Книги" - Европейская',
      imageUrl: 'https://avatars.mds.yandex.net/get-altay/4526625/2a0000017c0e1f5f5e5a1c1e9d9c9e9f9c9c/XXL'
    },
    {
      id: 14,
      name: 'Бар "Пивной дом"',
      address: 'ул. Куйбышева, 50, Екатеринбург',
      coordinates: [56.8300, 60.6250],
      rating: 4.2,
      establishmentType: 'Бар',
      cuisineType: ['Европейская', 'Русская'],
      priceRange: '$$',
      openingHours: '14:00-02:00',
      description: 'Бар "Пивной дом" - Европейская, Русская',
      imageUrl: 'https://avatars.mds.yandex.net/get-altay/4526625/2a0000017c0e1f5f5e5a1c1e9d9c9e9f9c9c/XXL'
    },
    {
      id: 15,
      name: 'Общепит "Вкусно и полезно"',
      address: 'ул. Малышева, 70, Екатеринбург',
      coordinates: [56.8330, 60.6200],
      rating: 4.0,
      establishmentType: 'Общепит',
      cuisineType: ['Вегетарианская', 'Европейская'],
      priceRange: '$$',
      openingHours: '09:00-21:00',
      description: 'Общепит "Вкусно и полезно" - Вегетарианская, Европейская',
      imageUrl: 'https://avatars.mds.yandex.net/get-altay/4526625/2a0000017c0e1f5f5e5a1c1e9d9c9e9f9c9c/XXL'
    }
  ];

  constructor() { }

  // Поиск ресторанов с использованием API Яндекс Карт
  searchRestaurants(center: [number, number] = [56.8300, 60.6100], radius: number = 5000): Observable<Restaurant[]> {
    // Возвращает observable, который разрешится, когда поиск будет завершен
    return from(new Promise<Restaurant[]>((resolve) => {
      // Убедимся, что ymaps загружен
      if (typeof ymaps === 'undefined') {
        console.warn('Yandex Maps API is not loaded, using sample data instead');
        this.useSampleData();
        resolve(this.restaurants);
        return;
      }

      // Попробуем использовать ymaps.search для поиска заведений общепита
      try {
        ymaps.search('еда OR ресторан OR кафе OR общепит', {
          boundedBy: this.getBoundingBox(center, radius),
          results: 50
        }).then((response: any) => {
          const geoObjects = response.geoObjects;
          const restaurants: Restaurant[] = [];
          let id = 1;

          // Проверим, получили ли мы какие-либо результаты
          if (geoObjects.getLength() === 0) {
            console.warn('No restaurants found via API, using sample data instead');
            this.useSampleData();
            resolve(this.restaurants);
            return;
          }

          // Обработаем каждый найденный объект
          geoObjects.each((geoObject: any) => {
            try {
              const coords = geoObject.geometry.getCoordinates();
              const properties = geoObject.properties.getAll();

              // Извлечем данные из геообъекта
              const name = properties.name || 'Неизвестное заведение';
              const address = properties.description || properties.text || '';
              const categories = properties.categories || [];

              // Определим тип заведения и типы кухни на основе категорий или используем случайные значения по умолчанию
              let establishmentType = '';
              let cuisineType: string[] = [];

              // Попробуем найти тип заведения в категориях
              const establishmentCategories = categories.filter((category: string) =>
                this.establishmentTypes.includes(category));

              if (establishmentCategories.length > 0) {
                // Используем первый совпадающий тип заведения
                establishmentType = establishmentCategories[0];
              } else {
                // Если нет совпадающего типа заведения, назначаем случайный
                establishmentType = this.establishmentTypes[Math.floor(Math.random() * this.establishmentTypes.length)];
              }

              // Найдем типы кухни в категориях
              if (categories.length > 0) {
                cuisineType = categories
                  .filter((category: string) => this.cuisineTypes.includes(category))
                  .slice(0, 3);
              }

              if (cuisineType.length === 0) {
                // Если нет совпадающих категорий, назначаем случайные типы кухни
                cuisineType = [this.cuisineTypes[Math.floor(Math.random() * this.cuisineTypes.length)]];

                // Иногда добавляем второй тип кухни
                if (Math.random() > 0.5) {
                  const secondType = this.cuisineTypes[Math.floor(Math.random() * this.cuisineTypes.length)];
                  if (!cuisineType.includes(secondType)) {
                    cuisineType.push(secondType);
                  }
                }
              }

              // Генерируем случайный рейтинг от 3.5 до 5.0
              const rating = parseFloat((3.5 + Math.random() * 1.5).toFixed(1));

              // Определяем ценовой диапазон на основе рейтинга
              let priceRange = '$';
              if (rating > 4.5) priceRange = '$$$$';
              else if (rating > 4.2) priceRange = '$$$';
              else if (rating > 3.8) priceRange = '$$';

              // Генерируем случайное время работы
              const openingHours = Math.random() > 0.5 ? '10:00-22:00' : '08:00-23:00';

              // Создаем объект ресторана
              const restaurant: Restaurant = {
                id: id++,
                name,
                address,
                coordinates: coords,
                rating,
                establishmentType,
                cuisineType,
                priceRange,
                openingHours,
                description: `${name} - ${cuisineType.join(', ')}`,
                imageUrl: 'https://avatars.mds.yandex.net/get-altay/4526625/2a0000017c0e1f5f5e5a1c1e9d9c9e9f9c9c/XXL'
              };

              restaurants.push(restaurant);
            } catch (error: unknown) {
              console.error('Error processing geo object:', error);
            }
          });

          // Если не удалось обработать ни один ресторан, используем примерные данные
          if (restaurants.length === 0) {
            console.warn('Failed to process any restaurants from API, using sample data instead');
            this.useSampleData();
            resolve(this.restaurants);
            return;
          }

          // Сохраняем рестораны и разрешаем промис
          this.restaurants = restaurants;
          resolve(restaurants);
        }).catch((error: any) => {
          console.error('Error searching for restaurants:', error);
          console.warn('API search failed, using sample data instead');
          this.useSampleData();
          resolve(this.restaurants);
        });
      } catch (error: unknown) {
        console.error('Exception during ymaps.search:', error);
        console.warn('API search failed with exception, using sample data instead');
        this.useSampleData();
        resolve(this.restaurants);
      }
    }));
  }

  // Вспомогательный метод для использования примерных данных при сбое API
  private useSampleData(): void {
    console.log('Using sample restaurant data');
    this.restaurants = [...this.sampleRestaurants];
  }

  // Получить все рестораны
  getAllRestaurants(): Observable<Restaurant[]> {
    // Если у нас уже есть рестораны, возвращаем их
    if (this.restaurants.length > 0) {
      return of(this.restaurants);
    }

    // В противном случае, ищем рестораны
    return this.searchRestaurants();
  }

  // Получить рестораны с самым высоким рейтингом
  getTopRatedRestaurants(limit: number = 5): Observable<Restaurant[]> {
    // Если у нас еще нет ресторанов, используем примерные данные
    if (this.restaurants.length === 0) {
      this.useSampleData();
    }

    const sortedRestaurants = [...this.restaurants]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
    return of(sortedRestaurants);
  }

  // Фильтрация ресторанов на основе критериев
  filterRestaurants(options: FilterOptions): Observable<Restaurant[]> {
    let filteredRestaurants = [...this.restaurants];

    // Filter by rating
    if (options.minRating !== undefined) {
      filteredRestaurants = filteredRestaurants.filter(r => r.rating >= options.minRating!);
    }
    if (options.maxRating !== undefined) {
      filteredRestaurants = filteredRestaurants.filter(r => r.rating <= options.maxRating!);
    }

    // Filter by establishment type
    if (options.establishmentType) {
      filteredRestaurants = filteredRestaurants.filter(r =>
        r.establishmentType === options.establishmentType
      );
    }

    // Filter by cuisine type
    if (options.cuisineTypes && options.cuisineTypes.length > 0) {
      filteredRestaurants = filteredRestaurants.filter(r =>
        r.cuisineType.some(cuisine => options.cuisineTypes!.includes(cuisine))
      );
    }

    // Filter by search term (name or description)
    if (options.searchTerm) {
      const searchTerm = options.searchTerm.toLowerCase();
      filteredRestaurants = filteredRestaurants.filter(r =>
        r.name.toLowerCase().includes(searchTerm) ||
        r.description.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by distance (if distance is calculated and maxDistance is provided)
    if (options.maxDistance !== undefined) {
      filteredRestaurants = filteredRestaurants.filter(r =>
        r.distance !== undefined && r.distance <= options.maxDistance!
      );
    }

    return of(filteredRestaurants);
  }

  // Calculate distance from a point to all restaurants
  calculateDistances(userLocation: [number, number]): void {
    this.restaurants.forEach(restaurant => {
      restaurant.distance = this.getDistance(
        userLocation[0], userLocation[1],
        restaurant.coordinates[0], restaurant.coordinates[1]
      );
    });
  }

  // Haversine formula to calculate distance between two points on Earth
  private getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    return parseFloat(distance.toFixed(1));
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  // Get all unique cuisine types
  getAllCuisineTypes(): string[] {
    if (this.restaurants.length === 0) {
      // If no restaurants loaded yet, return predefined cuisine types
      return [...this.cuisineTypes];
    }

    const cuisineSet = new Set<string>();
    this.restaurants.forEach(restaurant => {
      restaurant.cuisineType.forEach(cuisine => cuisineSet.add(cuisine));
    });
    return Array.from(cuisineSet).sort();
  }

  // Get all establishment types
  getAllEstablishmentTypes(): string[] {
    if (this.restaurants.length === 0) {
      // If no restaurants loaded yet, return predefined establishment types
      return [...this.establishmentTypes];
    }

    const establishmentSet = new Set<string>();
    this.restaurants.forEach(restaurant => {
      establishmentSet.add(restaurant.establishmentType);
    });
    return Array.from(establishmentSet).sort();
  }

  // Helper method to calculate a bounding box around a center point with a given radius
  private getBoundingBox(center: [number, number], radiusInMeters: number): [[number, number], [number, number]] {
    // Earth's radius in meters
    const earthRadius = 6378137;

    const radiusInDegrees = radiusInMeters / earthRadius * (180 / Math.PI);

    const [lat, lng] = center;
    const latDelta = radiusInDegrees;
    const lngDelta = radiusInDegrees / Math.cos(lat * Math.PI / 180);

    return [
      [lat - latDelta, lng - lngDelta], // Southwest corner
      [lat + latDelta, lng + lngDelta]  // Northeast corner
    ];
  }
}
