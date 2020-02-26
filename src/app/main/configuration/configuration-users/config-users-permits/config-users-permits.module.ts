import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfigUsersPermitsRoutingModule } from './config-users-permits-routing.module';
import { ConfigUsersPermitsComponent } from './config-users-permits.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule,
          MatButtonModule,
          MatInputModule,
          MatIconModule,
          MatAutocompleteModule,
          MatProgressBarModule,
          MatDividerModule,
          MatTableModule,
          MatPaginatorModule,
          MatDialogModule, 
          MatStepperModule,
          MatCheckboxModule} from '@angular/material';
import { CreateNewPermitComponent } from './create-new-permit/create-new-permit.component';
import { UsersPermitDialogEditComponent } from './users-permit-dialog-edit/users-permit-dialog-edit.component';
import { UsersPermitConfirmDeleteComponent } from './users-permit-confirm-delete/users-permit-confirm-delete.component';


@NgModule({
  declarations: [
    ConfigUsersPermitsComponent,
    CreateNewPermitComponent,
    UsersPermitDialogEditComponent,
    UsersPermitConfirmDeleteComponent
  ],
  imports: [
    CommonModule,
    ConfigUsersPermitsRoutingModule,
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
    MatDialogModule,
    MatStepperModule,
    MatCheckboxModule
  ],
  entryComponents: [
    CreateNewPermitComponent,
    UsersPermitDialogEditComponent,
    UsersPermitConfirmDeleteComponent
  ]
})
export class ConfigUsersPermitsModule { }
