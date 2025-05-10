import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RestaurantService } from '../services/restaurant.service';
import { Restaurant } from '../models/restaurant.model';
import { Router } from '@angular/router';

declare const ymaps: any;

@Component({
  selector: 'app-add-restaurant',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-restaurant.component.html',
  styleUrls: ['./add-restaurant.component.css']
})
export class AddRestaurantComponent implements OnInit {
  restaurantForm!: FormGroup;
  establishmentTypes: string[] = [];
  cuisineTypes: string[] = [];
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  isSubmitting = false;
  submitError = '';
  submitSuccess = false;

  constructor(
    private fb: FormBuilder,
    private restaurantService: RestaurantService,
    private router: Router
  ) {}

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

  // Method to handle file selection for photo uploads
  onFileSelected(event: any): void {
    this.selectedFiles = Array.from(event.target.files);
    this.previewUrls = [];

    this.selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrls.push(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

  // Method to handle form submission
  onSubmit(): void {
    if (this.restaurantForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';
    this.submitSuccess = false;

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
      imageUrl: this.previewUrls.length > 0 ? this.previewUrls[0] : undefined
    };

    // Here we would normally send the data to a server
    // For now, we'll just simulate a successful submission
    setTimeout(() => {
      this.isSubmitting = false;
      this.submitSuccess = true;
      this.restaurantForm.reset({
        rating: 4.0,
        priceRange: '$$',
        openingHours: '10:00-22:00'
      });
      this.selectedFiles = [];
      this.previewUrls = [];

      // In a real application, we would navigate to a different page or show a success message
      // this.router.navigate(['/']);
    }, 1000);
  }

  // Helper method to check if a form control has a specific error
  hasError(controlName: string, errorName: string): boolean {
    const control = this.restaurantForm.get(controlName);
    return control !== null && control.hasError(errorName) && control.touched;
  }
}
