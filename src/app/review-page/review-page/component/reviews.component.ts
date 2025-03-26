import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css']
})
export class ReviewComponent { 
  
  reviewForm: FormGroup;
  apiUrl = 'https://your-api-url.com/reviews'; 

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.reviewForm = this.fb.group({
      restaurantName: ['', [Validators.required]],
      rating: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
      text: ['', [Validators.required, Validators.minLength(10)]],
      images: [[]]  
    });
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
        // Мокирование отправки
        console.log('Форма отправлена!', this.reviewForm.value);
        
        // Для имитации задержки, как при реальной отправке
        setTimeout(() => {
          alert('Отзыв успешно отправлен (это временная имитация отправки).');
        }, 1000);
      } else {
        console.log('Форма невалидна');
      }
    }
  }
}
