import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CombosComponent } from './combos.component';


const routes: Routes = [
  {
    path: '',
    component: CombosComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CombosRoutingModule { }
