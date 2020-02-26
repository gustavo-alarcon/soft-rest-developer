import { Component, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MatTableDataSource, MatPaginator } from '@angular/material';
import { AuthService } from 'src/app/core/auth.service';


@Component({
  selector: 'app-orders-show-inputs',
  templateUrl: './orders-show-inputs.component.html',
  styles: []
})
export class OrdersShowInputsComponent implements OnInit {

  loadingDetails = new BehaviorSubject<boolean>(false);
  loadingDetails$ = this.loadingDetails.asObservable();

  displayedColumns: string[] = ['index', 'input', 'unit', 'quantity'];

  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator, { static: false }) set content(paginator: MatPaginator) {
    this.dataSource.paginator = paginator;
  }

  currentDate = Date.now();

  details$: Observable<{
    input: string;
    unit: string;
    quantity: number;
  }[]>;
  
  constructor(
    public auth: AuthService
  ) { }

  ngOnInit() {
  }

}
