import { Component, OnInit} from '@angular/core';
import { AuthService } from 'src/app/core/auth.service';

@Component({
  selector: 'app-dishes',
  templateUrl: './dishes.component.html',
  styleUrls: ['./dishes.component.css']
})
export class DishesComponent implements OnInit {

  constructor(
    public auth: AuthService
  ) { }

  ngOnInit() {
   
  }

}
