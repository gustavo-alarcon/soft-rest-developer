import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MatTableDataSource, MatPaginator, MAT_DIALOG_DATA } from '@angular/material';
import { DatabaseService } from 'src/app/core/database.service';
import { AuthService } from 'src/app/core/auth.service';
import { Order } from 'src/app/core/models/sales/menu/order.model';

@Component({
  selector: 'app-orders-show-details',
  templateUrl: './orders-show-details.component.html',
  styles: []
})
export class OrdersShowDetailsComponent implements OnInit {

  loadingDetails = new BehaviorSubject<boolean>(false);
  loadingDetails$ = this.loadingDetails.asObservable();

  displayedColumns: string[] = ['index', 'name', 'quantity'];

  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator, { static: false }) set content(paginator: MatPaginator) {
    this.dataSource.paginator = paginator;
  }

  currentDate = Date.now();

  details$: Observable<{
    name: string;
    quantity: number;
  }[]>;

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: Order
  ) { }

  ngOnInit() {
    
    let list = [];

    this.data.orderList.forEach(order => {
      console.log(order);
      const temp = {
        name: order.name,
        quantity: order['amount'],
        type: order['type'] ? order['type'] : null,
        appetizer: order['appetizer'] ? order['appetizer'] : null,
        mainDish: order['mainDish'] ? order['mainDish'] : null,
        dessert: order['dessert'] ? order['dessert'] : null,

      }

      list.push(temp);
      
    });

    this.dataSource.data = list;
  }

}
