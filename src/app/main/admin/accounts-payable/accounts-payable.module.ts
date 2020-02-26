import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountsPayableRoutingModule } from './accounts-payable-routing.module';
import { AccountsPayableComponent } from './accounts-payable.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatButtonModule,
  MatAutocompleteModule,
  MatCheckboxModule,
  MatTooltipModule,
  MatDividerModule,
  MatTableModule,
  MatPaginatorModule,
  MatSortModule,
  MatDialogModule,
  MatSnackBarModule,
  MatProgressSpinnerModule,
  MatProgressBarModule,
  MatMenuModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatRadioModule,
  MatSelectModule
} from '@angular/material';
import { AccountsPayableShowItemsDialogComponent } from './accounts-payable-show-items-dialog/accounts-payable-show-items-dialog.component';
import { AccountsPayableShowPaymentsDialogComponent } from './accounts-payable-show-payments-dialog/accounts-payable-show-payments-dialog.component';
import { AccountsPayablePartialPayDialogComponent } from './accounts-payable-partial-pay-dialog/accounts-payable-partial-pay-dialog.component';
import { AccountsPayablePayDialogComponent } from './accounts-payable-pay-dialog/accounts-payable-pay-dialog.component';

@NgModule({
  declarations: [
    AccountsPayableComponent,
    AccountsPayableShowItemsDialogComponent,
    AccountsPayableShowPaymentsDialogComponent,
    AccountsPayablePartialPayDialogComponent,
    AccountsPayablePayDialogComponent
  ],
  imports: [
    CommonModule,
    AccountsPayableRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatDividerModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatMenuModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    MatSelectModule
  ],
  entryComponents: [
    AccountsPayableShowItemsDialogComponent,
    AccountsPayableShowPaymentsDialogComponent,
    AccountsPayablePartialPayDialogComponent,
    AccountsPayablePayDialogComponent
  ]
})
export class AccountsPayableModule { }
