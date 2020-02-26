import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Payable } from 'src/app/core/models/admin/payable.model';
import { MatTableDataSource, MatPaginator, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-accounts-payable-show-payments-dialog',
  templateUrl: './accounts-payable-show-payments-dialog.component.html',
  styles: []
})
export class AccountsPayableShowPaymentsDialogComponent implements OnInit {

  displayedColumns: string[] = ['index', 'paidAt', 'type', 'paymentType', 'amount', 'paidBy', 'cashReference'];

  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { debt: Payable }
  ) { }

  ngOnInit() {
    this.dataSource.data = this.data.debt.payments;
    this.dataSource.paginator = this.paginator;
  }

}
