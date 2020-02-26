import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatTableDataSource, MatPaginator, MAT_DIALOG_DATA } from '@angular/material';
import { Payable } from 'src/app/core/models/admin/payable.model';

@Component({
  selector: 'app-purchases-show-items-dialog',
  templateUrl: './purchases-show-items-dialog.component.html',
  styles: []
})
export class PurchasesShowItemsDialogComponent implements OnInit {

  displayedColumns: string[] = ['index', 'sku', 'name', 'quantity', 'averageCost', 'totalCost'];

  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {purchase: Payable}
  ) { 
  }

  ngOnInit() {
    this.dataSource.data = this.data.purchase.itemsList;
    this.dataSource.paginator = this.paginator;
  }

}
