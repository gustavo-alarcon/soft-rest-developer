import { CancelComponent } from './cancel/cancel.component';

import { ApproveComponent } from './approve/approve.component';
import { ToPostComponent } from './to-post/to-post.component';
import { Meal } from 'src/app/core/models/sales/menu/meal.model';
import { element } from 'protractor';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { AuthService } from './../../../../core/auth.service';
import { tap, filter, take, map } from 'rxjs/operators';
import { MatTableDataSource, MatPaginator, MatDialog, MatSnackBar } from '@angular/material';
import { Observable, combineLatest } from 'rxjs';
import { DatabaseService } from 'src/app/core/database.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import * as XLSX from 'xlsx';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  ordersView: boolean = true
  inputsView: boolean = false
  menuView: boolean = false

  viewCost: boolean = false

  currentOrder: any

  orders$: Observable<any>

  dishes$: Observable<any>
  dishes: Array<any>

  otherPublic: boolean

  displayedOrderColumns: string[] = ['index', 'date', 'document', 'menu', 'inputs', 'user', 'actions'];
  dataOrderSource = new MatTableDataSource();

  @ViewChild(MatPaginator, { static: false }) set content(paginator: MatPaginator) {
    this.dataOrderSource.paginator = paginator;
  }

  displayedMenuColumns: string[] = ['index', 'category', 'dish', 'prepared', 'sold'];
  dataMenuSource = new MatTableDataSource();

  displayedInputsColumns: string[] = ['index', 'input', 'unit', 'amount', 'cost', 'costTotal'];
  displayedInputs2Columns: string[] = ['index', 'input', 'unit', 'amount'];
  dataInputsSource = new MatTableDataSource();

  data_xls: any
  headersXlsx: string[] = [
    'Fecha',
    'Categoría',
    'Plato',
    'Cantidad Preparada',
    'Cantidad vendida'
  ]

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    private af: AngularFirestore,
    public datePipe: DatePipe,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit() {

    this.orders$ =
      combineLatest(
        this.dbs.onGetKitchenOrders(),
        this.dbs.onGetDishes(),
        this.dbs.onGetElements('Insumos')
      )
        .pipe(
          map(([orders, dishes, inputs]) => {
            this.dishes = dishes
            this.otherPublic = orders.filter(el => el['status'] == 'publicado').length > 0
            let array = orders.map(order => {
              order['menu'] = order['menu'].map((menu, index) => {
                let exist = false
                let sold = 0
                let dishId = ''
                let sku = 'AP-' + order['sku'].split('-')[1] + '-' + ('00' + (index + 1)).slice(-3)
                dishes.forEach(dish => {
                  if (sku == dish['sku']) {
                    exist = true
                    sold = menu['amount'] - dish['stock']
                    dishId = dish['id']
                  }
                })
                return {
                  ...menu,
                  exist: exist,
                  sold: sold,
                  dishId: dishId
                }
              })

              let verified = inputs.map(el => {
                let missing = 1
                order['inputs'].forEach(al => {
                  if (el['id'] == al['id']) {
                    missing = el['stock'] - al['required']
                  }
                })
                return missing
              })


              order['missing'] = verified.filter(el => el < 0).length > 0

              return order
            })
            return array
          }),
          tap(res => {
            this.dataOrderSource.data = res.filter(el => el['status'] != 'cancelado')
          })
        )

  }

  viewMenu(menu) {
    this.ordersView = false
    this.menuView = true
    this.data_xls = menu['menu']
    this.currentOrder = {
      name: menu['sku'],
      date: menu['createdAt'],
      list: [
        {
          name: 'Menú Ejecutivo',
          list: menu['menu'].filter(el => el['menuType'] == 'executive')
        },
        {
          name: 'Menú Básico',
          list: menu['menu'].filter(el => el['menuType'] == 'simple')
        },
        {
          name: 'Segundo',
          list: menu['menu'].filter(el => el['menuType'] == 'second')
        }
      ]
    }
  }

  viewInputs(menu) {
    this.inputsView = true
    this.ordersView = false
    this.currentOrder = {
      name: menu['sku'],
      date: menu['createdAt'],
      inputs: menu['inputs'],
      total: menu['inputs'].map(el => el['cost'] * el['required']).reduce((a, b) => a + b, 0)
    }
  }

  print() {
    const title = ['Nro', 'Insumo', 'Medida', 'Cantidad']

    let array = this.currentOrder['inputs'].map((el, index) => {
      return [String(index + 1), el['name'], el['unit'], String(el['required'])]
    })

    this.dbs.printAnything4Column(title, array)
  }

  downloadMenu() {
    let table_xlsx: any[] = [];

    table_xlsx.push(this.headersXlsx);

    this.data_xls.forEach(element => {
      const temp = [
        this.datePipe.transform(this.currentOrder['date'].toMillis(), 'dd/MM/yyyy'),
        element['category']['name'],
        element['dish']['name'],
        element['amount'],
        element['sold']
      ];
      table_xlsx.push(temp);
    })

    let date = this.datePipe.transform(this.currentOrder['date'].toMillis(), 'dd/MM/yyyy')
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(table_xlsx);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Menú del día');

    const name = 'Menú_del_día' + date + '.xlsx'
    XLSX.writeFile(wb, name);
  }

  approve(element) {
    this.dialog.open(ApproveComponent, {
      data: element
    })
  }

  cancelOrder(element) {
    this.dialog.open(CancelComponent, {
      data: element
    })

  }

  publicOrder(element) {
    this.dialog.open(ToPostComponent, {
      data: element
    })

  }



  finish(element) {

    const batch = this.af.firestore.batch();
    this.auth.user$.pipe(
      take(1)
    ).subscribe(user => {
      element['menu'].forEach(el => {
        let menuRef: DocumentReference = this.af.firestore.collection(`/db/deliciasTete/kitchenDishes/`).doc(el['dishId']);
        let menuDataUpdate = {
          status: 'INACTIVO', // DISPONIBLE, COCINANDO, INACTIVO
          editedAt: new Date,
          editedBy: user,
        }

        batch.update(menuRef, menuDataUpdate)
      })

      let orderRef = this.af.firestore.collection(`/db/deliciasTete/kitchenOrders`).doc(element['id']);

      batch.update(orderRef, {
        status: 'finalizado'
      })

      batch.commit().then(() => {
        this.snackBar.open('Menú finalizado', 'Aceptar', {
          duration: 6000
        });

      })
    })
  }

}
