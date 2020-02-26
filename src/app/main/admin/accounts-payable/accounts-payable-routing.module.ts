import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccountsPayableComponent } from './accounts-payable.component';


const routes: Routes = [
  {
    path: '',
    component: AccountsPayableComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountsPayableRoutingModule { }
