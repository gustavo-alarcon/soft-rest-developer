import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomersRoutingModule } from './customers-routing.module';
import { CustomersComponent } from './customers.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule,
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
          MatRadioModule } from '@angular/material';
import { ContactsDialogComponent } from './contacts-dialog/contacts-dialog.component';
import { CreateDialogComponent } from './create-dialog/create-dialog.component';
import { EditDialogComponent } from './edit-dialog/edit-dialog.component';
import { DeleteConfirmComponent } from './delete-confirm/delete-confirm.component';


@NgModule({
  declarations: [
    CustomersComponent,
    ContactsDialogComponent,
    CreateDialogComponent,
    EditDialogComponent,
    DeleteConfirmComponent
  ],
  imports: [
    CommonModule,
    CustomersRoutingModule,
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
    MatRadioModule
  ],
  entryComponents: [
    ContactsDialogComponent,
    CreateDialogComponent,
    EditDialogComponent,
    DeleteConfirmComponent
  ]
})
export class CustomersModule { }
