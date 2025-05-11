import { Component, AfterViewInit, OnInit } from '@angular/core';
import { RestaurantService } from '../services/restaurant.service';
import { Restaurant, FilterOptions } from '../models/restaurant.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VisitService } from '../services/visit.service';

declare const ymaps: any;


@Component({
  selector: 'app-yandex-map',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './yandex-map.component.html',
  styleUrls: ['./yandex-map.component.css']
})
export class YandexMapComponent implements OnInit, AfterViewInit {
  private map: any;
  private restaurantPlacemarks: any[] = [];

  restaurants: Restaurant[] = [];
  filteredRestaurants: Restaurant[] = [];
  topRestaurants: Restaurant[] = [];
  cuisineTypes: string[] = [];
  establishmentTypes: string[] = [];
  userLocation: [number, number] | null = null;
  isLoading: boolean = false;

  // Filter options
  searchTerm: string = '';
  minRating: number | undefined;
  selectedCuisine: string | undefined;
  selectedEstablishmentType: string | undefined;
  maxDistance: number | undefined;


  constructor(
  private restaurantService: RestaurantService,
  private visitService: VisitService
  ) {}

  ngOnInit(): void {
    this.loadCuisineTypes();
    this.loadEstablishmentTypes();
  }

  isFavorite(restaurantId: number): boolean {
    return this.restaurantService.isFavorite(restaurantId);
  }

  toggleFavorite(restaurant: Restaurant): void {
    if (this.isFavorite(restaurant.id)) {
      this.restaurantService.removeFromFavorites(restaurant.id);
    } else {
      this.restaurantService.addToFavorites(restaurant);
    }
  }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit called, waiting for ymaps to be ready...');

    if (typeof ymaps === 'undefined') {
      console.error('ymaps is undefined in ngAfterViewInit');
      return;
    }

    

