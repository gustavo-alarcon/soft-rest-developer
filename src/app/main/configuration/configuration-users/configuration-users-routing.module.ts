import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConfigurationUsersComponent } from "./configuration-users.component";

const routes: Routes = [
  {
    path: '',
    component: ConfigurationUsersComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./config-users-users/config-users-users.module').then(mod => mod.ConfigUsersUsersModule)
      },
      {
        path: 'users',
        loadChildren: () => import('./config-users-users/config-users-users.module').then(mod => mod.ConfigUsersUsersModule)
      },
      {
        path: 'permits',
        loadChildren: () => import('./config-users-permits/config-users-permits.module').then(mod => mod.ConfigUsersPermitsModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigurationUsersRoutingModule { }
