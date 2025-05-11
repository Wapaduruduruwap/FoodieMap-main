import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RestaurantService } from '../services/restaurant.service';
import { Restaurant } from '../models/restaurant.model';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../services/review.service';
import { Review } from '../models/review.model';

declare const ymaps: any;

@Component({
  selector: 'app-restaurant-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './restaurant-details.component.html',
  styleUrls: ['./restaurant-details.component.css']
})
export class RestaurantDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  restaurant: Restaurant | null = null;
  reviews: Review[] = [];
  newReview = {
    rating: 5,
    text: '',
    author: 'Аноним'
  };
  isLoading = true;
  error = '';
  activeTab: 'info' | 'reviews' | 'map' = 'info';
  private map: any = null;

  constructor(
    private route: ActivatedRoute,
    private restaurantService: RestaurantService,
    private reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadRestaurant(+id);
      this.loadReviews(+id);
    } else {
      this.error = 'Не указан ID ресторана';
      this.isLoading = false;
    }
  }

  loadRestaurant(id: number): void {
    this.restaurantService.getRestaurantById(id).subscribe({
      next: (restaurant) => {
        this.restaurant = restaurant;
        this.isLoading = false;
        if (this.activeTab === 'map') {
          this.safeInitMap();
        }
      },
      error: (err) => {
        this.error = 'Ошибка загрузки информации о ресторане';
        this.isLoading = false;
        console.error(err);
      }
    });
  }
  getRatingDescription(rating: number): string {
  const descriptions: {[key: number]: string} = {
    5: 'Отлично',
    4: 'Хорошо',
    3: 'Удовлетворительно',
    2: 'Плохо',
    1: 'Ужасно'
  };
  return descriptions[rating] || '';
}

  loadReviews(restaurantId: number): void {
    this.reviewService.getReviewsByRestaurant(restaurantId).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
      },
      error: (err) => {
        console.error('Ошибка загрузки отзывов:', err);
      }
    });
  }

  submitReview(): void {
    if (!this.restaurant) {
      console.error('Restaurant is not loaded');
      return;
    }

    this.reviewService.addReview({
      restaurantId: this.restaurant.id,
      rating: this.newReview.rating,
      text: this.newReview.text,
      author: this.newReview.author,
      date: new Date().toISOString()
    }).subscribe({
      next: (review) => {
        this.reviews.unshift(review);
        this.newReview.text = '';
        this.newReview.rating = 5;
        this.safeUpdateRestaurantRating();
      },
      error: (err) => {
        console.error('Ошибка при добавлении отзыва:', err);
      }
    });
  }

  private safeUpdateRestaurantRating(): void {
    if (!this.restaurant || this.reviews.length === 0) return;

    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / this.reviews.length;
    this.restaurant.rating = parseFloat(averageRating.toFixed(1));
  }

  ngAfterViewInit(): void {
    if (this.activeTab === 'map') {
      this.safeInitMap();
    }
  }

  
    getFormattedName(name: string): string {
        return name.toLowerCase().replace(/\s+/g, '');
    }

  private safeInitMap(): void {
    if (!this.restaurant) return;

    if (typeof ymaps === 'undefined') {
      console.error('Yandex Maps API is not loaded');
      return;
    }

    ymaps.ready().then(() => {
      if (this.map) {
        this.map.destroy();
      }

      this.map = new ymaps.Map('restaurant-map', {
        center: this.restaurant!.coordinates, // Используем ! так как уже проверили restaurant
        zoom: 15
      });

      const placemark = new ymaps.Placemark(
        this.restaurant!.coordinates,
        {
          hintContent: this.restaurant!.name,
          balloonContent: this.restaurant!.address
        },
        {
          preset: 'islands#redFoodIcon'
        }
      );

      this.map.geoObjects.add(placemark);
      placemark.balloon.open();
    }).catch((error: any) => {
      console.error('Ошибка при инициализации карты:', error);
    });
  }

  setActiveTab(tab: 'info' | 'reviews' | 'map'): void {
    this.activeTab = tab;
    if (tab === 'map') {
      this.safeInitMap();
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.destroy();
    }
  }
}