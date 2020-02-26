import { CancelComponent } from './cancel/cancel.component';
import { User } from './../../../core/models/general/user.model';
import { ListProductsComponent } from './list-products/list-products.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { tap, filter, startWith, map, debounceTime, switchMap } from 'rxjs/operators';
import { DatabaseService } from './../../../core/database.service';
import { Observable, combineLatest } from 'rxjs';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatDialog } from '@angular/material';
import { Order } from 'src/app/core/models/sales/menu/order.model';
import { DatePipe } from '@angular/common';
import * as XLSX from 'xlsx';
import { AuthService } from 'src/app/core/auth.service';

@Component({
  selector: 'app-sales-record',
  templateUrl: './sales-record.component.html',
  styleUrls: ['./sales-record.component.css']
})
export class SalesRecordComponent implements OnInit {

  orders$: Observable<any>

  data$: Observable<Order[]>
  displayedColumns: string[] = ['index', 'date', 'documentType', 'numberDocument', 'client', 'cashSale', 'products', 'user', 'actions'];
  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator, { static: false }) set content(paginator: MatPaginator) {
    this.dataSource.paginator = paginator;
  }

  data_xls: any
  headersXlsx: string[] = [
    'Fecha',
    'Hora',
    'Tipo de Documento',
    'Nro de Documento',
    'Cliente',
    'Total de venta',
    'Lista de ventas',
    'Usuario'
  ]

  search: FormGroup
  filteredUsers$: Observable<User[]>;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    public dbs: DatabaseService,
    public datePipe: DatePipe,
    public auth: AuthService
  ) { }

  ngOnInit() {
    const view = this.dbs.getCurrentMonthOfViewDate();

    this.search = this.fb.group({
      date: [{ begin: view.from, end: new Date() }],
      users: ['']
    })


    // this.dataFormGroup.get('date').setValue({begin: view.from, end: new Date()});

    this.orders$ =
      this.search.get('date').valueChanges
        .pipe(
          startWith<any>({ begin: view.from, end: new Date() }),
          debounceTime(300),
          switchMap(date => {
            return this.dbs.onGetOrders(date.begin, date.end);
          })
        );

    this.data$ =
      combineLatest(
        this.orders$,
        this.dbs.getCustomers(),
        this.search.get('users').valueChanges.pipe(
          startWith('')
        )
      ).pipe(
        map(([orders, customers, user]) => {
          let array = orders.map(el => {
            let customer = el['customerId'] ? customers.filter(al => al['id'] == el['customerId'])[0] : ''
            return {
              ...el,
              customerName: customer ? customer['type'] == 'NATURAL' ? customer['name'] : customer['businessName'] : ''
            }
          })
          return array.filter(el => user['displayName'] ? el['createdBy']['displayName'] == user['displayName'] : true).reverse()
        }),
        tap(res => {
          this.dataSource.data = res.map((el, i) => {
            return {
              ...el,
              index: i + 1
            }
          })
          this.data_xls = res
        })
      )

    this.filteredUsers$ = combineLatest(
      this.dbs.getUsers(),
      this.search.get('users').valueChanges.pipe(
        filter(input => input !== null),
        startWith<any>(''),
        map(value => typeof value === 'string' ? value.toLowerCase() : value.name.toLowerCase()))
    ).pipe(
      map(([users, name]) => {
        return name ? users.filter(option => option['displayName'].toLowerCase().includes(name.toLowerCase())) : users;
      })
    );

  }

  showSelectedUser(user): string | undefined {
    return user ? user['displayName'] : undefined;
  }

  viewProducts(list) {
    this.dialog.open(ListProductsComponent, {
      data: list
    })
  }

  cancelOrder(order) {
    this.dialog.open(CancelComponent, {
      data: order
    })
  }


  downloadXls(): void {
    let table_xlsx: any[] = [];

    table_xlsx.push(this.headersXlsx);

    this.data_xls.forEach(element => {
      const temp = [
        this.datePipe.transform(element['createdAt'].toMillis(), 'dd/MM/yyyy'),
        this.datePipe.transform(element['createdAt'].toMillis(), 'hh:mm'),
        element['documentType'],
        element['documentSerial'] + '-' + element['documentCorrelative'],
        element['customerId'] ? element['customerName'] : 'Sin nombre',
        element['total'],
        element['orderList'].map(el => el['name']).join('-'),
        element['createdBy']['displayName']
      ];
      table_xlsx.push(temp);
    })

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(table_xlsx);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ventas Registradas');

    const name = 'Historial_ventas.xlsx'
    XLSX.writeFile(wb, name);
  }

}
