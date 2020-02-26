import { AuthService } from './../../../../core/auth.service';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { MissingInputsComponent } from './../missing-inputs/missing-inputs.component';
import { MatTableDataSource, MatDialog, MatSnackBar } from '@angular/material';
import { startWith, distinctUntilChanged, debounceTime, map, filter, tap, take } from 'rxjs/operators';
import { FormBuilder, FormControl, FormGroup, Validators, AsyncValidatorFn, AbstractControl } from '@angular/forms';
import { DatabaseService } from 'src/app/core/database.service';
import { Observable, combineLatest } from 'rxjs';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-planning',
  templateUrl: './planning.component.html',
  styleUrls: ['./planning.component.css']
})
export class PlanningComponent implements OnInit {

  verifiedCheck = {
    executive: false,
    simple: false,
    second: false
  }


  menuTypes = [
    {
      name: 'Menú Ejecutivo',
      value: 'executive',
      verified: false
    },
    {
      name: 'Menú Básico',
      value: 'simple',
      verified: false
    },
    {
      name: 'Segundo',
      value: 'second',
      verified: false
    }
  ]

  categories = {
    executive: [
      {
        name: 'Entrada',
        value: 'ENTRADA'
      },
      {
        name: 'Sopas',
        value: 'SOPA'
      },
      {
        name: 'Segundo',
        value: 'FONDO'
      },
      {
        name: 'Postre',
        value: 'POSTRE'
      }
    ],
    simple: [
      {
        name: 'Entrada',
        value: 'ENTRADA'
      },
      {
        name: 'Sopas',
        value: 'ENTRADA'
      },
      {
        name: 'Segundo',
        value: 'FONDO'
      }
    ]
  }

  selectMenu: any = null
  selectMenu$: Observable<any>

  listDishes$: Observable<any>
  menuForm: FormGroup
  selectMenuForm = new FormControl('')


  displayedColumns: string[] = ['index', 'category', 'dish', 'amount', 'supplies', 'actions'];
  dataSource = new MatTableDataSource();

  list: Array<any> = [
    {
      name: 'Menú Ejecutivo',
      value: 'executive',
      view: false,
      list: []
    },
    {
      name: 'Menú Básico',
      value: 'simple',
      view: false,
      list: []
    },
    {
      name: 'Segundo',
      value: 'second',
      view: false,
      list: []
    }
  ]

  menuList: Array<any> = []
  inputs: Array<any> = null
  inputsRequired: Array<any> = []
  inputsMissing: Array<any> = []

  numberOrder: string
  numberOrder$: Observable<number>

  constructor(
    private fb: FormBuilder,
    public dbs: DatabaseService,
    private dialog: MatDialog,
    public auth: AuthService,
    private snackBar: MatSnackBar,
    private af: AngularFirestore
  ) { }

  ngOnInit() {
    this.menuForm = this.fb.group({
      category: ['', Validators.required],
      dish: ['', [Validators.required], [this.validDish()]],
      amount: ['', Validators.required]
    })

    this.selectMenu$ = this.selectMenuForm.valueChanges.pipe(
      tap(res => {
        if (res) {
          this.selectMenu = res
          let index = this.list.findIndex(el => el['name'] == this.selectMenu['name'])
          if (res['value'] == 'second') {
            this.menuForm.get('category').setValue(this.categories['simple'][2])
          }
        }
      })
    )

    this.listDishes$ = combineLatest(
      this.dbs.onGetRecipes(),
      this.menuForm.get('dish').valueChanges.pipe(
        filter(input => input !== null),
        startWith<any>(''),
        map(value => typeof value === 'string' ? value.toLowerCase() : value.name.toLowerCase())),
      this.dbs.onGetElements('Insumos')
    ).pipe(
      map(([dishes, dish, inputs]) => {
        this.inputs = inputs
        let dishC = dishes.filter(el => el['category'] == 'Platos')
        return dish ? dishC.filter(option => option['name'].toLowerCase().includes(dish.toLowerCase())) : dishC;
      })
    )

    this.numberOrder$ = this.dbs.onGetKitchenOrders().pipe(
      map(orders => {
        let number = orders.length + 1
        this.numberOrder = ("000" + number).slice(-4)
        return number
      })
    )

  }

