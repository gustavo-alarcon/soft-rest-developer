import { TransactionsComponent } from './transactions/transactions.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { tap, startWith, map, debounceTime } from 'rxjs/operators';
import { Observable, combineLatest } from 'rxjs';
import { DatabaseService } from 'src/app/core/database.service';
import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatTableDataSource, MatPaginator, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { DatePipe } from '@angular/common';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-record',
  templateUrl: './record.component.html',
  styleUrls: ['./record.component.css']
})
export class RecordComponent implements OnInit {

  displayedColumns: string[] = ['index', 'opening', 'closing', 'openingBalance', 'totalBalance', 'totalIncomes', 'totalExpensives', 'responsible', 'actions'];
  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator, { static: false }) set content(paginator: MatPaginator) {
    this.dataSource.paginator = paginator;
  }

  openings$: Observable<any>

  search: FormGroup

  data_xls: any
  headersXlsx: string[] = [
    'Apertura',
    'Cierre',
    'Saldo Apertura',
    'Saldo Total',
    'Total Ingresos',
    'Total Egresos',
    'Responsable'
  ]

  constructor(
    public dbs: DatabaseService,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data,
    private dialog: MatDialog,
    public datePipe: DatePipe
  ) { }

  ngOnInit() {

    const view = this.dbs.getCurrentMonthOfViewDate();

    this.search = this.fb.group({
      date: [{begin: view.from, end: new Date()}]
    })

    this.openings$ =
      combineLatest(
        this.dbs.getOpenCash(this.data['id']),
        this.search.get('date').valueChanges
        .pipe(
          startWith<any>({begin: view.from, end: new Date()}),
        )
        
      ).pipe(
        map(([cashes, date]) => {
          return cashes.filter(el => {
            return this.filterTime(date.begin, date.end, el)
          })
        }),
        tap(res => {
          this.dataSource.data = res.filter(el=>el['totalAmount'])
          this.data_xls = res.filter(el=>el['totalAmount'])
        })
      )

  }

  filterTime(from, to, el) {
    if (from && to) {
      return el['openedAt'].toMillis() >= from.getTime() && el['openedAt'].toMillis() <= to.setHours(23, 59, 59)
    } else {
      if (from) {
        return el['openedAt'].toMillis() >= from.getTime()
      } else if (to) {
        return el['openedAt'].toMillis() <= to.setHours(23, 59, 59)
      }
    }
  }

  view(open) {
    this.dialog.open(TransactionsComponent, {
      data: {
        cash: this.data['id'],
        open: open
      }
    })
  }

  downloadXls(): void {
    let table_xlsx: any[] = [];

    table_xlsx.push(this.headersXlsx);

    this.data_xls.forEach(element => {
      const temp = [
        this.datePipe.transform(element['openedAt'].toMillis(), 'dd/MM/yyyy') + ' ' + this.datePipe.transform(element['openedAt'].toMillis(), 'hh:mm'),
        this.datePipe.transform(element['closedAt'].toMillis(), 'dd/MM/yyyy') + ' ' + this.datePipe.transform(element['closedAt'].toMillis(), 'hh:mm'),
        element['openingBalance'],
        element['totalAmount'],
        element['totalIncomes'],
        element['totalDepartures'],
        element['closedBy']['displayName']
      ];
      table_xlsx.push(temp);
    })

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(table_xlsx);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Historial Caja');

    const name = 'Historial_caja.xlsx'
    XLSX.writeFile(wb, name);
  }


}
