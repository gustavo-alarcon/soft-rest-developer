import { Component, OnInit } from '@angular/core';
import { Router, RouteConfigLoadStart, RouteConfigLoadEnd } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  openedMenu: boolean = false;
  salesOpenedFlag: boolean = false;
  warehouseOpenedFlag: boolean = false;
  kitchenOpenedFlag: boolean = false;
  adminOpenedFlag: boolean = false;
  thirdOpenedFlag: boolean = false;

  loadingRouteConfig: boolean;
  
  constructor(
    public auth: AuthService,
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
      });
  }
  
  toggleSideMenu(): void {
    this.openedMenu = !this.openedMenu;
  }
  salesOpened(): void {
    this.salesOpenedFlag = true;
  }

  salesClosed(): void {
    this.salesOpenedFlag = false;
  }

  warehouseOpened(): void {
    this.warehouseOpenedFlag = true;
  }

  warehouseClosed(): void {
    this.warehouseOpenedFlag = false;
  }

  kitchenOpened(): void {
    this.kitchenOpenedFlag = true;
  }

  kitchenClosed(): void {
    this.kitchenOpenedFlag = false;
  }

  adminOpened(): void {
    this.adminOpenedFlag = true;
  }

  adminClosed(): void {
    this.adminOpenedFlag = false;
  }

  thirdOpened(): void {
    this.thirdOpenedFlag = true;
  }

  thirdClosed(): void {
    this.thirdOpenedFlag = false;
  }

}
