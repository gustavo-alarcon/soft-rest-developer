import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConfigUsersPermitsComponent } from './config-users-permits.component';


const routes: Routes = [
  {
    path: '',
    component: ConfigUsersPermitsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigUsersPermitsRoutingModule { }
