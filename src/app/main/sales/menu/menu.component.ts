import { Router } from '@angular/router';
import { AuthService } from './../../../core/auth.service';
import { Order } from './../../../core/models/sales/menu/order.model';
import { DatabaseService } from 'src/app/core/database.service';
import { map, tap, startWith, take, distinctUntilChanged, debounceTime, filter } from 'rxjs/operators';
import { Observable, combineLatest, of } from 'rxjs';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { VoucherComponent } from './voucher/voucher.component';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Meal } from 'src/app/core/models/sales/menu/meal.model';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuComponent implements OnInit {

  isOpening$: Observable<boolean>
  currentCash: any

  categoriesList: boolean = true
  MenuList: boolean = false
  generateSale: boolean = false
  otherList: boolean = false
  otherTitle: string = ''

  selectMenu: string = 'executive'
  billView: boolean = false
  ticketView: boolean = false
  checketView: boolean = true

  documentSerial$: Observable<any>
  documentSerial: string

  documentCorrelative$: Observable<any>
  documentCorrelative: any

  cashView = true
  visaView = false
  masterCardView = false

  receivable: boolean = false
  receivableAccount: string = ''
  showReceivable: boolean = false

  selectablePlate: any = null
  selectIndex: number = null

  others$: Observable<any>
  others: Array<any>

  dessert$: Observable<any>
  othersDesserts: Array<any>

  extras$: Observable<any>
  extras: Array<any>
  combo$: Observable<any>
  combos: Array<any>
  drinks$: Observable<any>
  bebidas: Array<any>
  offers$: Observable<any>
  offers: Array<any>
  appetizer$: Observable<any>
  piqueo: Array<any>

  plate$: Observable<Meal[]>
  plates: Array<Meal> = []
  entry: Array<Meal> = []
  soup: Array<Meal> = []
  second: Array<Meal> = []
  dessert: Array<Meal> = []


  favorites: Array<any> = []
  //favorites = this.other.sort((a, b) => b['sold'] - a['sold']).slice(0, 5)
  //others = this.other.filter(el => !this.favorites.includes(el))
  numberOrder$: Observable<number>
  number: number
  order: Array<any> = []

  total: number = this.order.map(el => el['price'] * el['amount']).reduce((a, b) => a + b, 0);
  total$: Observable<number>

  pay = new FormControl('')
  searchProduct = new FormControl('')
  change: number = 0
  change$: Observable<number>

  filteredCustomersNatural$: Observable<any>
  filteredCustomersBusiness$: Observable<any>

  selectedPay: any = 'checket'

  ticketForm: FormGroup
  billForm: FormGroup

  menus$: Observable<any>

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    public dbs: DatabaseService,
    public auth: AuthService,
    private router: Router,
    private snackbar: MatSnackBar
  ) {

    this.dbs.onGetDishes()
  }

  ngOnInit() {
    this.createForm()

    this.menus$ = this.dbs.getMenu()

    this.isOpening$ = combineLatest(
      this.dbs.getCashes(),
      this.auth.user$
    ).pipe(
      map(([cashes, user]) => {
        this.currentCash = cashes.filter(el => el['open']).filter(el => el['currentOwnerId'] == user.uid)[0]
        let cashOpen = cashes.filter(el => el['open']).filter(el => el['currentOwnerId'] == user.uid)
        return cashOpen.length == 1
      }),
      tap(res => {
        if (!res) {
          this.router.navigateByUrl('/main/ventas/caja');
          this.snackbar.open('No se aperturó caja', 'Aceptar', {
            duration: 6000
          })
        }
      })
    )

    this.filteredCustomersNatural$ = combineLatest(
      this.dbs.getCustomers(),
      this.ticketForm.get('dni').valueChanges.pipe(
        filter(input => input !== null),
        startWith<any>(''),
        map(value => typeof value === 'string' ? value.toLowerCase() : value.name.toLowerCase())),
      this.ticketForm.get('name').valueChanges.pipe(
        filter(input => input !== null),
        startWith<any>(''),
        map(value => typeof value === 'string' ? value.toLowerCase() : value.name.toLowerCase()))
    ).pipe(
      map(([users, dni, name]) => {
        let userNatural = users.filter(el => el['type'] == 'NATURAL')
        return {
          dni: dni ? userNatural.filter(option => option['dni'].toString().includes(dni)) : userNatural,
          name: name ? userNatural.filter(option => option['name'].toLowerCase().includes(name.toLowerCase())) : userNatural
        }
      })
    );

    this.filteredCustomersBusiness$ = combineLatest(
      this.dbs.getCustomers(),
      this.billForm.get('ruc').valueChanges.pipe(
        filter(input => input !== null),
        startWith<any>(''),
        map(value => typeof value === 'string' ? value.toLowerCase() : value.name.toLowerCase())),
      this.billForm.get('businessName').valueChanges.pipe(
        filter(input => input !== null),
        startWith<any>(''),
        map(value => typeof value === 'string' ? value.toLowerCase() : value.name.toLowerCase()))
    ).pipe(
      map(([users, ruc, businessName]) => {
        let business = users.filter(el => el['type'] == 'EMPRESA')
        return {
          ruc: ruc ? business.filter(option => option['ruc'].toString().includes(ruc)) : business,
          businessName: businessName ? business.filter(option => option['businessName'].toLowerCase().includes(businessName.toLowerCase())) : business,
        }
      })
    );

    this.plate$ = this.dbs.dishes$.pipe(
      map(dishes => {
        let plates = dishes.filter(el => el['status'] == 'DISPONIBLE')
        this.plates = plates.map(el => {
          return {
            ...el,
            sold: el['initialStock'] - el['stock']
          }
        })

        return plates

      })
    )

    this.numberOrder$ = this.dbs.getOrders().pipe(
      map(orders => {
        this.cancelOrder()
        this.number = orders.length + 1
        return orders.length + 1
      })
    )

    this.documentCorrelative$ = this.dbs.getOrders().pipe(
      map(orders => {
        let billSerial = orders.filter(el => el['documentType'] == 'FACTURA').length + 1
        let ticketSerial = orders.filter(el => el['documentType'] == 'BOLETA').length + 1
        let checketSerial = orders.filter(el => el['documentType'] == 'TICKET').length + 1

        return {
          bill: ("000000" + billSerial).slice(-7),
          ticket: ("000000" + ticketSerial).slice(-7),
          checket: ("000000" + checketSerial).slice(-7)
        }

      }),
      tap(res => {
        this.documentCorrelative = res
      })
    )

    this.change$ = this.pay.valueChanges.pipe(
      startWith(-1),
      map(pay => {
        if (this.total) {
          return pay - this.total > 0 ? pay - this.total : -1
        } else {
          return 0
        }

      }),
      tap(res => {
        if (res > 0) {
          this.change = Number(new Intl.NumberFormat('en', {
            maximumFractionDigits: 2,
            useGrouping: false
          }).format(res))
        } else {
          this.change = 0
        }
      })
    )

    this.others$ =
      combineLatest(
        this.dbs.onGetOthers(),
        this.searchProduct.valueChanges.pipe(
          startWith(''),
          distinctUntilChanged(),
          debounceTime(800),
          map(res => {
            return res.trim().replace(/\s+/g, " ");
          }),
        )
      )
        .pipe(
          map(([product, search]) => {
            return product.filter(el => search ? el['name'].toLowerCase().includes(search.toLowerCase()) : true)
          }),
          tap(res => this.others = res)
        )

    this.extras$ = combineLatest(
      this.dbs.onGetRecipes(),
      this.dbs.onGetElements('INSUMOS')
    ).pipe(
      map(([recipes, inputs]) => {
        let array = recipes.filter(el => el['category'] == 'Extras').map(el => {
          let required = []
          el['inputs'].forEach(plate => {
            required.push(inputs.filter(input => {
              return input['id'] == plate['id']
            })
              .map(al => Math.trunc(al['stock'] / plate['quantity']))[0])
          })
          el['stock'] = Math.min(...required)
          let view = el['stock'] > 0
          return {
            ...el,
            view: view
          }
        })
        return array.filter(el => el['view'])
      }),
      tap(res => {
        this.extras = res
      })
    )

    this.combo$ = combineLatest(
      this.dbs.onGetCombo(),
      this.dbs.onGetElements('INSUMOS'),
      this.dbs.onGetElements('OTROS'),
      this.dbs.onGetElements('POSTRES')
    ).pipe(
      map(([combos, inputs, others, postres]) => {
        return combos.map(el => {
          let required = []
          el['products'].forEach(al => {
            if (al['category']) {
              al['inputs'].forEach(plate => {
                required.push(inputs.filter(input => {
                  return input['id'] == plate['id']
                })
                  .map(al => Math.trunc(al['stock'] / plate['quantity']))[0])
              })
            }

            if (al['type']) {
              required.push(others.filter(input => {
                return input['id'] == al['id']
              })
                .map(al => Math.trunc(al['stock'] / al['quantity']))[0])
              required.push(postres.filter(input => {
                return input['id'] == al['id']
              })
                .map(al => Math.trunc(al['stock'] / al['quantity']))[0])
            }
          })

          el['stock'] = Math.min(...required)
          let view = el['stock'] > 0

          return {
            ...el,
            view: view,
            category: 'combos'
          }
        }).filter(el => el['view'])
      }),
      tap(res => {
        this.combos = res
      })
    )

    this.drinks$ = combineLatest(
      this.dbs.onGetRecipes(),
      this.dbs.onGetElements('INSUMOS')
    ).pipe(
      map(([recipes, inputs]) => {
        let array = recipes.filter(el => el['category'] == 'Bebidas').map(el => {
          let required = []
          el['inputs'].forEach(plate => {
            required.push(inputs.filter(input => {
              return input['id'] == plate['id']
            })
              .map(al => Math.trunc(al['stock'] / plate['quantity']))[0])
          })
          el['stock'] = Math.min(...required)
          let view = el['stock'] > 0
          return {
            ...el,
            view: view
          }
        })
        return array.filter(el => el['view'])
      }),
      tap(res => {
        this.bebidas = res
      })
    )

    this.dessert$ = this.dbs.onGetElements('POSTRES').pipe(
      tap(res => this.othersDesserts = res)
    )

    this.offers$ = combineLatest(
      this.dbs.onGetOffer(),
      this.dbs.onGetElements('INSUMOS'),
      this.dbs.onGetElements('OTROS'),
      this.dbs.onGetElements('POSTRES')
    ).pipe(
      map(([combos, inputs, others, postres]) => {
        return combos.map(el => {
          let required = []
          el['products'].forEach(al => {
            if (al['category']) {
              al['inputs'].forEach(plate => {
                required.push(inputs.filter(input => {
                  return input['id'] == plate['id']
                })
                  .map(al => Math.trunc(al['stock'] / plate['quantity']))[0])
              })
            }

            if (al['type']) {
              required.push(others.filter(input => {
                return input['id'] == al['id']
              })
                .map(al => Math.trunc(al['stock'] / al['quantity']))[0])
              required.push(postres.filter(input => {
                return input['id'] == al['id']
              })
                .map(al => Math.trunc(al['stock'] / al['quantity']))[0])
            }
          })

          el['stock'] = Math.min(...required)
          let view = el['stock'] > 0

          return {
            ...el,
            view: view,
            category: 'offers'
          }
        }).filter(el => el['view'])
      }),
      tap(res => {
        this.offers = res
      })
    )

    this.appetizer$ = combineLatest(
      this.dbs.onGetRecipes(),
      this.dbs.onGetElements('INSUMOS')
    ).pipe(
      map(([recipes, inputs]) => {
        let array = recipes.filter(el => el['category'] == 'Piqueo').map(el => {
          let required = []
          el['inputs'].forEach(plate => {
            required.push(inputs.filter(input => {
              return input['id'] == plate['id']
            })
              .map(al => Math.trunc(al['stock'] / plate['quantity']))[0])
          })
          el['stock'] = Math.min(...required)
          let view = el['stock'] > 0
          return {
            ...el,
            view: view
          }
        })
        return array.filter(el => el['view'])
      }),
      tap(res => {
        this.piqueo = res
      })
    )



  }

  createForm() {
    this.ticketForm = this.fb.group({
      dni: [''],
      name: [''],
      phone: ['']
    })
    this.billForm = this.fb.group({
      ruc: ['', Validators.required],
      businessName: ['', Validators.required],
      address: ['', Validators.required],
      phone: ['', Validators.required]
    })
  }

  showRucCustomer(user): string | undefined {
    return user ? user['ruc'] : undefined;
  }

  showDniCustomer(user): string | undefined {
    return user ? user['dni'] : undefined;
  }

  showNameCustomer(user): string | undefined {
    return user ? user['name'] : undefined;
  }

  showBusinessNameCustomer(user): string | undefined {
    return user ? user['businessName'] : undefined;
  }

  chooseCustomer() {
    if (this.ticketForm.get('dni').value || this.ticketForm.get('name').value) {
      let customer = this.ticketForm.get('dni').value ? this.ticketForm.get('dni').value : this.ticketForm.get('name').value
      this.ticketForm.get('dni').setValue(customer)
      this.ticketForm.get('name').setValue(customer)
      this.ticketForm.get('phone').setValue(customer.phone)
      if (customer['receivableAccount']) {
        this.showReceivable = true
        this.receivableAccount = customer['receivableAccount']
      } else {
        this.showReceivable = false
      }

    }

    if (this.billForm.get('ruc').value || this.billForm.get('businessName').value) {
      let customer = this.billForm.get('ruc').value ? this.billForm.get('ruc').value : this.billForm.get('businessName').value
      this.billForm.get('ruc').setValue(customer)
      this.billForm.get('businessName').setValue(customer)
      this.billForm.get('phone').setValue(customer.businessPhone)
      this.billForm.get('address').setValue(customer.businessAddress)
      if (customer['receivableAccount']) {
        this.receivableAccount = customer['receivableAccount']
        this.showReceivable = true
      } else {
        this.showReceivable = false
      }
    }

  }

  changetoBill() {
    this.billView = true
    this.ticketView = false
    this.checketView = false
    this.showReceivable = false
    this.ticketForm.reset('')
  }

  cancelOrder() {

    this.order.forEach((el, i) => {
      this.deleteDish(i, true)
    })

    this.entry = []
    this.soup = []
    this.second = []
    this.dessert = []
    this.MenuList = false;
    this.otherList = false
    this.categoriesList = true
    this.generateSale = false
    this.order = []
    this.total = 0
    this.ticketForm.reset()
    this.billForm.reset()
    this.pay.reset()
    this.showReceivable = false
    this.receivable = false
  }

  goToCategories() {
    this.entry = []
    this.soup = []
    this.second = []
    this.dessert = []
    this.MenuList = false
    this.categoriesList = true
    this.selectablePlate = null
  }

  selectPlate(plate, i) {
    if (!this.generateSale && plate['type']) {

      this.selectablePlate = plate
      this.selectIndex = i
      this.selectMenu = plate['type']
      this.MenuList = true
      this.otherList = false

      this.categoriesList = false
      let plates = this.plates.filter(el => el['menuType'] == plate['type'])
      this.entry = plates.filter(el => el['type'] == 'ENTRADA')
      this.soup = plates.filter(el => el['type'] == 'SOPA')
      this.second = plates.filter(el => el['type'] == 'FONDO')
      this.dessert = plates.filter(el => el['type'] == 'POSTRE')
    }
  }


  firstOrder(type: string, price: number, name: string) {
    let plates = this.plates.filter(el => el['menuType'] == type)
    this.entry = plates.filter(el => el['type'] == 'ENTRADA')
    this.soup = plates.filter(el => el['type'] == 'SOPA')
    this.second = plates.filter(el => el['type'] == 'FONDO')

    this.dessert = plates.filter(el => el['type'] == 'POSTRE')
    this.selectMenu = type
    let selectEntry = plates.filter(el => el['type'] == 'ENTRADA' || el['type'] == 'SOPA').map(el => el['sold'])
    let selectSecond = this.second.map(el => el['sold'])
    let selectDessert = this.dessert.map(el => el['sold'])


    let newDish = {
      type: type,
      price: price,
      name: name,
      appetizer: type != 'second' ? plates.filter(el => el['sold'] == Math.max(...selectEntry) && el['type'] == 'ENTRADA')[0] : '',
      mainDish: plates.filter(el => el['sold'] == Math.min(...selectSecond) && el['type'] == 'FONDO')[0],
      dessert: type == 'executive' ? plates.filter(el => el['sold'] == Math.max(...selectDessert) && el['type'] == 'POSTRE')[0] : '',
      amount: 1
    }

    if (plates.length) {
      this.order.push(newDish)
    }

    this.selectablePlate = newDish
    this.selectIndex = this.order.length - 1
    this.total = this.order.map(el => el['price'] * el['amount']).reduce((a, b) => a + b, 0);

    if (type == 'executive') {
      this.changeDishStok(newDish['appetizer'], 'aum')
      this.changeDishStok(newDish['mainDish'], 'aum')
      this.changeDishStok(newDish['dessert'], 'aum')
    } else if (type == 'simple') {
      this.changeDishStok(newDish['appetizer'], 'aum')
      this.changeDishStok(newDish['mainDish'], 'aum')
    } else {
      this.changeDishStok(newDish['mainDish'], 'aum')
    }
  }


  deleteDish(index, all) {
    if (index !== -1) {
      let dish = this.order[index]
      if (!all) {
        this.order.splice(index, 1);
        this.total = this.order.map(el => el['price'] * el['amount']).reduce((a, b) => a + b, 0);
      }

      if (this.selectMenu == dish['type']) {
        this.entry = []
        this.soup = []
        this.dessert = []
        this.second = []
      }

      if (dish['type']) {

        switch (dish['type'].toLowerCase()) {
          case 'otros':
            this.others.filter(el => el['id'] == dish['id'])[0]['stock'] += dish['amount']
            break;
          case 'postres':
            this.othersDesserts.filter(el => el['id'] == dish['id'])[0]['stock'] += dish['amount']
            break;
          case 'executive':
            this.changeDishStok(dish['appetizer'], 'dis')
            this.changeDishStok(dish['mainDish'], 'dis')
            this.changeDishStok(dish['dessert'], 'dis')
            break;
          case 'simple':
            this.changeDishStok(dish['appetizer'], 'dis')
            this.changeDishStok(dish['mainDish'], 'dis')
            break;
          case 'second':
            this.changeDishStok(dish['mainDish'], 'dis')
            break;
          default:
            break;
        }

      } else {
        switch (dish['category'].toLowerCase()) {
          case 'extras':
            this.extras.filter(el => el['id'] == dish['id'])[0]['stock'] += dish['amount']
            break;
          case 'combos':
            this.combos.filter(el => el['id'] == dish['id'])[0]['stock'] += dish['amount']
            break;
          case 'offers':
            this.offers.filter(el => el['id'] == dish['id'])[0]['stock'] += dish['amount']
            break;
          case 'bebidas':
            this.bebidas.filter(el => el['id'] == dish['id'])[0]['stock'] += dish['amount']
            break;
          case 'piqueo':
            this.piqueo.filter(el => el['id'] == dish['id'])[0]['stock'] += dish['amount']
            break;
          default:
            break;
        }

      }
    }
  }

  deleteSubDish(index, type) {

    if (index !== -1) {
      let dish = this.order[index]

      let subDish = this.order[index][type]
      this.changeDishStok(subDish, 'dis')
      this.order[index][type] = ''
      if (!dish['appetizer'] && !dish['mainDish'] && !dish['dessert']) {
        this.deleteDish(index, false)
      }
    }

  }

  changeDishStok(plate, change) {
    if (change == 'aum') {
      this.plates = this.plates.map(el => {
        if (el['id'] == plate['id']) {
          el['sold']++
        }
        return el
      })
    } else {
      this.plates = this.plates.map(el => {
        if (el['id'] == plate['id']) {
          el['sold']--
        }
        return el
      })
    }
  }

  selectedDish(plate) {
    if (this.selectablePlate) {
      let i = this.order.findIndex(el => el == this.selectablePlate)
      let typePlate = ''
      switch (plate['type']) {
        case 'ENTRADA': {
          typePlate = 'appetizer'
          if (this.order[i][typePlate] != plate) {
            this.plates.filter(el => el['id'] == this.order[i][typePlate]['id'])[0]['sold']--
            this.changeDishStok(plate, 'aum')
            this.order[i][typePlate] = plate
          }

          break;
        }
        case 'SOPA': {
          typePlate = 'appetizer'
          if (this.order[i][typePlate] != plate) {
            this.plates.filter(el => el['id'] == this.order[i][typePlate]['id'])[0]['sold']--
            this.changeDishStok(plate, 'aum')
            this.order[i][typePlate] = plate
          }

          break;
        }
        case 'FONDO': {
          typePlate = 'mainDish'
          if (this.order[i][typePlate] != plate) {
            this.plates.filter(el => el['id'] == this.order[i][typePlate]['id'])[0]['sold']--
            this.plates.filter(el => el['id'] == plate['id'])[0]['sold']++
            this.order[i][typePlate] = plate
          }
          break;
        }
        case 'POSTRE': {
          typePlate = 'dessert'
          if (this.order[i][typePlate] != plate) {
            this.plates.filter(el => el['id'] == this.order[i][typePlate]['id'])[0]['sold']--
            this.plates.filter(el => el['id'] == plate['id'])[0]['sold']++
            this.order[i][typePlate] = plate
          }
          break;
        }
        default: {
          //statements; 
          break;
        }
      }


    }
  }

  addOrder(other) {
    let newDish = {
      ...other,
      amount: 1
    }
    let compare = this.order.map(el => el['name'])
    if (compare.includes(other['name'])) {
      let i = compare.indexOf(other['name'])
      this.order[i]['amount']++
    } else {
      this.order.push(newDish)

    }
    this.total = this.order.map(el => el['price'] * el['amount']).reduce((a, b) => a + b, 0);
    other['stock']--
  }


  printVoucher() {
    let customerId = ''
    if (this.billView) {
      if (this.billForm.get('businessName').value['id']) {
        customerId = this.billForm.get('businessName').value['id']
      } else {
        customerId = this.billForm.value
      }
    } else {
      if (this.ticketForm.get('name').value) {
        if (this.ticketForm.get('name').value['id']) {
          customerId = this.ticketForm.get('name').value['id']
        } else {
          customerId = this.ticketForm.value
        }
      }
    }

    let payOrder: Order = {
      id: '',
      orderCorrelative: ("0000" + this.number).slice(-5),
      orderList: this.order,
      orderStatus: 'SELECCIONADO',
      price: 0,
      discount: 0,
      igv: 0,
      total: this.total,
      paymentType: this.cashView ? 'EFECTIVO' : this.visaView ? 'VISA' : 'MASTERCARD', // EFECTIVO, VISA, MASTERCARD
      amountReceived: this.pay.value,
      amountChange: this.change,
      documentType: this.billView ? 'FACTURA' : this.ticketView ? 'BOLETA' : 'TICKET', // FACTURA, BOLETA, TICKET
      documentSerial: this.billView ? 'FE001' : this.ticketView ? 'BE001' : 'T001', // FE001 ...
      documentCorrelative: this.documentCorrelative[this.selectedPay], // 0000124 ...
      customerId: customerId,
      cashId: this.currentCash['id'],
      openingId: this.currentCash['currentOpeningId'],
      canceledAt: null,
      canceledBy: null,
      createdAt: null,
      createdBy: null,
      editedAt: null,
      editedBy: null
    }


    this.dialog.open(VoucherComponent, {
      data: {
        ...payOrder,
        receivable: this.receivable,
        account: this.receivable ? this.receivableAccount : ''
      }
    })


  }

}