  validDish(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      return control.valueChanges
        .pipe(
          debounceTime(500),
          take(1),
          map(type => {
            return !type.id ? { passValid: true } : null

          })
        );

    }

  }

  showDish(dish): string | undefined {
    return dish ? dish['name'] : undefined;
  }

  deleteItem(element) {

    let menuType = element['menuType']
    console.log(menuType);


    let rrr = []
    element['dish']['inputs'].forEach(el => {
      rrr.push({
        ...el,
        required: el['quantity'] * element['amount']
      })
    })

    this.inputs.forEach(al => {
      rrr.forEach(el => {
        if (al['id'] == el['id']) {
          al['stock'] += el['required']

        }
      })
    })

    this.inputsMissing = this.inputs.filter(al => al['stock'] < 0)

    let index = this.menuList.indexOf(element)

    let ind = this.list.findIndex(el => el['value'] == menuType)
    this.menuList.splice(index, 1);
    this.list[ind]['list'] = this.menuList.filter(el => el['menuType'] == menuType)

    if (this.menuList.filter(el => el['menuType'] == menuType).length == 0) {
      this.list[ind]['view'] = false
    }

    this.verified()

  }

  editItem(element) {
    this.selectMenu = this.menuTypes.filter(el => el['value'] == element['menuType'])[0]

    this.menuForm.get('dish').setValue(element['dish'])
    this.menuForm.get('category').setValue(element['category'])
    this.menuForm.get('amount').setValue(element['amount'])

    this.deleteItem(element)
  }

  verifiedInputs() {
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
      required.forEach(al => {
        if (el['id'] == al['id']) {
          amount += al['required']
        }
      })
      return {
        ...el,
        required: amount
      }
    }).filter(el => el['required'] > 0)

  }

  add() {

    let cost = this.inputs.map(el => {
      let costT = 0
      this.menuForm.get('dish').value['inputs'].forEach(al => {
        if (el['id'] == al['id']) {
          costT += el['averageCost'] * al['quantity']
        }
      })
      return costT
    }).reduce((a, b) => a + b, 0)

    this.menuList.push({
      ...this.menuForm.value,
      missing: true,
      menuType: this.selectMenu.value,
      cost: cost
    })

    let rrr = []
    this.menuForm.get('dish').value['inputs'].forEach(el => {
      rrr.push({
        ...el,
        required: el['quantity'] * this.menuForm.get('amount').value
      })
    })

    let prueba = this.inputs.map(al => {
      let here = false
      rrr.forEach(el => {
        if (al['id'] == el['id']) {
          al['stock'] -= el['required']
          here = true
        }
      })
      return {
        ...al,
        here: here
      }
    })

    this.inputsMissing = this.inputs.filter(al => al['stock'] < 0)

    let index = this.list.findIndex(el => el['name'] == this.selectMenu['name'])
    this.menuList[this.menuList.length - 1]['missing'] = prueba.filter(el => el['here']).filter(al => al['stock'] < 0).length > 0
    this.list[index]['list'] = this.menuList.filter(el => el['menuType'] == this.selectMenu.value)
    this.list[index]['view'] = true
    this.menuForm.reset()

    if (this.selectMenu.value == 'second') {
      this.menuForm.get('category').setValue(this.categories['simple'][2])
    }
    this.menuForm.get('dish').setValue('')
    this.selectMenu['verified'] = true

    this.verified()

  }

  missingInputs() {
    this.dialog.open(MissingInputsComponent, {
      data: this.inputsMissing
    })
  }

  verified() {
    let executive = this.menuList.filter(el => el['menuType'] == 'executive')
    let simple = this.menuList.filter(el => el['menuType'] == 'simple')
    let second = this.menuList.filter(el => el['menuType'] == 'second')

    let entryExecutive = executive.filter(el => el['category']['value'] == 'ENTRADA')
    let secondExecutive = executive.filter(el => el['category']['value'] == 'FONDO')
    let dessertExecutive = executive.filter(el => el['category']['value'] == 'POSTRE')

    let entrySimple = simple.filter(el => el['category']['value'] == 'ENTRADA')
    let secondSimple = simple.filter(el => el['category']['value'] == 'FONDO')

    let vExe = entryExecutive.length > 0 && secondExecutive.length > 0 && dessertExecutive.length > 0
    let vSim = entrySimple.length > 0 && secondSimple.length > 0

    this.verifiedCheck = {
      executive: vExe,
      simple: vSim,
      second: second.length > 0
    }

  }

  cancel() {
    let required = this.menuList.map(el => {
      return el['dish']['inputs'].map(al => {
        return {
          ...al,
          required: al['quantity'] * el['amount']
        }
      })
    }).reduce((a, b) => a.concat(b), [])

    this.inputs.forEach(el => {
      required.forEach(al => {
        if (el['id'] == al['id']) {
          el['stock'] += al['required']
        }
      })
    })

    this.menuList = []
    this.verifiedCheck = {
      executive: false,
      simple: false,
      second: false
    }
    this.list = this.list.map(el => {
      el['view'] = false
      el['list'] = []
      return el
    })

    this.selectMenu = null
    this.selectMenuForm.reset()
    this.inputsMissing = []
    this.inputsRequired = []
  }

  save() {

    this.verifiedInputs()

    const batch = this.af.firestore.batch();
    let inputRef: DocumentReference = this.af.firestore.collection(`/db/deliciasTete/kitchenOrders/`).doc();

    let menuL = this.menuList.map(el => {
      return {
        category: el['category'],
        dish: {
          name: el['dish']['name'],
          recipeId: el['dish']['id']
        },
        amount: el['amount'],
        menuType: el['menuType'],
        cost: el['cost']
      }
    })


    let inputsR = this.inputsRequired.map(el => {
      return {
        cost: el['averageCost'],
        name: el['name'],
        unit: el['unit'],
        id: el['id'],
        required: el['required'],
        stock: el['stock']
      }
    })

    this.auth.user$.pipe(
      take(1))
      .subscribe(user => {
        let inputData = {
          id: inputRef.id,
          sku: 'ORC-' + this.numberOrder,
          menu: menuL,
          inputs: inputsR,
          status: 'en proceso',
          createdAt: new Date(),
          createdBy: user,
          editedAt: new Date(),
          editedBy: user,
          missing: this.inputsMissing.length > 0
        }

        batch.set(inputRef, inputData);

        batch.commit().then(() => {
          this.snackBar.open('Se guardó orden del día', 'Aceptar', {
            duration: 6000
          });
          this.cancel()
        })
      })
  }
}
