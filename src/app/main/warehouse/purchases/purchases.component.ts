import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog, MatTableDataSource, MatPaginator } from '@angular/material';
import { RegisterDocumentsComponent } from './register-documents/register-documents.component';
import { DatabaseService } from 'src/app/core/database.service';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { Provider } from 'src/app/core/models/third-parties/provider.model';
import { tap, startWith, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { Payable } from 'src/app/core/models/admin/payable.model';
import { AuthService } from 'src/app/core/auth.service';
import { PurchasesShowItemsDialogComponent } from './purchases-show-items-dialog/purchases-show-items-dialog.component';
import { PurchasesShowPaymentsDialogComponent } from './purchases-show-payments-dialog/purchases-show-payments-dialog.component';
import { PurchasesCancelDialogComponent } from './purchases-cancel-dialog/purchases-cancel-dialog.component';
import * as XLSX from 'xlsx';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-purchases',
  templateUrl: './purchases.component.html',
  styleUrls: ['./purchases.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class PurchasesComponent implements OnInit {

  loadingPayables = new BehaviorSubject<boolean>(false);
  loadingPayables$ = this.loadingPayables.asObservable();
  
  loadingProviders = new BehaviorSubject<boolean>(false);
  loadingProviders$ = this.loadingProviders.asObservable();

  dataFormGroup: FormGroup;

  displayedColumns: string[] = ['index', 'createdAt', 'documentDate', 'documentType', 'documentSerial', 'documentCorrelative', 'provider', 'itemsList', 'subtotalAmount', 'igvAmount', 'totalAmount', 'paymentType', 'status', 'creditDate', 'paymentDate', 'paidAmount', 'indebtAmount', 'payments', 'createdBy', 'editedBy', 'actions'];

  dataSource = new MatTableDataSource();
  
  //Excel
  headersXlsx: string[] = [
    'Fecha de Registro',
    'Fecha de Emisión',
    'Tipo de documento',
    'Doc. Serie',
    'Doc. Correlativo',
    'Proveedor',
    'Sub Total',
    'IGV',
    'Total',
    'Tipo de pago',
    'Estado',
    'Fecha de Vencimiento (CREDITO)',
    'Fecha de Pago (CREDITO)',
    'Importe Pagado',
    'Importe Adeudado',
    'Creado Por',
    'Editado Por'
  ]

  @ViewChild('purchasePaginator', { static: false }) set content(paginator: MatPaginator) {
    this.dataSource.paginator = paginator;
  }

  currentDate = Date.now();
  
  dateAndPayables$: Observable<Payable[]>;
  payables$: Observable<Payable[]>;
  providers$: Observable<Provider[]>;


  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private datePipe: DatePipe
  ) { 
    
  }

  ngOnInit() {

    this.createForm();

    const view = this.dbs.getCurrentMonthOfViewDate();
    // this.dataFormGroup.get('date').setValue({begin: view.from, end: new Date()});

    this.dateAndPayables$ =
      this.dataFormGroup.get('date').valueChanges
        .pipe(
          startWith<any>({begin: view.from, end: new Date()}),
          debounceTime(300),
          switchMap(date => {
            return this.observePayables(date.begin, date.end);
          })
        );

    this.payables$ =
      combineLatest(
        this.dateAndPayables$,
        this.dataFormGroup.get('provider').valueChanges.pipe(startWith<any>(''))
      ).pipe(
        map(([payables, provider]) => {

          const filterKey = provider ? provider.ruc : '';

          const list = payables.filter(option =>
            option.provider.ruc === filterKey
          );

          if(provider === ''){
            this.dataSource.data = payables;
            return payables;
          } else {
            this.dataSource.data = list;
            return list;
          }

          
        })
      )

    this.providers$ = this.observeProviders();

  }

  createForm(): void {
    this.dataFormGroup = this.fb.group({
      date: [{begin: new Date(), end: new Date()}],
      provider: [null]
    })
  }

  observePayables(from: Date, to: Date): Observable<Payable[]> {
    this.loadingPayables.next(true);

    return this.dbs.onGetPurchases(from, to)
      .pipe(
        tap(res => {
          this.loadingPayables.next(false);
        })
      )
  }

  observeProviders(): Observable<Provider[]> {
    this.loadingProviders.next(true);

    return this.dbs.getProviders()
      .pipe(
        tap(() => {
          this.loadingProviders.next(false);
        })
      )
  }

  onRegistering(){
    this.dialog.open(RegisterDocumentsComponent);
  }

  showItemsList(purchase: Payable): void {
    this.dialog.open(PurchasesShowItemsDialogComponent, {
      data: {
        purchase: purchase
      }
    });
  }

  showPayments(purchase: Payable): void {
    this.dialog.open(PurchasesShowPaymentsDialogComponent, {
      data: {
        purchase: purchase
      }
    });
  }

  cancelPurchase(purchase: Payable): void {
    console.log(purchase);
    this.dialog.open(PurchasesCancelDialogComponent, {
      data: purchase
    });
  }
  downloadXls(): void {
    let table_xlsx: any[] = [];
    let dateRange;
    table_xlsx.push(this.headersXlsx);

    this.dataSource.data.forEach((element) => {

      const temp = [
        this.datePipe.transform(this.getDate(element['createdAt']['seconds']), 'dd/MM/yyyy'),
        this.datePipe.transform(this.getDate(element['documentDate']['seconds']), 'dd/MM/yyyy'),
        element['documentType'],
        element['documentSerial'],
        element['documentCorrelative'],
        element['provider']['name']+"-"+element['provider']['ruc'],
        !!element['subtotalAmount']? ("S/."+element['subtotalAmount'].toFixed(2)):'---',
        !!element['igvAmount']? ("S/."+element['igvAmount'].toFixed(2)):'---',
        !!element['totalAmount']? ("S/."+element['totalAmount'].toFixed(2)):'---',
        element['paymentType'],
        element['status'],
        !!element['creditDate'] ? (this.datePipe.transform(this.getDate(element['creditDate']['seconds']), 'dd/MM/yyyy')) : '---',
        !!element['paymentDate'] ? (this.datePipe.transform(this.getDate(element['paymentDate']['seconds']), 'dd/MM/yyyy')) : '---',
        !!element['paidAmount'] ? ("S/."+element['paidAmount']):'---',
        !!element['indebtAmount'] ? ("S/."+element['indebtAmount']):'---',
        !!element['createdBy'] ? element['createdBy']['displayName']:'---',
        !!element['editedBy'] ? element['editedBy']['displayName']:'---',
      ];
      table_xlsx.push(temp);
    })

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(table_xlsx);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'compras');

    const name = 'compras.xlsx';

    XLSX.writeFile(wb, name);
  }

  getDate(seconds: number){
    let date = new Date(1970);
    date.setSeconds(seconds);
    return date.valueOf();
  }
}