    ymaps.ready().then(() => {
      console.log('ymaps is ready, initializing map...');
      this.initMap();
    }).catch((error: unknown) => {
      console.error('Error initializing ymaps:', error);
    });
  }

  private initMap(): void {
    console.log('Initializing map...');

    try {
      const mapElement = document.getElementById('yandex-map');
      if (!mapElement) {
        console.error('Map element not found with id "yandex-map"');
        return;
      }

      console.log('Creating map instance...');
      this.map = new ymaps.Map('yandex-map', {
        center: [56.8300, 60.6100],
        zoom: 13,
        controls: ['zoomControl', 'geolocationControl']
      });

      console.log('Map created successfully');

      // Add user location detection
      console.log('Adding geolocation control event listener...');
      this.map.controls.get('geolocationControl').events.add('locationchange', (e: any) => {
        const userLocation = e.get('position');
        console.log('User location changed:', userLocation);
        this.userLocation = [userLocation[0], userLocation[1]];
        this.restaurantService.calculateDistances(this.userLocation);
        this.applyFilters();
      });

      // Add event listener for map bounds change
      console.log('Adding bounds change event listener...');
      this.map.events.add('boundschange', this.onMapBoundsChange.bind(this));

      // Load restaurants after map is initialized
      console.log('Map initialization complete, loading restaurants...');
      this.loadRestaurants();
      this.loadTopRestaurants();
    } catch (error: unknown) {
      console.error('Error initializing map:', error);
    }
  }

  private lastSearchCenter: [number, number] = [56.8300, 60.6100];
  private isSearching: boolean = false;

  private onMapBoundsChange(e: any): void {
    // Only reload restaurants if the map was moved significantly (more than 2km)
    // and if we're not already searching
    if (this.isSearching) return;

    const newCenter = this.map.getCenter();
    const distance = this.calculateDistance(
      this.lastSearchCenter[0], this.lastSearchCenter[1],
      newCenter[0], newCenter[1]
    );

    // If moved more than 2km, reload restaurants
    if (distance > 2) {
      this.isSearching = true;
      this.isLoading = true;
      this.lastSearchCenter = [newCenter[0], newCenter[1]];

      this.restaurantService.searchRestaurants([newCenter[0], newCenter[1]]).subscribe(restaurants => {
        this.restaurants = restaurants;
        this.filteredRestaurants = restaurants;
        this.displayRestaurantsOnMap(this.restaurants);
        this.loadTopRestaurants(); // Reload top restaurants as well
        this.isSearching = false;
        this.isLoading = false;
      });
    }
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  private loadRestaurants(): void {
    console.log('Loading restaurants...');
    this.isLoading = true;

    // If map is already initialized, use its center for search
    if (this.map) {
      console.log('Map is initialized, using map center for search');
      const center = this.map.getCenter();
      console.log('Map center:', center);

      this.restaurantService.searchRestaurants([center[0], center[1]]).subscribe(
        restaurants => {
          console.log('Restaurants loaded successfully:', restaurants.length);
          this.restaurants = restaurants;
          this.filteredRestaurants = restaurants;
          this.displayRestaurantsOnMap(this.restaurants);
          this.isLoading = false;
        },
        (error: unknown) => {
          console.error('Error loading restaurants:', error);
          this.isLoading = false;
        }
      );
    } else {
      console.log('Map is not initialized, using default center');
      // Otherwise use default center
      this.restaurantService.getAllRestaurants().subscribe(
        restaurants => {
          console.log('Restaurants loaded successfully:', restaurants.length);
          this.restaurants = restaurants;
          this.filteredRestaurants = restaurants;

          // If map is initialized by now, display restaurants
          if (this.map) {
            this.displayRestaurantsOnMap(this.restaurants);
          } else {
            console.warn('Map is still not initialized after loading restaurants');
          }
          this.isLoading = false;
        },
        (error: unknown) => {
          console.error('Error loading restaurants:', error);
          this.isLoading = false;
        }
      );
    }
  }

  private loadTopRestaurants(): void {
    console.log('Loading top restaurants...');
    this.restaurantService.getTopRatedRestaurants(10).subscribe(
      restaurants => {
        console.log('Top restaurants loaded successfully:', restaurants.length);
        this.topRestaurants = restaurants;
      },
      (error: unknown) => {
        console.error('Error loading top restaurants:', error);
      }
    );
  }

  private loadCuisineTypes(): void {
    console.log('Loading cuisine types...');
    this.cuisineTypes = this.restaurantService.getAllCuisineTypes();
    console.log('Cuisine types loaded:', this.cuisineTypes.length);
  }

  private loadEstablishmentTypes(): void {
    console.log('Loading establishment types...');
    this.establishmentTypes = this.restaurantService.getAllEstablishmentTypes();
    console.log('Establishment types loaded:', this.establishmentTypes.length);
  }

  private displayRestaurantsOnMap(restaurants: Restaurant[]): void {
    console.log('Displaying restaurants on map:', restaurants.length);

    if (restaurants.length === 0) {
      console.warn('No restaurants to display on the map');
      return;
    }

    // Clear existing placemarks
    this.clearPlacemarks();

    // Create clusterer for grouping placemarks
    const clusterer = new ymaps.Clusterer({
      preset: 'islands#invertedRedClusterIcons',
      groupByCoordinates: false,
      clusterDisableClickZoom: false,
      clusterHideIconOnBalloonOpen: false,
      geoObjectHideIconOnBalloonOpen: false
    });

    console.log('First 3 restaurants to display:', restaurants.slice(0, 3));

    // Create placemarks for each restaurant
    this.restaurantPlacemarks = restaurants.map(restaurant => {
    const placemark = new ymaps.Placemark(
      restaurant.coordinates,
      {
        balloonContentHeader: restaurant.name,
        balloonContentBody: `
          <div><strong>Рейтинг:</strong> ${restaurant.rating} ⭐</div>
          <div><strong>Тип заведения:</strong> ${restaurant.establishmentType}</div>
          <div><strong>Кухня:</strong> ${restaurant.cuisineType.join(', ')}</div>
          <div><strong>Ценовая категория:</strong> ${restaurant.priceRange}</div>
          <div><strong>Время работы:</strong> ${restaurant.openingHours}</div>
          <div><strong>Адрес:</strong> ${restaurant.address}</div>
          <div>${restaurant.description}</div>
          <button class="visit-button" data-restaurant="${restaurant.name}">Отметить посещение</button>
        `,
        balloonContentFooter: restaurant.distance ? `Расстояние: ${restaurant.distance} км` : '',
        hintContent: `${restaurant.name} (${restaurant.rating} ⭐)`
      },
      {
        preset: 'islands#redFoodIcon'
      }
    );

    // Обработчик клика на метку
    placemark.events.add('click', () => {
      this.visitService.addVisit(restaurant.name);
    });

      return placemark;
    }); 

    // Add placemarks to clusterer and clusterer to map
    clusterer.add(this.restaurantPlacemarks);
    this.map.geoObjects.add(clusterer);

    console.log('Added', this.restaurantPlacemarks.length, 'placemarks to the map');
  }

  private clearPlacemarks(): void {
    console.log('Clearing all placemarks from the map');
    this.map.geoObjects.removeAll();
  }

  applyFilters(): void {
    const filterOptions: FilterOptions = {
      minRating: this.minRating,
      establishmentType: this.selectedEstablishmentType,
      cuisineTypes: this.selectedCuisine ? [this.selectedCuisine] : undefined,
      maxDistance: this.maxDistance,
      searchTerm: this.searchTerm
    };

    this.restaurantService.filterRestaurants(filterOptions).subscribe(filteredRestaurants => {
      this.filteredRestaurants = filteredRestaurants;
      this.displayRestaurantsOnMap(filteredRestaurants);
    });
  }

  centerOnRestaurant(restaurant: Restaurant): void {
    this.map.setCenter(restaurant.coordinates, 16);

    // Find and open the balloon for this restaurant
    this.restaurantPlacemarks.forEach(placemark => {
      const coordinates = placemark.geometry.getCoordinates();
      if (coordinates[0] === restaurant.coordinates[0] && coordinates[1] === restaurant.coordinates[1]) {
        placemark.balloon.open();
      }
    });
  }
}
