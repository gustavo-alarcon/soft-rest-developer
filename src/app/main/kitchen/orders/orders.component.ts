import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { DatabaseService } from 'src/app/core/database.service';
import { Observable, combineLatest } from 'rxjs';
import { Order } from 'src/app/core/models/sales/menu/order.model';
import { tap, map, startWith, debounceTime, switchMap } from 'rxjs/operators';
import { MatTableDataSource, MatPaginator, MatDialog } from '@angular/material';
import { OrderDetailsDialogComponent } from './order-details-dialog/order-details-dialog.component';
import { InputDetailsDialogComponent } from './input-details-dialog/input-details-dialog.component';
import { DatePipe } from '@angular/common';
import * as XLSX from 'xlsx';
import { AuthService } from 'src/app/core/auth.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  //Table
  ordersTableDataSource = new MatTableDataSource();

  ordersTableDisplayedColumns: string[] = [
    'index', 'createdAt', 'orderCorrelative', 'documentSerialdocumentCorrelative', 'customerId',
    'orderListButton', 'inputsButton', 'createdBy'
  ]

  //Excel
  headersXlsx: string[] = [
    'Fecha de Creación',
    'Nro de Pedido',
    'Comprobante de referencia',
    'Cliente',
    'Creado por',
  ]

  searchForm: FormGroup;

  ordersData$: Observable<Order[]>

  constructor(
    private fb: FormBuilder,
    private dbs: DatabaseService,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    public auth: AuthService
  ) { }


  @ViewChild('ordersTablePaginator', { static: false }) set matPaginator(mp: MatPaginator) {
    this.ordersTableDataSource.paginator = mp;
  }


  ngOnInit() {

    const newDate = new Date();

    this.searchForm = this.fb.group({
      dateRange: [{ begin: new Date(newDate.setHours(0, 0, 0, 0)), end: new Date(newDate.setHours(23, 59, 59, 0)) }],
      filterControl: [null]
    })

    this.ordersData$ =
      this.searchForm.get('dateRange').valueChanges
        .pipe(
          startWith<any>({ begin: new Date(newDate.setHours(0, 0, 0, 0)), end: new Date(newDate.setHours(23, 59, 59, 0)) }),
          debounceTime(300),
          switchMap(date => {

            return combineLatest(
              this.dbs.getOrdersKitchen(date.begin, date.end),
              this.dbs.getCustomers(),
            ).pipe(
              map(([orders, customers]) => {
                let array = orders.map((el, index) => {
                  let customer = el['customerId'] ? customers.filter(al => al['id'] == el['customerId'])[0] : ''
                  return {
                    ...el,
                    customerName: customer ? customer['type'] == 'NATURAL' ? customer['name'] : customer['businessName'] : '',
                    index: index + 1
                  }
                })
                return array
              }))
          }),
          tap(orders => {
            this.ordersTableDataSource.data = orders.reverse()
          }))

  }




  filter() {
    this.ordersTableDataSource.filter = this.searchForm.get('filterControl').value;
  }

  onGetOrderDetails(order: Order) {
    this.dialog.open(OrderDetailsDialogComponent, {
      data: order
    });
  }

  onGetOrderInputs(order: Order) {
    this.dialog.open(InputDetailsDialogComponent, {
      data: order
    });
  }

  downloadXls(): void {
    let table_xlsx: any[] = [];
    let dateRange;
    let availableUnits;
    table_xlsx.push(this.headersXlsx);

    this.ordersTableDataSource.data.forEach((element: Order) => {


      const temp = [
        this.datePipe.transform(this.getDate(element.createdAt['seconds']), 'dd/MM/yyyy'),
        element.orderCorrelative,
        element.documentSerial + " - " + element.documentCorrelative,
        "nombre de cliente",
        element.createdBy.displayName
      ];
      table_xlsx.push(temp);
    })

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(table_xlsx);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `orden`);

    const name = `orden.xlsx`;

    XLSX.writeFile(wb, name);
  }

  getDate(seconds: number) {
    let date = new Date(1970);
    date.setSeconds(seconds);
    return date.valueOf();
  }
}
