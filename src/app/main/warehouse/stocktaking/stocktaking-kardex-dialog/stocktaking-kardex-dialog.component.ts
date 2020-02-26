import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { FormControl, FormBuilder } from '@angular/forms';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { MatTableDataSource, MatPaginator, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { DatabaseService } from 'src/app/core/database.service';
import { AuthService } from 'src/app/core/auth.service';
import { startWith, debounceTime, switchMap, tap } from 'rxjs/operators';
import { Kardex } from 'src/app/core/models/warehouse/kardex.model';
import * as XLSX from 'xlsx';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-stocktaking-kardex-dialog',
  templateUrl: './stocktaking-kardex-dialog.component.html',
  styles: []
})
export class StocktakingKardexDialogComponent implements OnInit {

  loadingKardex = new BehaviorSubject<boolean>(false);
  loadingKardex$ = this.loadingKardex.asObservable();

  dateFormControl = new FormControl({ begin: new Date(), end: new Date() });
  kardexTypeFormControl = new FormControl(true);

  topColumns: string[] = [];
  displayedColumns: string[] = [];

  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator, { static: false }) set content(paginator: MatPaginator) {
    this.dataSource.paginator = paginator;
  }

  currentDate = Date.now();

  dateAndKardex$: Observable<Kardex[]>;
  kardex$: Observable<Kardex[]>;
  dateAndKardexAndValorado$: Observable<any>;

  valoradoFormControl: FormControl = new FormControl(false);
  valorado$: Observable<boolean>;

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: { name: string, type: string, id: string },
    private datePipe: DatePipe
  ) { }

  showTop(){
    return !!this.topColumns.length ? 'initial' : 'none';
  }

  ngOnInit() {

    const view = this.dbs.getCurrentMonthOfViewDate();
    // this.dataFormGroup.get('date').setValue({begin: view.from, end: new Date()});

    this.valorado$ = this.valoradoFormControl.valueChanges.pipe(startWith(false), tap(valorado => {
      if(valorado){
        this.topColumns = ['index', 'createdAt', 'details', 'ins', 'outs', 'balance'];
        this.displayedColumns = ['invisibleIndex', 'invisibleCreatedAt', 'invisibleDetails', 'insQuantity', 'insPrice', 'insTotal', 'outsQuantity', 'outsPrice', 'outsTotal', 'balanceQuantity', 'balancePrice', 'balanceTotal'];
        console.log(this.topColumns.length)

      }
      else{
        this.topColumns = [];
        this.displayedColumns = ['index', 'createdAt', 'details', 'insQuantity', 'outsQuantity', 'balanceQuantity'];
        console.log(this.topColumns.length)
      }
    }))

    this.dateAndKardex$ = 
    this.dateFormControl.valueChanges
      .pipe(
        startWith<any>({ begin: view.from, end: new Date() }),
        debounceTime(300),
        switchMap(date => {
          return this.observeKardex(date.begin, date.end);
        })
      );

    this.dateAndKardexAndValorado$ = combineLatest(this.dateAndKardex$, this.valorado$);
  }

  observeKardex(from: Date, to: Date): Observable<Kardex[]> {
    this.loadingKardex.next(true);

    return this.dbs.getKardex(from, to, this.data.type, this.data.id)
      .pipe(
        tap(kardex => {
          this.loadingKardex.next(false);
          this.dataSource.data = [... this.calcBalance(kardex)];
        })
      )
  }

  calcBalance(kardex: Array<Kardex>): Array<Kardex> {
    kardex.forEach((item, index) => {
      if(item.type === 'ENTRADA') {
        const balanceQuantity = kardex[index - 1].balanceQuantity + item.insQuantity;
        const balanceTotal = kardex[index - 1].balanceTotal + item.insTotal;
        const balancePrice = balanceTotal / balanceQuantity;

        kardex[index].balanceQuantity = balanceQuantity;
        kardex[index].balancePrice = balancePrice;
        kardex[index].balanceTotal = balanceTotal;
      }

      if(item.type === 'SALIDA') {
        const balanceQuantity = kardex[index - 1].balanceQuantity - item.outsQuantity;
        const balanceTotal = kardex[index - 1].balanceTotal - item.outsTotal;
        const balancePrice = balanceTotal / balanceQuantity;

      console.log(balanceQuantity, balanceTotal, balancePrice);

        kardex[index].balanceQuantity = balanceQuantity;
        kardex[index].balancePrice = balancePrice;
        kardex[index].balanceTotal = balanceTotal;
      }  
    });

    console.log(kardex);
    return kardex
  }

  downloadXls(): void {
    let table_xlsx: any[] = [];
    let dateRange;

    let headerXlsx = this.valoradoFormControl.value ? 
      [
        'Fecha',
        'Detalle',
        'E. Cantidad',
        'E. Pr./Uni',
        'E. Total',
        'S. Cantidad',
        'S. Pr./Uni',
        'S. Total',
        'Sal. Cantidad',
        'Sal. Pr./Uni',
        'Sal. Total',
      ]
      :
      [
        'Fecha',
        'Detalle',
        'E. Cantidad',
        'S. Cantidad',
        'Sal. Cantidad',
      ];

    table_xlsx.push(headerXlsx);

    this.dataSource.data.forEach((element: Kardex) => {

      const temp = this.valoradoFormControl.value ?  
      [
        this.datePipe.transform(this.getDate(element['createdAt']['seconds']), 'dd/MM/yyyy'),        
        element.details,
        element.insQuantity,
        element.insPrice,
        element.insTotal,
        element.outsQuantity,
        element.outsPrice,
        element.outsTotal,
        element.balanceQuantity,
        element.balancePrice,
        element.balanceTotal
      ]
        :
      [
        this.datePipe.transform(this.getDate(element['createdAt']['seconds']), 'dd/MM/yyyy'),        
        element.details,
        element.insQuantity,
        element.outsQuantity,
        element.balanceQuantity,
      ];

      table_xlsx.push(temp);
    })

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(table_xlsx);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'kardex');

    const name = 'kardex.xlsx';

    XLSX.writeFile(wb, name);
  }

  getDate(seconds: number){
    let date = new Date(1970);
    date.setSeconds(seconds);
    return date.valueOf();
  }

}
