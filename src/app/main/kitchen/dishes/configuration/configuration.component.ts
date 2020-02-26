import { tap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './../../../../core/auth.service';
import { DatabaseService } from 'src/app/core/database.service';
import { MatTableDataSource, MatDialog, MatPaginator, MatSnackBar } from '@angular/material';
import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css']
})
export class ConfigurationComponent implements OnInit {
  displayedMenuColumns: string[] = ['index', 'name', 'price', 'actions'];
  dataMenuSource = new MatTableDataSource();
  dataMenu: Array<any>

  displayedDishColumns: string[] = ['index', 'name', 'status', 'cost', 'stock'];
  dataDishSource = new MatTableDataSource();

  @ViewChild(MatPaginator, { static: false }) set content(paginator: MatPaginator) {
    this.dataDishSource.paginator = paginator;
  }


  dishes$: Observable<any>

  menus$: Observable<any>

  constructor(
    public dbs: DatabaseService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    public auth: AuthService,
    private af: AngularFirestore
  ) { }

  ngOnInit() {

    this.dishes$ = this.dbs.onGetDishes().pipe(
      map(dishes => {
        return dishes.map((el, i) => {
          return {
            ...el,
            index: i + 1
          }
        })
      }),
      tap(res => {
        this.dataDishSource.data = res.filter(el => el['status'] != 'INACTIVO')
      })
    )

    this.menus$ = this.dbs.getMenu().pipe(
      tap(res => {
        this.dataMenu = res.map(el => {
          return {
            ...el,
            edit: false
          }
        })
      })
    )
  }

  editItem(i) {
    this.dataMenu[i]['edit'] = true
  }

  save() {
    const batch = this.af.firestore.batch();
    this.dataMenu.forEach(el => {
      let inputRef = this.af.firestore.collection(`/db/deliciasTete/menuConfiguration/`).doc(el['id']);
      batch.update(inputRef, {
        price: el['price']
      })
    })
    batch.commit().then(() => {
      this.snackBar.open('Cambios Guardados', 'Aceptar', {
        duration: 5000
      });
    })
  }

}
