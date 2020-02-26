import { NgModule } from '@angular/core';
import { DishesRoutingModule } from './dishes-routing.module';
import { DishesComponent } from './dishes.component';
import {
  MatIconModule,
  MatDividerModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatButtonModule,
  MatTableModule,
  MatPaginatorModule,
  MatMenuModule,
  MatDialogModule,
  MatCheckboxModule,
  MatDatepickerModule,
  MatTabsModule,
  MatAutocompleteModule,
  MatProgressBarModule
} from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MissingInputsComponent } from './missing-inputs/missing-inputs.component';
import { OrdersComponent } from './orders/orders.component';
import { PlanningComponent } from './planning/planning.component';
import { ConfigurationComponent } from './configuration/configuration.component';
import { RecipeComponent } from './configuration/recipe/recipe.component';
import { OthersComponent } from './others/others.component';
import { ApproveComponent } from './orders/approve/approve.component';
import { CancelComponent } from './orders/cancel/cancel.component';
import { ToPostComponent } from './orders/to-post/to-post.component';

@NgModule({
  declarations: [
    DishesComponent,
    MissingInputsComponent,
    OrdersComponent,
    PlanningComponent,
    ConfigurationComponent,
    RecipeComponent,
    OthersComponent,
    ApproveComponent,
    CancelComponent,
    ToPostComponent
  ],
  imports: [
    CommonModule,
    DishesRoutingModule,
    MatIconModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatMenuModule,
    MatDialogModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatTabsModule,
    MatAutocompleteModule,
    FormsModule,
    ReactiveFormsModule,
    MatProgressBarModule
  ],
  entryComponents: [
    MissingInputsComponent,
    ApproveComponent,
    CancelComponent,
    ToPostComponent
  ],

})
export class DishesModule { }
