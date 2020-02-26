import { MenuComponent } from './menu.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MenuRoutingModule } from './menu-routing.module';
import {
  MatIconModule,
  MatButtonModule,
  MatInputModule,
  MatFormFieldModule,
  MatDialogModule,
  MatDividerModule,
  MatAutocompleteModule,
  MatSnackBarModule,
  MatCheckboxModule
} from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VoucherComponent } from './voucher/voucher.component';

@NgModule({
  declarations: [
    MenuComponent,
    VoucherComponent
  ],
  imports: [
    CommonModule,
    MenuRoutingModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatDividerModule,
    MatAutocompleteModule,
    FormsModule, 
    ReactiveFormsModule,
    MatSnackBarModule,
    MatCheckboxModule
  ],
  entryComponents:[
    VoucherComponent
  ]
})
export class MenuModule { }
