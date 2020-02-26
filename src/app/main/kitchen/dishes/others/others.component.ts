import { filter, startWith, map } from 'rxjs/operators';
import { Observable, combineLatest } from 'rxjs';
import { MatTableDataSource } from '@angular/material';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './../../../../core/auth.service';
import { DatabaseService } from 'src/app/core/database.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-others',
  templateUrl: './others.component.html',
  styleUrls: ['./others.component.css']
})
export class OthersComponent implements OnInit {
  otherForm: FormGroup

  categories = ['Bebidas', 'Piqueos', 'Extras']

  displayedColumns: string[] = ['index', 'category', 'supplies', 'dish', 'amount', 'actions'];
  dataSource = new MatTableDataSource();

  listDishes$: Observable<any>

  menuList: Array<any> = []

  inputs: Array<any> = null
  inputsRequired: Array<any> = null
  inputsMissing: Array<any> = []

  constructor(
    private fb: FormBuilder,
    public dbs: DatabaseService,
    public auth: AuthService,
    private af: AngularFirestore
  ) { }

  ngOnInit() {
    this.otherForm = this.fb.group({
      category: ['', Validators.required],
      dish: ['', Validators.required],
      amount: ['', Validators.required]
    })

    this.listDishes$ = combineLatest(
      this.dbs.onGetRecipes(),
      this.otherForm.get('category').valueChanges,
      this.otherForm.get('dish').valueChanges.pipe(
        filter(input => input !== null),
        startWith<any>(''),
        map(value => typeof value === 'string' ? value.toLowerCase() : value.name.toLowerCase())),
      this.dbs.onGetElements('Insumos')
    ).pipe(
      map(([dishes, category, dish, inputs]) => {
        this.inputs = inputs
        let dishC = dishes.filter(el => el['category'] == category)
        return dish ? dishC.filter(option => option['name'].toLowerCase().includes(dish.toLowerCase())) : dishC;
      })
    )
  }

  showDish(dish): string | undefined {
    return dish ? dish['name'] : undefined;
  }

  deleteItem(i) {
    this.menuList.splice(i, 1);
    this.dataSource.data = this.menuList
  }
  editItem(element, index) {
    this.otherForm.get('dish').setValue(element['dish'])
    this.otherForm.get('category').setValue(element['category'])
    this.otherForm.get('amount').setValue(element['amount'])

    this.menuList.splice(index, 1);
    this.dataSource.data = this.menuList
  }

  add() {


    let cost = this.inputs.map(el => {
      let costT = 0
      this.otherForm.get('dish').value['inputs'].forEach(al => {
        if (el['id'] == al['id']) {
          costT += el['averageCost'] * al['quantity']
        }
      })
      return costT
    }).reduce((a, b) => a + b, 0)

    this.menuList.push({
      ...this.otherForm.value,
      missing: true,
      cost: cost
    })

    let required = this.menuList.map(el => {
      return el['dish']['inputs'].map(al => {
        return {
          ...al,
          required: al['quantity'] * el['amount']
        }
      })

    }).reduce((a, b) => a.concat(b), [])

    this.inputsRequired = this.inputs.map(el => {
      let amount = 0
      let missing = 0
      required.forEach(al => {
        if (el['id'] == al['id']) {
          amount += al['required']
          missing = el['stock'] - amount
        }
      })
      return {
        ...el,
        required: amount,
        missing: missing
      }
    }).filter(el => el['required'] > 0)

    this.inputsMissing = this.inputsRequired.filter(al => al['missing'] < 0)
    this.menuList[this.menuList.length - 1]['missing'] = this.inputsRequired.filter(al => al['missing'] < 0).length > 0

    this.otherForm.reset()
    this.otherForm.get('dish').setValue('')

    this.dataSource.data = this.menuList

  }

  cancel() {

  }

  save() {

  }
}
