import { Component, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { FormControl } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatDialog } from '@angular/material';
import { DatabaseService } from 'src/app/core/database.service';
import { AuthService } from 'src/app/core/auth.service';
import { Payable } from 'src/app/core/models/admin/payable.model';
import { startWith, debounceTime, distinctUntilChanged, map, tap } from 'rxjs/operators';
import { AccountsPayableShowItemsDialogComponent } from './accounts-payable-show-items-dialog/accounts-payable-show-items-dialog.component';
import { AccountsPayableShowPaymentsDialogComponent } from './accounts-payable-show-payments-dialog/accounts-payable-show-payments-dialog.component';
import { AccountsPayablePayDialogComponent } from './accounts-payable-pay-dialog/accounts-payable-pay-dialog.component';
import { AccountsPayablePartialPayDialogComponent } from './accounts-payable-partial-pay-dialog/accounts-payable-partial-pay-dialog.component';

@Component({
  selector: 'app-accounts-payable',
  templateUrl: './accounts-payable.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountsPayableComponent implements OnInit {

  loadingPayables = new BehaviorSubject(false);
  loadingPayables$ = this.loadingPayables.asObservable();

  filterFormControl = new FormControl();

  displayedColumns: string[] = ['index', 'createdAt', 'documentDate', 'documentType', 'documentSerial', 'documentCorrelative', 'provider', 'itemsList', 'subtotalAmount', 'igvAmount', 'totalAmount', 'paymentType', 'status', 'creditDate', 'paymentDate', 'paidAmount', 'indebtAmount', 'payments', 'createdBy', 'editedBy', 'actions'];

  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator, { static: false }) set content(paginator: MatPaginator) {
    this.dataSource.paginator = paginator;
  }

  payables$: Observable<Payable[]>;

  currentDate = Date.now();

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.payables$ =
      combineLatest(
        this.observePayables(),
        this.filterFormControl.valueChanges.pipe(startWith<any>(''), debounceTime(300), distinctUntilChanged())
      ).pipe(
        map(([payables, filterKey]) => {
          const list = payables.filter(option =>
            option.provider.name.toLowerCase().includes(filterKey) ||
            option.provider.ruc.toString().includes(filterKey) ||
            option.documentCorrelative.toString().includes(filterKey) ||
            option.status.toLowerCase().includes(filterKey)
          );

          this.dataSource.data = list;

          return list;
        })
      )
  }

  observePayables(): Observable<Payable[]> {
    this.loadingPayables.next(true);

    return this.dbs.getPayables()
      .pipe(
        tap(() => {
          this.loadingPayables.next(false);
        })
      )
  }

  showItemsList(debt: Payable): void {
    this.dialog.open(AccountsPayableShowItemsDialogComponent, {
      data: {
        debt: debt
      }
    });
  }

  showPayments(debt: Payable): void {
    this.dialog.open(AccountsPayableShowPaymentsDialogComponent, {
      data: {
        debt: debt
      }
    });
  }

  payTotalDebt(debt: Payable): void {
    this.dialog.open(AccountsPayablePayDialogComponent, {
      data: {
        debt: debt
      }
    });
  }

  payPartialDebt(debt: Payable): void {
    this.dialog.open(AccountsPayablePartialPayDialogComponent, {
      data: {
        debt: debt
      }
    });
  }

}
