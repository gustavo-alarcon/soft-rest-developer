import { Meal } from './../../../../../core/models/sales/menu/meal.model';
import { take, tap } from 'rxjs/operators';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { AuthService } from './../../../../../core/auth.service';
import { DatabaseService } from './../../../../../core/database.service';
import { Component, OnInit, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-approve',
  templateUrl: './approve.component.html',
  styleUrls: ['./approve.component.css']
})
export class ApproveComponent implements OnInit {

  inputs$: Observable<any>
  inputs: Array<any> = []

  approve: boolean = false

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    private af: AngularFirestore,
    private dialog: MatDialogRef<ApproveComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data
  ) { }

  ngOnInit() {

  }

  save() {


    const batch = this.af.firestore.batch();
    this.auth.user$.pipe(
      take(1)
    ).subscribe(user => {
      this.data['menu'].forEach((el, index) => {
        let menuRef: DocumentReference = this.af.firestore.collection(`/db/deliciasTete/kitchenDishes/`).doc();
        let menuData: Meal = {
          id: menuRef.id,
          name: el['dish']['name'], // Lomo Saltado
          sku: 'AP-' + this.data['sku'].split('-')[1] + '-' + ('00' + (index + 1)).slice(-3),//AP102001
          description: '',
          picture: ' ',
          unit: 'UND.',// UND., KG., GR., L., M., PULG. ...
          stock: el['amount'],
          initialStock: el['amount'],
          emergencyStock: 0,
          menuType: el['menuType'],
          type: el['category']['value'], // ENTRADA, FONDO, POSTRE, PIQUEO, BEBIDA
          recipeId: el['dish']['recipeId'],
          status: 'COCINANDO', // DISPONIBLE, COCINANDO, INACTIVO
          price: 0,
          cost: el['cost'],
          createdAt: new Date,
          createdBy: user,
          editedAt: new Date,
          editedBy: user,
        }
        batch.set(menuRef, menuData)

      })

      this.data['inputs'].forEach(el => {

        let inputRef: DocumentReference = this.af.firestore.collection(`/db/deliciasTete/warehouseInputs/`).doc(el['id']);

        let data = {
          stock: firebase.firestore.FieldValue.increment(el['required'] * (-1))
        }
        batch.update(inputRef, data)
        let kardexRef = this.af.firestore.collection(`/db/deliciasTete/warehouseInputs/${el['id']}/kardex`).doc(inputRef.id)

        let inputKardex = {
          id: inputRef.id,
          details: 'Preparación de menú, orden de cocina: ' + this.data['sku'],
          insQuantity: 0,
          insPrice: 0,
          insTotal: 0,
          outsQuantity: el['required'],
          outsPrice: el['cost'],
          outsTotal: el['required'] * el['cost'],
          balanceQuantity: 0,
          balancePrice: 0,
          balanceTotal: 0,
          type: 'SALIDA',
          createdAt: new Date(),
          createdBy: user
        }

        batch.set(kardexRef, inputKardex)
      })

      let orderRef = this.af.firestore.collection(`/db/deliciasTete/kitchenOrders`).doc(this.data['id']);

      batch.update(orderRef, {
        status: 'aprobado'
      })

      batch.commit().then(() => {
        this.snackBar.open('Menú aprobado', 'Aceptar', {
          duration: 6000
        });
        this.dialog.close()
      })
    })

  }
}
