import { NgModule } from '@angular/core';
import { PromosRoutingModule } from './promos-routing.module';
import { PromosComponent } from './promos.component';
import { MatIconModule, MatDividerModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDialogModule, MatSelectModule, MatOptionModule, MatAutocompleteModule, MatTableModule, MatPaginatorModule, MatMenuModule } from '@angular/material';
import { CreateNewPromoDialogComponent } from './create-new-promo-dialog/create-new-promo-dialog.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SatDatepickerModule, SatNativeDateModule } from 'saturn-datepicker';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ConfirmPromoDialogComponent } from './confirm-promo-dialog/confirm-promo-dialog.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@NgModule({
  declarations: [
    PromosComponent,
    CreateNewPromoDialogComponent,
    ConfirmPromoDialogComponent,
  ],
  imports: [
    PromosRoutingModule,
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
    CreateNewPromoDialogComponent,
    ConfirmPromoDialogComponent
  ],

})
export class PromosModule { }
