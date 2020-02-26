import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatTableDataSource, MatPaginator, MAT_DIALOG_DATA } from '@angular/material';
import { Payable } from 'src/app/core/models/admin/payable.model';

@Component({
  selector: 'app-purchases-show-payments-dialog',
  templateUrl: './purchases-show-payments-dialog.component.html',
  styles: []
})
export class PurchasesShowPaymentsDialogComponent implements OnInit {

  displayedColumns: string[] = ['index', 'paidAt', 'type', 'paymentType', 'amount', 'paidBy', 'cashReference'];

  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { purchase: Payable }
  ) { }

  ngOnInit() {
    this.dataSource.data = this.data.purchase.payments;
    this.dataSource.paginator = this.paginator;
  }
}
