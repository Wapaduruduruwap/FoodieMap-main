import { Injectable } from '@angular/core';
import { Review } from '../models/review.model';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private reviews: Review[] = [
    {
      id: 1,
      restaurantId: 1,
      author: 'Иван Иванов',
      rating: 5,
      text: 'Отличное место! Обслуживание на высшем уровне, еда просто восхитительная. Обязательно вернусь снова.',
      date: '2023-05-15'
    },
    {
      id: 2,
      restaurantId: 1,
      author: 'Мария Петрова',
      rating: 4,
      text: 'Хороший ресторан, но цены немного завышены. Персонал вежливый, интерьер приятный.',
      date: '2023-05-10'
    },
    {
      id: 3,
      restaurantId: 2,
      author: 'Алексей Смирнов',
      rating: 3,
      text: 'Неплохо, но ожидал большего. Еда хорошая, но порции маленькие.',
      date: '2023-05-05'
    }
  ];

  getReviewsByRestaurant(restaurantId: number) {
    return of(this.reviews.filter(r => r.restaurantId === restaurantId));
  }

  addReview(review: Omit<Review, 'id'>) {
    const newReview: Review = {
      ...review,
      id: this.reviews.length + 1,
      date: new Date().toISOString()
    };
    this.reviews.unshift(newReview);
    return of(newReview);
  }
}