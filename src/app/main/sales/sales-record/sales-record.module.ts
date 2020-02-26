import { SalesRecordComponent } from './sales-record.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  MatAutocompleteModule
} from '@angular/material';
import { SatDatepickerModule, SatNativeDateModule } from 'saturn-datepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SalesRecordRoutingModule } from './sales-record-routing.module';
import { ListProductsComponent } from './list-products/list-products.component';
import { CancelComponent } from './cancel/cancel.component';


@NgModule({
  declarations: [
    SalesRecordComponent,
    ListProductsComponent,
    CancelComponent
  ],
  imports: [
    CommonModule,
    SalesRecordRoutingModule,
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
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatAutocompleteModule,
    SatDatepickerModule, 
    SatNativeDateModule
  ],
  entryComponents: [
    ListProductsComponent,
    CancelComponent
  ]
})
export class SalesRecordModule { }
