import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountsReceivableRoutingModule } from './accounts-receivable-routing.module';
import { AccountsReceivableComponent } from './accounts-receivable.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule, MatIconModule, MatInputModule, MatButtonModule, MatAutocompleteModule, MatCheckboxModule, MatDividerModule, MatTooltipModule, MatTableModule, MatPaginatorModule, MatSortModule, MatDialogModule, MatSnackBarModule, MatProgressSpinnerModule, MatProgressBarModule, MatMenuModule, MatDatepickerModule, MatNativeDateModule, MatRadioModule, MatSelectModule } from '@angular/material';
import { PaymentsComponent } from './payments/payments.component';
import { ListComponent } from './list/list.component';
import { PartialPayComponent } from './partial-pay/partial-pay.component';
import { TotalPayComponent } from './total-pay/total-pay.component';
import { CreateComponent } from './create/create.component';
import { ProductsComponent } from './list/products/products.component';


@NgModule({
  declarations: [AccountsReceivableComponent, PaymentsComponent, ListComponent, PartialPayComponent, TotalPayComponent, CreateComponent, ProductsComponent],
  imports: [
    CommonModule,
    AccountsReceivableRoutingModule,
    CommonModule,
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
    PaymentsComponent, ListComponent, PartialPayComponent, TotalPayComponent, CreateComponent, ProductsComponent
  ]
})
export class AccountsReceivableModule { }
