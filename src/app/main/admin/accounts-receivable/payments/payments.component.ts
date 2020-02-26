import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { MatDialog, MAT_DIALOG_DATA, MatTableDataSource } from '@angular/material';
import { DatabaseService } from './../../../../core/database.service';
import { Component, OnInit, Inject } from '@angular/core';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css']
})
export class PaymentsComponent implements OnInit {

  list$: Observable<any>

  displayedColumns: string[] = ['index', 'date', 'amount', 'type', 'cash', 'user'];
  dataSource = new MatTableDataSource();

  constructor(
    public dbs: DatabaseService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data
  ) { }

  ngOnInit() {
    this.list$ = this.dbs.getPaysReceivable(this.data).pipe(
      tap(res => {
        this.dataSource.data = res
      })
    )
  }

}
