import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewComponent } from './review-page/component/reviews.component';
import { ReviewPageRoutingModule } from './review-page-routing.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [ReviewComponent],
  imports: [
    CommonModule,
    ReviewPageRoutingModule, 
    ReactiveFormsModule
  ],
  exports: [ReviewComponent]
})
export class ReviewPageModule { }

