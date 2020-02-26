import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatTableDataSource, MatPaginator, MAT_DIALOG_DATA } from '@angular/material';
import { Payable } from 'src/app/core/models/admin/payable.model';

@Component({
  selector: 'app-accounts-payable-show-items-dialog',
  templateUrl: './accounts-payable-show-items-dialog.component.html',
  styles: []
})
export class AccountsPayableShowItemsDialogComponent implements OnInit {

  displayedColumns: string[] = ['index', 'sku', 'name', 'quantity', 'amount'];

  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {debt: Payable}
  ) { }

  ngOnInit() {
    this.dataSource.data = this.data.debt.itemsList;
    this.dataSource.paginator = this.paginator;
  }

}
