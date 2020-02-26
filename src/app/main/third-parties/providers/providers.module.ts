import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProvidersRoutingModule } from './providers-routing.module';
import { CreateProviderDialogComponent } from './create-provider-dialog/create-provider-dialog.component';
import { ProvidersComponent } from './providers.component';
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
import { ProvidersBanksDialogComponent } from './providers-banks-dialog/providers-banks-dialog.component';
import { ProvidersContactsDialogComponent } from './providers-contacts-dialog/providers-contacts-dialog.component';
import { ProvidersDeleteConfirmComponent } from './providers-delete-confirm/providers-delete-confirm.component';
import { ProvidersEditDialogComponent } from './providers-edit-dialog/providers-edit-dialog.component';


@NgModule({
  declarations: [
    CreateProviderDialogComponent,
    ProvidersComponent,
    ProvidersBanksDialogComponent,
    ProvidersContactsDialogComponent,
    ProvidersDeleteConfirmComponent,
    ProvidersEditDialogComponent
  ],
  imports: [
    CommonModule,
    ProvidersRoutingModule,
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
    MatSelectModule
  ],
  entryComponents: [
    CreateProviderDialogComponent,
    ProvidersBanksDialogComponent,
    ProvidersContactsDialogComponent,
    ProvidersDeleteConfirmComponent,
    ProvidersEditDialogComponent
  ]
})
export class ProvidersModule { }
