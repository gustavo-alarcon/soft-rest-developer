import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { DatabaseService } from 'src/app/core/database.service';
import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatTableDataSource, MatPaginator } from '@angular/material';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {

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
