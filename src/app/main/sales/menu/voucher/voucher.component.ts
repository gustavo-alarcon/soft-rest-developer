import { Transaction } from './../../../../core/models/sales/cash/transaction.model';
import { take, filter, map } from 'rxjs/operators';
import { Order } from './../../../../core/models/sales/menu/order.model';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { AuthService } from './../../../../core/auth.service';
import { DatabaseService } from './../../../../core/database.service';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-voucher',
  templateUrl: './voucher.component.html',
  styleUrls: ['./voucher.component.css']
})
export class VoucherComponent implements OnInit {

  orders: Array<any> = []
  others: Array<any> = []
  combos: Array<any> = []
  desserts: Array<any> = []
  extras: Array<any> = []
  inputExtras: Array<any> = []
  countDishes: Array<any> = []
  print: Array<any>

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    private af: AngularFirestore,
    private dialog: MatDialogRef<VoucherComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) { }

  ngOnInit() {
    let dishes = this.data['orderList'].filter(el => el['type'])
      .filter(el => el['type'] == 'simple' || el['type'] == 'executive' || el['type'] == 'second').map(el => {
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
            array.push({
              name: el['mainDish']['name'],
              id: el['mainDish']['id'],
              stock: el['mainDish']['stock']
            })
            return array
            break;
          default:
            break;
        }
      })

    if (dishes.length) {
      this.countDishes = dishes.reduce((a, b) => a.concat(b), []).map((el, index, array) => {
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
    }

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

    this.extras = this.data['orderList'].filter(el => el['category'])
      .filter(el => el['category'].toLowerCase() == 'extras' || el['category'].toLowerCase() == 'piqueo' || el['category'].toLowerCase() == 'bebidas')
    //.forEach()

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


    this.print = this.data['orderList'].map(el => {
      return {
        quantity: el['amount'],
        description: el['name'],
        vUnit: el['price'],
        import: el['amount'] * el['price'],
        element: el
      }
    }).map((el, index, array) => {
      let counter = 0
      array.forEach(al => {
        if (al['description'] == el['description']) {
          counter++
        }
      })
      if (el['quantity'] < counter) {
        el['quantity'] = counter
      }

      return el
    }).filter((dish, index, array) => array.findIndex(el => el['description'] === dish['description']) === index)

  }


  newCustomer(type) {
    const batch = this.af.firestore.batch();

    const customerRef = this.af.firestore.collection(this.dbs.customersCollection.ref.path).doc();

    let data;

    this.auth.user$
      .pipe(
        take(1)
      )
      .subscribe(user => {
        if (type === 'NATURAL') {
          data = {
            id: customerRef.id,
            type: type,
            name: this.data['customerId']['name'],
            dni: this.data['customerId']['dni'],
            phone: this.data['customerId']['phone'] ? this.data['customerId']['phone'] : "",
            mail: '',
            createdAt: new Date(),
            createdBy: user,
            editedBy: null,
            editedDate: null
          }
        } else {
          data = {
            id: customerRef.id,
            type: type,
            businessName: this.data['customerId']['businessName'],
            businessAddress: this.data['customerId']['address'],
            ruc: this.data['customerId']['ruc'],
            businessPhone: this.data['customerId']['phone'],
            contacts: null,
            createdAt: new Date(),
            createdBy: user,
            editedBy: null,
            editedDate: null
          }
        }

        batch.set(customerRef, data);

        this.data['customerId'] = customerRef.id
        batch.commit()
          .then(() => {
            console.log('cliente guardado');

          })
      })


  }

  save() {
    let batch = this.af.firestore.batch();
    let inputRef: DocumentReference = this.af.firestore.collection(`/db/deliciasTete/orders/`).doc();
    let transactionRef: DocumentReference = this.af.firestore.collection(`/db/deliciasTete/cashRegisters/${this.data['cashId']}/openings/${this.data['openingId']}/transactions`).doc(inputRef.id);

    let inputData: Order;
    let transactionData: Transaction;

    if (typeof this.data['customerId'] == 'object') {
      if (this.data['customerId']['dni']) {
        this.newCustomer('NATURAL')
      } else {
        this.newCustomer('EMPRESA')
      }
    }


    this.auth.user$.pipe(
      take(1))
      .subscribe(user => {
        inputData = {
          id: inputRef.id,
          orderCorrelative: this.data['orderCorrelative'],
          orderList: this.data['orderList'],
          orderStatus: 'PAGADO',
          price: 0,
          discount: 0,
          igv: 0,
          total: this.data['total'],
          paymentType: this.data['paymentType'],
          amountReceived: this.data['amountReceived'],
          amountChange: this.data['amountChange'],
          documentType: this.data['documentType'],
          documentSerial: this.data['documentSerial'], // FE001 ...
          documentCorrelative: this.data['documentCorrelative'], // 0000124 ...
          customerId: this.data['customerId'],
          cashId: this.data['cashId'],
          openingId: this.data['openingId'],
          canceledAt: null,
          canceledBy: null,
          createdAt: new Date(),
          createdBy: user,
          editedAt: new Date(),
          editedBy: user
        }

        transactionData = {
          id: inputRef.id,
          type: 'Ingreso',
          description: 'Venta ' + this.data['documentSerial'] + '-' + this.data['documentCorrelative'],
          amount: this.data['total'],
          status: 'PAGADO',
          ticketType: this.data['documentType'],
          incomeType: 'VENTA',
          paymentType: this.data['paymentType'].toUpperCase(),
          editedBy: user,
          editedAt: new Date(),
          createdAt: new Date(),
          createdBy: user,
        }

        if (this.data['receivable']) {
          let receivableUserRef: DocumentReference = this.af.firestore.collection(`/db/deliciasTete/receivableUsers/`).doc(this.data['account']);
          let receivableRef: DocumentReference = this.af.firestore.collection(`/db/deliciasTete/receivableUsers/${this.data['account']}/list`).doc(inputRef.id);

          let receivableData = {
            id: inputRef.id,
            orderList: this.data['orderList'],
            description: 'Venta ' + this.data['documentSerial'] + '-' + this.data['documentCorrelative'],
            amount: this.data['total'],
            ticketType: this.data['documentType'],
            paymentType: this.data['paymentType'].toUpperCase(),
            editedBy: user,
            editedAt: new Date(),
            createdAt: new Date(),
            createdBy: user,
            debt: true
          }

          batch.set(receivableRef, receivableData)

          batch.update(receivableUserRef, {
            indebtAmount: firebase.firestore.FieldValue.increment(this.data['total'])
          })
        } else {
          batch.set(transactionRef, transactionData)
        }

        batch.set(inputRef, inputData);


        if (this.countDishes.length) {
          this.countDishes.forEach(dish => {
            let dishRef = this.af.firestore.collection(`/db/deliciasTete/kitchenDishes/`).doc(dish['id']);

            batch.update(dishRef, {
              stock: firebase.firestore.FieldValue.increment(dish['amount'] * (-1))
            })
          })
        }


        this.others.forEach(order => {
          let groceryRef = this.af.firestore.collection(`/db/deliciasTete/warehouseGrocery/`).doc(order['id']);
          let kardexRef = this.af.firestore.collection(`/db/deliciasTete/warehouseGrocery/${order['id']}/kardex`).doc(inputRef.id)

          let inputKardex = {
            id: inputRef.id,
            details: this.data['documentType'] + ': ' + this.data['documentSerial'] + '-' + this.data['documentCorrelative'],
            insQuantity: 0,
            insPrice: 0,
            insTotal: 0,
            outsQuantity: order['amount'],
            outsPrice: order['price'],
            outsTotal: order['amount'] * order['price'],
            balanceQuantity: 0,
            balancePrice: 0,
            balanceTotal: 0,
            type: 'SALIDA',
            createdAt: new Date(),
            createdBy: user
          }

          batch.update(groceryRef, {
            stock: firebase.firestore.FieldValue.increment(order['amount'] * (-1))
          })

          batch.set(kardexRef, inputKardex)
        })

        this.desserts.forEach(order => {
          let dessertRef = this.af.firestore.collection(`/db/deliciasTete/warehouseDesserts/`).doc(order['id']);
          let kardexRef = this.af.firestore.collection(`/db/deliciasTete/warehouseDesserts/${order['id']}/kardex`).doc(inputRef.id)

          let inputKardex = {
            id: inputRef.id,
            details: this.data['documentType'] + ': ' + this.data['documentSerial'] + '-' + this.data['documentCorrelative'],
            insQuantity: 0,
            insPrice: 0,
            insTotal: 0,
            outsQuantity: order['amount'],
            outsPrice: order['price'],
            outsTotal: order['amount'] * order['price'],
            balanceQuantity: 0,
            balancePrice: 0,
            balanceTotal: 0,
            type: 'SALIDA',
            createdAt: new Date(),
            createdBy: user
          }

          batch.update(dessertRef, {
            stock: firebase.firestore.FieldValue.increment(order['amount'] * (-1))
          })

          batch.set(kardexRef, inputKardex)
        })

        this.combos.forEach(combo => {
          let ref = this.af.firestore.collection(`/db/deliciasTete/${combo['category']}/`).doc(combo['id'])

          batch.update(ref, {
            soldUnits: firebase.firestore.FieldValue.increment(combo['amount'])
          })
        })

        this.inputExtras.forEach(input => {
          let ref = this.af.firestore.collection(`/db/deliciasTete/warehouseInputs/`).doc(input['id'])
          let kardexRef = this.af.firestore.collection(`/db/deliciasTete/warehouseInputs/${input['id']}/kardex`).doc(inputRef.id)

          let inputKardex = {
            id: inputRef.id,
            details: this.data['documentType'] + ': ' + this.data['documentSerial'] + '-' + this.data['documentCorrelative'],
            insQuantity: 0,
            insPrice: 0,
            insTotal: 0,
            outsQuantity: input['amount'],
            outsPrice: 0,
            outsTotal: input['amount'] * 0,
            balanceQuantity: 0,
            balancePrice: 0,
            balanceTotal: 0,
            type: 'SALIDA',
            createdAt: new Date(),
            createdBy: user
          }

          batch.update(ref, {
            stock: firebase.firestore.FieldValue.increment(input['amount'] * (-1))
          })

          batch.set(kardexRef, inputKardex)
        })


        this.dbs.printTicket(this.print, this.data['documentSerial'] + '-' + this.data['documentCorrelative'])

        batch.commit().then(() => {
          console.log('orden guardada');
          this.dialog.close()
        })
      })

  }

}
