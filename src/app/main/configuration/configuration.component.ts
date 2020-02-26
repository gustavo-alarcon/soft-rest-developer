import { Component, OnInit } from '@angular/core';
import { Router, RouteConfigLoadStart, RouteConfigLoadEnd } from '@angular/router';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styles: []
})
export class ConfigurationComponent implements OnInit {

  links = [
    { name: 'Usuarios', route: 'users' },
  ];

  activeLink = this.links[0];

  loadingRouteConfig: boolean;

  constructor(
    public router: Router
  ) { }

  ngOnInit() {
    this.router.events
      .subscribe(event => {
        if (event instanceof RouteConfigLoadStart) {
          this.loadingRouteConfig = true;
        } else if (event instanceof RouteConfigLoadEnd) {
          this.loadingRouteConfig = false;
        }
        // if (event instanceof RouteConfigLoadStart) {
        //   this.loadingRouteConfig = true;
        // } else if (event instanceof RouteConfigLoadEnd) {
        //   this.loadingRouteConfig = false;
        // } else if (event instanceof NavigationStart) {

        //   if (event.url !== '/main') {
        //     this.auth.saveLastRoute(event.url);
        //     this.checkRoute(event.url);
        //   }

        // }
      });
  }

}
