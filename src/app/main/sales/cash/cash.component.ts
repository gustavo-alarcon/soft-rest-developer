import { EditImportComponent } from './edit-import/edit-import.component';
import { DeleteTransactionComponent } from './delete-transaction/delete-transaction.component';
import { AuthService } from './../../../core/auth.service';
import { Cash } from './../../../core/models/sales/cash/cash.model';
import { DatabaseService } from './../../../core/database.service';
import { OpenCashComponent } from './open-cash/open-cash.component';
import { RecordComponent } from './record/record.component';
import { TotalsComponent } from './totals/totals.component';
import { AddComponent } from './add/add.component';
import { RemoveComponent } from './remove/remove.component';
import { CloseCashComponent } from './close-cash/close-cash.component';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, AsyncValidatorFn, AbstractControl } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatDialog } from '@angular/material';
import { map, tap, startWith, take, distinctUntilChanged, debounceTime, filter, switchMap } from 'rxjs/operators';
import { Observable, combineLatest, of } from 'rxjs';
import { DatePipe } from '@angular/common';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-cash',
  templateUrl: './cash.component.html',
  styleUrls: ['./cash.component.css']
})
export class CashComponent implements OnInit {
  hidePass: boolean = true;

  isOpening$: Observable<boolean>

  openingForm: FormGroup

  cashRegisters$: Observable<any>
  transactions$: Observable<any>

  currentCash: Cash = null
  currentOpening: any
  transactions = null

  balance: number = 0
  balance$: Observable<number>

  search = new FormControl('')

  displayedColumns: string[] = ['index', 'date', 'type', 'description', 'amount', 'user', 'payment', 'actions'];
  dataSource = new MatTableDataSource();

  @ViewChild("firstView", { static: false }) set content(paginator: MatPaginator) {
    this.dataSource.paginator = paginator;
  }

  data_xls: any
  headersXlsx: string[] = [
    'Fecha',
    'Hora',
    'Tipo',
    'Descripción',
    'Importe',
    'Usuario',
    'Tipo de pago'
  ]


  constructor(
    private dialog: MatDialog,
    public dbs: DatabaseService,
    private fb: FormBuilder,
    public auth: AuthService,
    public datePipe: DatePipe,
  ) { }

  ngOnInit() {
    this.createForm()


    this.isOpening$ = combineLatest(
      this.dbs.getCashes(),
      this.auth.user$
    ).pipe(
      map(([cashes, user]) => {
        let cashOpen = cashes.filter(el => el['open']).filter(el => el['currentOwnerId'] == user.uid)
        this.currentCash = cashOpen[0]
        return cashOpen.length == 1
      })
    )

    this.balance$ = this.dbs.getCashes().pipe(
      switchMap(cashes => {
        let cash = cashes.filter(el => el['open'])[0]
        return this.dbs.getOpenCash(cash['id']).pipe(
          map(opens => {
            return opens.filter(el => el['id'] == cash['currentOpeningId'])
          })
        )
      }),
      map(cash => {
        let openCash = cash[0]
        this.currentOpening = cash[0]
        return openCash['openingBalance']
      })
    )

    this.transactions$ = combineLatest(
      this.dbs.getCashes(),
      this.auth.user$
    ).pipe(
      switchMap(([cashes, user]) => {
        let cash = cashes.filter(el => el['open']).filter(el => el['currentOwnerId'] == user.uid)[0]
        return combineLatest(
          this.dbs.getTransactions(cash.id, cash.currentOpeningId),
          this.search.valueChanges.pipe(
            startWith(''),
            distinctUntilChanged(),
            debounceTime(800),
            map(res => {
              return res.trim().replace(/\s+/g, " ");
            }),
          )
        ).pipe(
          map(([cashes, search]) => {
            this.transactions = cashes
            let income = cashes.filter(el => el['status'] == 'PAGADO').filter(el => el['type'] == 'Ingreso').map(el => Number(el['amount'])).reduce((a, b) => a + b, 0)
            let expenses = cashes.filter(el => el['status'] == 'PAGADO').filter(el => el['type'] == 'Egreso').map(el => Number(el['amount'])).reduce((a, b) => a + b, 0)

            this.balance = income - expenses
            return cashes.filter(el => {
              if (search) {
                let type = el['type'].toLowerCase().includes(search.toLowerCase())
                let descrip = el['description'].toLowerCase().includes(search.toLowerCase())
                return type || descrip
              } else {
                return true
              }
            })
          })
        )
      }),
      tap(res => {
        this.dataSource.data = res.filter(el => el['status'] == 'PAGADO').map((el, i) => {
          return {
            ...el,
            index: i + 1
          }
        })
        this.data_xls = res.filter(el => el['status'] == 'PAGADO')
      })
    )

    this.cashRegisters$ = this.dbs.getCashes()

  }

  createForm() {
    this.openingForm = this.fb.group({
      cash: ['', Validators.required],
      password: ['', [Validators.required], [this.matchPassword()]],
      amount: ['', Validators.required]
    })
  }

  matchPassword(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      return control.valueChanges.pipe(
        debounceTime(500),
        take(1),
        map(pass => {
          return pass !== this.currentCash.password ? { passValid: true } : null
        })
      );
    }
  }

  openCash() {
    this.dialog.open(OpenCashComponent, {
      data: {
        cash: this.currentCash,
        amount: this.openingForm.get('amount').value
      }
    })
  }

  closeCash() {
    this.dialog.open(CloseCashComponent, {
      data: {
        cash: this.currentCash,
        openCash: this.currentOpening,
        transactions: this.transactions
      }
    })
  }

  removeMoney() {
    this.dialog.open(RemoveComponent, {
      data: this.currentCash
    })
  }

  addMoney() {
    this.dialog.open(AddComponent, {
      data: this.currentCash
    })
  }

  editImport() {
    this.dialog.open(EditImportComponent, {
      data: this.currentCash
    })
  }

  totals() {
    this.dialog.open(TotalsComponent, {
      data: this.currentCash
    })
  }

  record() {
    this.dialog.open(RecordComponent, {
      data: this.currentCash
    })
  }

  deleteTransaction(transaction) {
    this.dialog.open(DeleteTransactionComponent, {
      data: {
        cash: this.currentCash,
        transaction: transaction
      }
    })
  }

  editTransaction(transaction) {
    if (transaction['type'] == 'Ingreso') {
      this.dialog.open(AddComponent, {
        data: {
          cash: this.currentCash,
          edit: true,
          transaction: transaction
        }
      })
    } else {
      this.dialog.open(RemoveComponent, {
        data: {
          cash: this.currentCash,
          edit: true,
          transaction: transaction
        }
      })
    }
  }

  downloadXls(): void {
    let table_xlsx: any[] = [];

    table_xlsx.push(this.headersXlsx);

    this.data_xls.forEach(element => {
      const temp = [
        this.datePipe.transform(element['createdAt'].toMillis(), 'yyyy/MM/dd'),
        this.datePipe.transform(element['createdAt'].toMillis(), 'hh:mm'),
        element['type'],
        element['description'],
        element['amount'],
        element['createdBy']['displayName'],
        element['paymentType'],
      ];
      table_xlsx.push(temp);
    })

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(table_xlsx);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Movimientos de caja');

    const name = 'Transacciones.xlsx'
    XLSX.writeFile(wb, name);
  }


}
