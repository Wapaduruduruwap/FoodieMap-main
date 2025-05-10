import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReviewPageRoutingModule } from './review-page/review-page-routing.module';
import { YandexMapComponent } from './yandex-map/yandex-map.component';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RestaurantService } from './services/restaurant.service';
import { Restaurant } from './models/restaurant.model';

declare const ymaps: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, YandexMapComponent, ReactiveFormsModule, ReviewPageRoutingModule, CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'FoodieMap';

  // Review form
  reviewForm: FormGroup;
  apiUrl = 'https://your-api-url.com/reviews';

  // Flag for displaying the review window
  showReviewWindow: boolean = false;

  // Restaurant form
  restaurantForm!: FormGroup;
  establishmentTypes: string[] = [];
  cuisineTypes: string[] = [];
  restaurantSelectedFiles: File[] = [];
  restaurantPreviewUrls: string[] = [];
  isRestaurantSubmitting = false;
  submitRestaurantError = '';
  submitRestaurantSuccess = false;

  // Flag for displaying the add restaurant window
  showAddRestaurantWindow: boolean = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private restaurantService: RestaurantService
  ) {
    this.reviewForm = this.fb.group({
      restaurantName: ['', [Validators.required]],
      rating: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
      text: ['', [Validators.required, Validators.minLength(10)]],
      images: [[]]
    });
  }

  ngOnInit(): void {
    this.establishmentTypes = this.restaurantService.getAllEstablishmentTypes();
    this.cuisineTypes = this.restaurantService.getAllCuisineTypes();

    this.restaurantForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      coordinates: [null, Validators.required],
      rating: [4.0, [Validators.required, Validators.min(1), Validators.max(5)]],
      establishmentType: ['', Validators.required],
      cuisineType: [[], Validators.required],
      priceRange: ['$$', Validators.required],
      openingHours: ['10:00-22:00', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  // Method for showing/hiding the review window
  toggleReviewWindow() {
    this.showReviewWindow = !this.showReviewWindow;
  }

  // Method for showing/hiding the add restaurant window
  toggleAddRestaurantWindow() {
    this.showAddRestaurantWindow = !this.showAddRestaurantWindow;
    if (!this.showAddRestaurantWindow) {
      // Reset form when closing the window
      this.resetRestaurantForm();
    }
  }

  // Method to handle address input and fetch coordinates from Yandex API
  searchAddress(): void {
    const address = this.restaurantForm.get('address')?.value;
    if (!address) {
      return;
    }

    if (typeof ymaps === 'undefined') {
      console.error('Yandex Maps API is not loaded');
      return;
    }

    ymaps.geocode(address).then((res: any) => {
      const firstGeoObject = res.geoObjects.get(0);
      if (firstGeoObject) {
        const coords = firstGeoObject.geometry.getCoordinates();
        this.restaurantForm.patchValue({
          coordinates: coords
        });
      } else {
        console.warn('No coordinates found for the address');
      }
    }).catch((error: any) => {
      console.error('Error geocoding address:', error);
    });
  }

  // Method to handle file selection for restaurant photo uploads
  onRestaurantFileSelected(event: any): void {
    this.restaurantSelectedFiles = Array.from(event.target.files);
    this.restaurantPreviewUrls = [];

    this.restaurantSelectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.restaurantPreviewUrls.push(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

  // Method to handle restaurant form submission
  submitRestaurant(): void {
    if (this.restaurantForm.invalid) {
      return;
    }

    this.isRestaurantSubmitting = true;
    this.submitRestaurantError = '';
    this.submitRestaurantSuccess = false;

    // Create a new restaurant object from form values
    const formValues = this.restaurantForm.value;
    const newRestaurant: Restaurant = {
      id: Date.now(), // Temporary ID, would be replaced by server
      name: formValues.name,
      address: formValues.address,
      coordinates: formValues.coordinates,
      rating: formValues.rating,
      establishmentType: formValues.establishmentType,
      cuisineType: formValues.cuisineType,
      priceRange: formValues.priceRange,
      openingHours: formValues.openingHours,
      description: formValues.description,
      imageUrl: this.restaurantPreviewUrls.length > 0 ? this.restaurantPreviewUrls[0] : undefined
    };

    // Here we would normally send the data to a server
    // For now, we'll just simulate a successful submission
    setTimeout(() => {
      this.isRestaurantSubmitting = false;
      this.submitRestaurantSuccess = true;

      // In a real application, we would add the restaurant to the service
      // this.restaurantService.addRestaurant(newRestaurant);

      // Reset form after successful submission
      setTimeout(() => {
        this.resetRestaurantForm();
        this.toggleAddRestaurantWindow(); // Close the modal after submission
      }, 2000);
    }, 1000);
  }

  // Helper method to check if a restaurant form control has a specific error
  hasRestaurantError(controlName: string, errorName: string): boolean {
    const control = this.restaurantForm.get(controlName);
    return control !== null && control.hasError(errorName) && control.touched;
  }

  // Helper method to reset the restaurant form
  resetRestaurantForm(): void {
    this.restaurantForm.reset({
      rating: 4.0,
      priceRange: '$$',
      openingHours: '10:00-22:00'
    });
    this.restaurantSelectedFiles = [];
    this.restaurantPreviewUrls = [];
    this.submitRestaurantSuccess = false;
    this.submitRestaurantError = '';
    this.isRestaurantSubmitting = false;
  }

  onFileChange(event: any) {
    const files: FileList = event.target.files;
    const currentFiles = this.reviewForm.value.images;

    const newFiles = Array.from(files);
    this.reviewForm.patchValue({
      images: [...currentFiles, ...newFiles]
    });
  }

  submitReview() {
    if (this.reviewForm.valid) {
      const formData = new FormData();
      formData.append('rating', this.reviewForm.value.rating);
      formData.append('text', this.reviewForm.value.text);

      if (this.reviewForm.value.images && this.reviewForm.value.images.length > 0) {
        this.reviewForm.value.images.forEach((file: File) => {
          formData.append('images', file, file.name);
        });
      }

      if (this.reviewForm.valid) {
        // Mock submission
        console.log('Form submitted!', this.reviewForm.value);

        // To simulate delay, as in a real submission
        setTimeout(() => {
          alert('Review successfully submitted (this is a temporary submission simulation).');
          this.toggleReviewWindow(); // Close the modal after submission
        }, 1000);
      } else {
        console.log('Form is invalid');
      }
    }
  }
}
