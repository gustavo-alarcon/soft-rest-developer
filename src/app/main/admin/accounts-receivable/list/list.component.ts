import { ProductsComponent } from './products/products.component';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { DatabaseService } from 'src/app/core/database.service';
import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatTableDataSource, MatPaginator, MatDialog } from '@angular/material';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {

  list$: Observable<any>

  displayedColumns: string[] = ['index', 'date', 'numberDocument', 'cashSale', 'products', 'user'];
  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator, { static: false }) set content(paginator: MatPaginator) {
    this.dataSource.paginator = paginator;
  }

  constructor(
    public dbs: DatabaseService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data
  ) { }

  ngOnInit() {

    this.list$ = this.dbs.getListReceivable(this.data).pipe(
      tap(res => {
        this.dataSource.data = res.filter(el=>el['debt'])
      })
    )
  }

  viewProducts(list) {
    this.dialog.open(ProductsComponent, {
      data: list
    })
  }

}
