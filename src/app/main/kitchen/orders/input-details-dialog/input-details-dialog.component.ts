import { DatabaseService } from 'src/app/core/database.service';
import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatTableDataSource } from '@angular/material';

@Component({
  selector: 'app-input-details-dialog',
  templateUrl: './input-details-dialog.component.html',
  styleUrls: ['./input-details-dialog.component.css']
})
export class InputDetailsDialogComponent implements OnInit {
  inputs: Array<any> = []
  combos: Array<any> = []
  extras: Array<any> = []
  inputExtras: Array<any> = []
  countDishes: Array<any> = []

  ordersTableDataSource = new MatTableDataSource();

  ordersTableDisplayedColumns: string[] = [
    'index', 'supplie', 'unit', 'amount',
  ]


  constructor(
    public dbs: DatabaseService,
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

    this.combos = this.data['orderList'].filter(el => el['category']).filter(el => el['category'].toLowerCase() == 'combos' || el['category'].toLowerCase() == 'offers')

    if (this.combos.length > 0) {
      this.combos.forEach(combo => {
        combo['products'].filter(el => el['category']).forEach(product => {
          this.inputs.push(product)
        })
      })
    }

    this.extras = this.data['orderList'].filter(el => el['category'])
      .filter(el => el['category'].toLowerCase() == 'extras' || el['category'].toLowerCase() == 'piqueo' || el['category'].toLowerCase() == 'bebidas')
      .forEach(al => {
        this.inputs.push(al)
      })

    this.inputExtras = this.inputs.map(el => {
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

    this.ordersTableDataSource.data = this.inputExtras

  }

  print() {
    const title = ['Nro', 'Insumo', 'Medida', 'Cantidad']

    let array = this.inputExtras.map((el, index) => {
      return [String(index + 1), el['name'], el['unit'], String(el['missing'] * -1)]
    })

    
    this.dbs.printAnything4Column(title, array)
  }


}
