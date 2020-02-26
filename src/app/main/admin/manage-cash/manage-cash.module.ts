import { ManageCashTransactionsComponent } from './manage-cash-record/manage-cash-transactions/manage-cash-transactions.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManageCashRoutingModule } from './manage-cash-routing.module';
import { ManageCashComponent } from './manage-cash.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule, MatIconModule, MatInputModule, MatButtonModule, MatAutocompleteModule, MatCheckboxModule, MatTooltipModule, MatDividerModule, MatTableModule, MatPaginatorModule, MatSortModule, MatDialogModule, MatSnackBarModule, MatProgressSpinnerModule, MatProgressBarModule, MatMenuModule, MatDatepickerModule } from '@angular/material';
import { ManageCashCreateDialogComponent } from './manage-cash-create-dialog/manage-cash-create-dialog.component';
import { ManageCashDeleteConfirmComponent } from './manage-cash-delete-confirm/manage-cash-delete-confirm.component';
import { ManageCashEditConfirmComponent } from './manage-cash-edit-confirm/manage-cash-edit-confirm.component';
import { ManageCashEditDialogComponent } from './manage-cash-edit-dialog/manage-cash-edit-dialog.component';
import { ManageCashRecordComponent } from './manage-cash-record/manage-cash-record.component';
import { SatDatepickerModule, SatNativeDateModule } from 'saturn-datepicker';

@NgModule({
  declarations: [
    ManageCashComponent,
    ManageCashCreateDialogComponent,
    ManageCashDeleteConfirmComponent,
    ManageCashEditConfirmComponent,
    ManageCashEditDialogComponent,
    ManageCashRecordComponent,
    ManageCashTransactionsComponent
  ],
  imports: [
    CommonModule,
    ManageCashRoutingModule,
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
    SatDatepickerModule, 
    SatNativeDateModule
  ],
  entryComponents: [
    ManageCashCreateDialogComponent,
    ManageCashDeleteConfirmComponent,
    ManageCashEditConfirmComponent,
    ManageCashEditDialogComponent,
    ManageCashRecordComponent,
    ManageCashTransactionsComponent
  ]
})
export class ManageCashModule { }
