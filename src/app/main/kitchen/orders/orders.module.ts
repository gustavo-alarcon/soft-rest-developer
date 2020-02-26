import { NgModule } from '@angular/core';
import { SatDatepickerModule, SatNativeDateModule } from 'saturn-datepicker';
import { BrowserModule } from '@angular/platform-browser';
import { OrdersRoutingModule } from './orders-routing.module';
import { OrdersComponent } from './orders.component';
import { MatDividerModule, MatIconModule, MatDatepickerModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatDialogModule, MatOptionModule, MatAutocompleteModule, MatSnackBarModule, MatTableModule, MatPaginatorModule, MatProgressBarModule } from '@angular/material';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OrdersShowDetailsComponent } from './orders-show-details/orders-show-details.component';
import { OrdersShowInputsComponent } from './orders-show-inputs/orders-show-inputs.component';
import { OrderDetailsDialogComponent } from './order-details-dialog/order-details-dialog.component';
import { InputDetailsDialogComponent } from './input-details-dialog/input-details-dialog.component';

@NgModule({
  declarations: [
    OrdersComponent,
    OrdersShowDetailsComponent,
    OrdersShowInputsComponent,
    OrderDetailsDialogComponent,
    InputDetailsDialogComponent
  ],
  imports: [
    CommonModule,
    OrdersRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatDividerModule,
    MatIconModule,
    SatDatepickerModule,
    SatNativeDateModule ,
    MatDatepickerModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogModule,
    MatOptionModule,
    MatAutocompleteModule,
    MatSnackBarModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressBarModule
  ],
  entryComponents: [
    OrdersShowDetailsComponent,
    OrdersShowInputsComponent,
    OrderDetailsDialogComponent,
    InputDetailsDialogComponent
  ],

})
export class OrdersModule { }
