import { Component, OnInit } from '@angular/core';
import { FormControl, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ViewEncapsulation } from '@angular/core';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: [ './login.component.css'],
})
export class LoginComponent implements OnInit {

  email = new FormControl();
  password = new FormControl();

  hide: boolean = true;

  constructor(
    public auth: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  checkAuth() {
    this.auth.emailLogin(this.email.value, this.password.value);
  }

  goToDashboard() {
    this.router.navigateByUrl('/main');
  }

}