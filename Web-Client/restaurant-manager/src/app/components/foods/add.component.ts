import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from "app/services/category.service";
import { FoodService } from "app/services/food.service";
import { Category } from "app/models/category";
import { Food } from "app/models/food";
import { Http } from "@angular/http";
import { NgForm } from '@angular/forms';
import { ContentUrl } from "app/shared/constants";

@Component({
  selector: 'app-add-food',
  template: `
  <div class="ui raised very padded text container segment"  [ngClass]="{ loading : isLoading }">
    <form class="ui form" #foodForm="ngForm" (ngSubmit)="onSubmit(foodForm, file)">
      <div class="field" [ngClass]="{error : name.invalid && (name.dirty || name.touched) }">
        <label>Name</label>
        <input type="text" required [(ngModel)]="food.name" name="name" #name="ngModel" placeholder="Name">
      </div>
      <div class="field">
        <label>Description</label>
        <input type="text" [(ngModel)]="food.description" name="description" #description="ngModel" placeholder="Description">
      </div>
      <div class="two fields">
        <div class="field" [ngClass]="{error : price.invalid && (price.dirty || price.touched) }">
          <label>Price</label>
          <input type="text" required name="price" [(ngModel)]="food.price" #price="ngModel" placeholder="Price">
        </div>
        <div class="field" [ngClass]="{error : category.invalid && (category.dirty || category.touched) }">
          <label>Category</label>
          <select [(ngModel)]="food.categoryId" placeholder="categories" name="category" class="ui fluid dropdown" required #category="ngModel">
              <option *ngFor="let category of categories" [ngValue]="category.id">{{category.name}}</option>
          </select>
        </div>
      </div>
      <div class="field">
        <label>Picture</label>
        <input type="file" (change)="imageUpload($event)" #file>
      </div>
      <div class="ui basic segment" *ngIf="imageUrl">
        <img [src]="imageUrl" class="ui centered medium rounded image" />        
      </div>
      <button class="ui button blue" [ngClass]="{ loading : isSaving }" [disabled]="foodForm.invalid" type="submit">Save</button>
      <button class="ui button" (click)="onCancel()">Cancel</button>
    </form>
   </div>`
})

export class AddFoodComponent implements OnInit {

  food: Food = {
    id: null,
    name: '',
    description: '',
    price: null,
    category: null,
    categoryId: null,
    picture: null
  };

  imageUrl: any;
  file: File;
  categories: Category[];
  isSaving: boolean;
  isEditMode: boolean;
  isLoading: boolean;

  constructor(
    private categoryService: CategoryService,
    private foodService: FoodService,
    private route: ActivatedRoute,
    private router: Router,
    private http: Http) {

  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      var id = params["id"];
      if (id) {
        this.isLoading = true;
        this.foodService.get(id).subscribe(food => {
          this.food = food;
          this.imageUrl = ContentUrl + this.food.picture;
          this.isEditMode = true;
          this.isLoading = false;
        });
      }
    });

    this.categoryService.getAll().subscribe(cat => {
      this.categories = cat;
    })
  }

  imageUpload(e) {
    let reader = new FileReader();
    this.file = e.target.files[0];
    reader.onloadend = () => {
      this.imageUrl = reader.result;
    }
    reader.readAsDataURL(this.file);
  }

  onSubmit(form: NgForm, file: HTMLInputElement) {
    this.isSaving = true;

    this.food.id = this.NewGuid()
    this.foodService.uploadImage(this.file, this.food.id).then(uploaded => {
      if (uploaded) {
        this.foodService.create(this.food).subscribe(x => {
          this.isSaving = false;
          form.reset();
          file.value = "";
          this.imageUrl = null;
        });
      }
      else {
        this.isSaving = false;
      }
    });
  }

  onCancel() {
    this.router.navigate(['/foods'])
  }

  NewGuid(): string {
    let d = new Date().getTime();
    if (window.performance && typeof window.performance.now === "function") {
      d += performance.now();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      let r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }
}
