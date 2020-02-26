import { take } from 'rxjs/operators';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { AuthService } from './../../../../core/auth.service';
import { DatabaseService } from './../../../../core/database.service';
import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-cancel',
  templateUrl: './cancel.component.html',
  styleUrls: ['./cancel.component.css']
})
export class CancelComponent implements OnInit {
  orders: Array<any>
  countDishes: Array<any>
  others: Array<any> = []
  combos: Array<any> = []
  desserts: Array<any> = []
  extras: Array<any> = []
  inputExtras: Array<any> = []

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    private af: AngularFirestore,
    private dialog: MatDialogRef<CancelComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) { }

  ngOnInit() {
    let dishes = this.data['orderList'].filter(el => el['type']).map(el => {
      let array = []
      switch (el['type']) {
        case 'executive':
          array.push({
            name: el['appetizer']['name'],
            id: el['appetizer']['id'],
            stock: el['appetizer']['stock']
          })
          array.push({
            name: el['mainDish']['name'],
            id: el['mainDish']['id'],
            stock: el['mainDish']['stock']
          })
          array.push({
            name: el['dessert']['name'],
            id: el['dessert']['id'],
            stock: el['dessert']['stock']
          })
          return array
          break;
        case 'simple':
          array.push({
            name: el['appetizer']['name'],
            id: el['appetizer']['id'],
            stock: el['appetizer']['stock']
          })
          array.push({
            name: el['mainDish']['name'],
            id: el['mainDish']['id'],
            stock: el['mainDish']['stock']
          })
          return array
          break;
        case 'second':
          return {
            name: el['mainDish']['name'],
            id: el['mainDish']['id'],
            stock: el['mainDish']['stock']
          }
          break;
        default:
          break;
      }
    })

    this.countDishes = dishes.reduce((a, b) => a.concat(b)).map((el, index, array) => {
      let counter = 0
      array.forEach(al => {
        if (al['id'] == el['id']) {
          counter++
        }
      })
      return {
        ...el,
        amount: counter
      }
    }).filter((dish, index, array) => array.findIndex(el => el['id'] === dish['id']) === index)


    this.others = this.data['orderList'].filter(el => el['type']).filter(el => el['type'].toLowerCase() == 'otros').map(el => {
      return {
        name: el['name'],
        id: el['id'],
        amount: el['amount'],
        price: el['price'],
      }
    })

    this.desserts = this.data['orderList'].filter(el => el['type']).filter(el => el['type'].toLowerCase() == 'postres').map(el => {
      return {
        name: el['name'],
        id: el['id'],
        amount: el['amount'],
        price: el['price'],
      }
    })

    this.extras = this.data['orderList'].filter(el => el['category'])
      .filter(el => el['category'].toLowerCase() == 'extras' || el['category'].toLowerCase() == 'piqueo' || el['category'].toLowerCase() == 'bebidas')
    //.forEach()

    this.combos = this.data['orderList'].filter(el => el['category']).filter(el => el['category'].toLowerCase() == 'combos' || el['category'].toLowerCase() == 'offers')

    if (this.combos.length > 0) {
      this.combos.forEach(combo => {
        combo['products'].forEach(product => {
          if (product['type']) {
            if (product['type'].toLowerCase() == 'otros') {
              this.others.push({
                name: product['name'],
                id: product['id'],
                amount: product['quantity'] * combo['amount'],
                price: 0

              })
            }

            if (product['type'].toLowerCase() == 'postres') {
              this.desserts.push({
                name: product['name'],
                id: product['id'],
                amount: product['quantity'],
                price: 0

              })
            }
          }
          if (product['category']) {
            this.extras.push(product)
          }
        })
      })
    }


    this.inputExtras = this.extras.map(el => {
      return el['inputs'].map(al => {
        return {
          ...al,
          required: al['quantity'] * el['amount']
        }
      })
    }).reduce((a, b) => a.concat(b), [])
      .map((el, index, array) => {
        let counter = 0
        array.forEach(al => {
          if (al['id'] == el['id']) {
            counter += al['quantity']
          }
        })
        return {
          ...el,
          amount: counter
        }
      }).filter((dish, index, array) => array.findIndex(el => el['id'] === dish['id']) === index)

  }

  cancel() {
    let batch = this.af.firestore.batch();
    let inputRef: DocumentReference = this.af.firestore.collection(`/db/deliciasTete/orders/`).doc(this.data['id']);
    let transactionRef: DocumentReference = this.af.firestore.collection(`/db/deliciasTete/cashRegisters/${this.data['cashId']}/openings/${this.data['openingId']}/transactions`).doc(this.data['id']);

    this.auth.user$.pipe(
      take(1))
      .subscribe(user => {
        let inputUpdate = {
          orderStatus: 'ANULADO',
          canceledAt: new Date(),
          canceledBy: user
        }

        batch.update(inputRef, inputUpdate);

        let transactionUpdate = {
          status: 'ANULADO',
          editAt: new Date(),
          editBy: user
        }
        batch.update(transactionRef, transactionUpdate);

        this.countDishes.forEach(dish => {
          let dishRef = this.af.firestore.collection(`/db/deliciasTete/kitchenDishes/`).doc(dish['id']);

          batch.update(dishRef, {
            stock: dish['stock']
          })
        })

        this.others.forEach(order => {
          let groceryRef = this.af.firestore.collection(`/db/deliciasTete/warehouseGrocery/`).doc(order['id']);
          let kardexRef = this.af.firestore.collection(`/db/deliciasTete/warehouseGrocery/${order['id']}/kardex`).doc(this.data['id'])

          batch.update(groceryRef, {
            stock: firebase.firestore.FieldValue.increment(order['amount'])
          })

          batch.update(kardexRef, {
            type: 'ANULADO'
          })
        })

        this.desserts.forEach(order => {
          let dessertRef = this.af.firestore.collection(`/db/deliciasTete/warehouseDesserts/`).doc(order['id']);
          let kardexRef = this.af.firestore.collection(`/db/deliciasTete/warehouseDesserts/${order['id']}/kardex`).doc(this.data['id'])

          batch.update(dessertRef, {
            stock: firebase.firestore.FieldValue.increment(order['amount'])
          })

          batch.update(kardexRef, {
            type: 'ANULADO'
          })
        })

        this.combos.forEach(combo => {
          let ref = this.af.firestore.collection(`/db/deliciasTete/${combo['category']}/`).doc(combo['id'])

          batch.update(ref, {
            soldUnits: firebase.firestore.FieldValue.increment(combo['amount'] * -1)
          })
        })

        this.inputExtras.forEach(input => {
          let ref = this.af.firestore.collection(`/db/deliciasTete/warehouseInputs/`).doc(input['id'])
          let kardexRef = this.af.firestore.collection(`/db/deliciasTete/warehouseInputs/${input['id']}/kardex`).doc(this.data['id'])


          batch.update(ref, {
            stock: firebase.firestore.FieldValue.increment(input['amount'])
          })

          batch.update(kardexRef, {
            type: 'ANULADO'
          })
        })

        batch.commit().then(() => {
          console.log('orden anulada');
          this.dialog.close()
        })
      })
  }
}
