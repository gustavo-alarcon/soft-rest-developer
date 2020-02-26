import { NgModule } from '@angular/core';
import { RecipesRoutingModule } from './recipes-routing.module';
import { RecipesComponent } from './recipes.component';
import { MatSelectModule, MatDividerModule, MatIconModule, MatOptionModule, MatAutocompleteModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDialogModule, MatTableModule, MatPaginatorModule, MatDatepickerModule, MatProgressBarModule } from '@angular/material';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CreateNewRecipeDialogComponent } from './create-new-recipe-dialog/create-new-recipe-dialog.component';
import { EditNewRecipeDialogComponent } from './edit-new-recipe-dialog/edit-new-recipe-dialog.component';
import { ConfirmRecipeDialogComponent } from './confirm-recipe-dialog/confirm-recipe-dialog.component';

@NgModule({
  declarations: [
    RecipesComponent,
    CreateNewRecipeDialogComponent,
    EditNewRecipeDialogComponent,
    ConfirmRecipeDialogComponent,
  ],
  imports: [
    RecipesRoutingModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatDividerModule,
    MatIconModule,
    MatOptionModule,
    CommonModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatTableModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatProgressBarModule

  ],
  entryComponents: [
    CreateNewRecipeDialogComponent,
    EditNewRecipeDialogComponent,
    ConfirmRecipeDialogComponent
  ],

})
export class RecipesModule { }
