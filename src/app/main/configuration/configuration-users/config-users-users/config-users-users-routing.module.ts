import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConfigUsersUsersComponent } from './config-users-users.component';


const routes: Routes = [
  {
    path: '',
    component: ConfigUsersUsersComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigUsersUsersRoutingModule { }

