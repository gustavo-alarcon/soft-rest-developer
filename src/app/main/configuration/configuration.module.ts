import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfigurationRoutingModule } from './configuration-routing.module';
import { ConfigurationComponent } from './configuration.component';
import {  MatTabsModule,
          MatIconModule,
          MatProgressBarModule} from '@angular/material';


@NgModule({
  declarations: [ConfigurationComponent],
  imports: [
    CommonModule,
    ConfigurationRoutingModule,
    MatTabsModule,
    MatIconModule,
    MatProgressBarModule
  ]
})
export class ConfigurationModule { }
