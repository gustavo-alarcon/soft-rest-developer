import { Component, OnInit } from '@angular/core';
import { SidenavService } from 'src/app/core/sidenav.service';

@Component({
  selector: 'app-configuration-users',
  templateUrl: './configuration-users.component.html',
  styles: []
})
export class ConfigurationUsersComponent implements OnInit {

  constructor(
    public sidenav: SidenavService
  ) { }

  ngOnInit() {
  }

}
