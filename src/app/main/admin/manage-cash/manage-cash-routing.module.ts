import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ManageCashComponent } from './manage-cash.component';


const routes: Routes = [
  {
    path: '',
    component: ManageCashComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageCashRoutingModule { }
