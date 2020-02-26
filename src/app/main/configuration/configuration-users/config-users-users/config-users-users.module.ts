import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfigUsersUsersRoutingModule } from './config-users-users-routing.module';
import { ConfigUsersUsersComponent } from './config-users-users.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CreateNewUserComponent } from './create-new-user/create-new-user.component';
import { ConfigEditUserComponent } from './config-edit-user/config-edit-user.component';
import { ConfigDeleteUserComponent } from './config-delete-user/config-delete-user.component';
import {
  MatFormFieldModule,
  MatButtonModule,
  MatInputModule,
  MatIconModule,
  MatAutocompleteModule,
  MatProgressBarModule,
  MatDividerModule,
  MatTableModule,
  MatPaginatorModule,
  MatStepperModule,
  MatDialogModule
} from '@angular/material';


@NgModule({
  declarations: [
    ConfigUsersUsersComponent,
    CreateNewUserComponent,
    ConfigEditUserComponent,
    ConfigDeleteUserComponent,
  ],
  imports: [
    CommonModule,
    ConfigUsersUsersRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatAutocompleteModule,
    MatProgressBarModule,
    MatDividerModule,
    MatTableModule,
    MatPaginatorModule,
    MatStepperModule,
    MatDialogModule
  ],
  entryComponents: [
    CreateNewUserComponent,
    ConfigEditUserComponent,
    ConfigDeleteUserComponent,
  ]
})
export class ConfigUsersUsersModule { }
