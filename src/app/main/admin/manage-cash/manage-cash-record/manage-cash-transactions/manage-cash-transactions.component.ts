import { tap } from 'rxjs/operators';
import { DatabaseService } from 'src/app/core/database.service';
import { Observable } from 'rxjs';
import { MatTableDataSource, MatPaginator, MAT_DIALOG_DATA } from '@angular/material';
import { Component, OnInit, ViewChild, Inject } from '@angular/core';

@Component({
  selector: 'app-manage-cash-transactions',
  templateUrl: './manage-cash-transactions.component.html'
})
export class ManageCashTransactionsComponent implements OnInit {

  displayedColumns: string[] = ['index', 'date', 'type', 'description', 'amount', 'user', 'paymentType'];
  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator, { static: false }) set content(paginator: MatPaginator) {
    this.dataSource.paginator = paginator;
  }

  transactions$:Observable<any>

  constructor(
    public dbs: DatabaseService,
    @Inject(MAT_DIALOG_DATA) public data
  ) { }

  ngOnInit() {
    this.transactions$ = this.dbs.getTransactions(this.data['cash'], this.data['open']).pipe(
      tap(res=>{
        this.dataSource.data = res
      })
    )
  }
}
