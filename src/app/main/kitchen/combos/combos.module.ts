import { NgModule } from '@angular/core';
import { CombosRoutingModule } from './combos-routing.module';
import { CombosComponent } from './combos.component';
import { CreateNewComboDialogComponent } from './create-new-combo-dialog/create-new-combo-dialog.component';
import { ConfirmComboDialogComponent } from './confirm-combo-dialog/confirm-combo-dialog.component';
import { MatIconModule, MatInputModule, MatDividerModule, MatFormFieldModule, MatButtonModule, MatDialogModule, MatSelectModule, MatOptionModule, MatAutocompleteModule, MatTableModule, MatPaginatorModule, MatMenuModule, MatProgressSpinnerModule } from '@angular/material';
import { ReactiveFormsModule } from '@angular/forms';
import { SatDatepickerModule, SatNativeDateModule } from 'saturn-datepicker';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    CombosComponent,
    CreateNewComboDialogComponent,
    ConfirmComboDialogComponent
  ],
  imports: [
    CombosRoutingModule,
    MatIconModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    ReactiveFormsModule,
    SatDatepickerModule,
    SatNativeDateModule,
    MatSelectModule,
    MatOptionModule,
    MatAutocompleteModule,
    MatTableModule,
    MatPaginatorModule,
    CommonModule,
    MatMenuModule,
    MatProgressSpinnerModule

  ],
  entryComponents: [
    CreateNewComboDialogComponent
  ],

})
export class CombosModule { }
