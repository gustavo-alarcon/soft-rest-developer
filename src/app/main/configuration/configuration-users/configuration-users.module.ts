import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfigurationUsersRoutingModule } from './configuration-users-routing.module';
import { ConfigurationUsersComponent } from './configuration-users.component';
import { MatTabsModule,
          MatIconModule,
          MatProgressBarModule,
          MatSidenavModule,
          MatButtonModule} from '@angular/material';


@NgModule({
  declarations: [
    ConfigurationUsersComponent
  ],
  imports: [
    CommonModule,
    ConfigurationUsersRoutingModule,
    MatTabsModule,
    MatIconModule,
    MatProgressBarModule,
    MatSidenavModule,
    MatButtonModule
  ]
})
export class ConfigurationUsersModule { }
