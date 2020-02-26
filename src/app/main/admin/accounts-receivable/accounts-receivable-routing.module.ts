import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccountsReceivableComponent } from './accounts-receivable.component';


const routes: Routes = [
  {
    path: '',
    component: AccountsReceivableComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountsReceivableRoutingModule { }
