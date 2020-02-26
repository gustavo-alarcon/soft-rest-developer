import { Order } from './models/sales/menu/order.model';
import { Meal } from './models/sales/menu/meal.model';
import { Injectable } from '@angular/core';
import { Observable, of, forkJoin, combineLatest } from 'rxjs';
import { Customer } from './models/third-parties/customer.model';
import { AngularFirestoreCollection, AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';

import { shareReplay, tap, startWith } from 'rxjs/operators';
import { Provider } from './models/third-parties/provider.model';
import { Payable, PayableLimited, ItemModel } from './models/admin/payable.model';
import { Cash } from './models/sales/cash/cash.model';
import { User } from './models/general/user.model';

import { KitchenInput } from 'src/app/core/models/warehouse/kitchenInput.model'
import { AuthService } from './auth.service';
import { take, map } from 'rxjs/operators';
import { CostTrend } from './models/warehouse/costTrend.model';
import { Input } from './models/warehouse/input.model';
import { Household } from './models/warehouse/household.model';
import { Grocery } from './models/warehouse/grocery.model';
import { Dessert } from './models/warehouse/desserts.model';
import { Kardex } from './models/warehouse/kardex.model';
import { Recipe } from './models/kitchen/recipe.model';
import * as jsPDF from 'jspdf';
import { Promo } from './models/sales/menu/promo.model';
import { Combo, elementCombo, recipeCombo, productCombo } from './models/sales/menu/combo.model';
import { Role } from './models/general/role.model';
import { ReceivableUser } from './models/admin/receivableUser.model';

import { saveAs } from 'file-saver';
import { Menu } from './models/sales/menu/menu.model';
import { FormControl } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  /**
   * GENERAL VARIABLES
   */

  usersCollection: AngularFirestoreCollection<User>;
  users$: Observable<User[]>;

  /**
   * THIRD PARTIES VARIBLES
   */

  customersCollection: AngularFirestoreCollection<Customer>;
  customers$: Observable<Customer[]>;

  providersCollection: AngularFirestoreCollection<Provider>;
  providers$: Observable<Provider[]>;

  /**
   * ADMINISTRATIVE VARIABLES
   */

  payablesCollection: AngularFirestoreCollection<Payable>;
  payables$: Observable<Payable[]>;

  cashesCollection: AngularFirestoreCollection<Cash>;
  cashes$: Observable<Cash[]>;

  /**
   * WAREHOUSE VARIABLES
   */

  purchasesCollection: AngularFirestoreCollection<Payable>;
  purchases$: Observable<Payable[]>;

  inputsCollection: AngularFirestoreCollection<Input>;
  inputs$: Observable<Input[]>;

  householdsCollection: AngularFirestoreCollection<Household>;
  households$: Observable<Household[]>;

  groceriesCollection: AngularFirestoreCollection<Grocery>;
  groceries$: Observable<Grocery[]>;

  dessertsCollection: AngularFirestoreCollection<Dessert>;
  desserts$: Observable<Dessert[]>;

  items$: Observable<(any)[]>;

  kardexCollection: AngularFirestoreCollection<Kardex>;
  kardex$: Observable<Kardex[]>;

  /**
  * SALES VARIABLES
  */
  othersCollection: AngularFirestoreCollection<Grocery>;
  others$: Observable<Grocery[]>;

  dishesCollection: AngularFirestoreCollection<Meal>;
  dishes$: Observable<Meal[]>;

  ordersCollection: AngularFirestoreCollection<Order>;
  orders$: Observable<Order[]>;


  // -------------------------- USERS --------------------------------------
  public permitsCollection: AngularFirestoreCollection<Role>;
  constructor(
    public af: AngularFirestore,
    private auth: AuthService
  ) {
    //SYSTEM
    this.getPermits();
    this.getUsers();
    this.getCustomers();

  }


  //PErmits
  permitsList$: Observable<Role[]>;



  // *************** USERS
  addUser(data): Promise<any> {
    return this.usersCollection.doc(data['uid']).set(data);
  }

  getPermits(): void {
    this.permitsCollection = this.af.collection<Role>(`/db/deliciasTete/roles`, ref => ref.orderBy('createdAt', 'asc'));
    this.permitsList$ =
      this.permitsCollection.valueChanges()
        .pipe(
          map(res => {
            res.forEach((element, index) => {
              element['index'] = index;
            })
            return res;
          }),
          shareReplay(1)
        );
  }

  /********** GENERAL METHODS *********************** */

  getUsers(): Observable<User[]> {
    this.usersCollection = this.af.collection('users', ref => ref.orderBy('displayName', 'desc'));
    this.users$ = this.usersCollection.valueChanges().pipe(shareReplay(1));
    return this.users$;
  }

  getCurrentMonthOfViewDate(): { from: Date, to: Date } {
    const date = new Date();
    const fromMonth = date.getMonth();
    const fromYear = date.getFullYear();

    const actualFromDate = new Date(fromYear, fromMonth, 1);

    const toMonth = (fromMonth + 1) % 12;
    let toYear = fromYear;

    if (fromMonth + 1 >= 12) {
      toYear++;
    }

    const toDate = new Date(toYear, toMonth, 1);

    return { from: actualFromDate, to: toDate };
  }

  /********* THIRD PARTIES METHODS ****************** */

  getCustomers(): Observable<Customer[]> {
    this.customersCollection = this.af.collection('db/deliciasTete/thirdPartiesCustomers', ref => ref.orderBy('createdAt', 'desc'));
    this.customers$ = this.customersCollection.valueChanges().pipe(shareReplay(1));
    return this.customers$;
  }

  getProviders(): Observable<Provider[]> {
    this.providersCollection = this.af.collection('db/deliciasTete/thirdPartiesProviders', ref => ref.orderBy('createdAt', 'desc'));
    this.providers$ = this.providersCollection.valueChanges().pipe(shareReplay(1));
    return this.providers$;
  }


  /********** ADMINISTRATIVE METHODS ***************** */

  getPayables(): Observable<Payable[]> {
    this.payablesCollection = this.af.collection('db/deliciasTete/accountsPayable', ref => ref.where('status', '==', 'PENDIENTE'));
    this.payables$ =
      this.payablesCollection.valueChanges()
        .pipe(
          map(res => {
            return res.sort((a, b) => b.documentDate.valueOf() - a.documentDate.valueOf());
          }),
          shareReplay(1));
    return this.payables$;
  }

  getCashes(): Observable<Cash[]> {
    this.cashesCollection = this.af.collection('db/deliciasTete/cashRegisters', ref => ref.orderBy('createdAt', 'desc'));
    this.cashes$ = this.cashesCollection.valueChanges().pipe(shareReplay(1));
    return this.cashes$;
  }

  /************ WAREHOUSE METHODS ********* */

  //Warehouse-Stocktaking
  onGetUnits(): Observable<{ id: string, unit: string }[]> {
    return this.af.collection<{ id: string, unit: string }>(`/db/deliciasTete/kitchenUnits`).valueChanges()
  }

  onGetInputs(): Observable<Input[]> {
    return this.af.collection<Input>(`/db/deliciasTete/warehouseInputs/`).valueChanges()
  }

  //To get available elements
  onGetElements(types: string): Observable<KitchenInput[]> {
    let typ: string;

    typ = this.getWarehouseType(types);

    return this.af.collection<KitchenInput>(`/db/deliciasTete/${typ}/`).valueChanges()
  }

  //To add a new element. We should change it to onAddInput
  onAddInput(input: any, types: string, newUnit?: { id: string, unit: string }): Observable<firebase.firestore.WriteBatch> {
    let batch = this.af.firestore.batch();
    let date = new Date()
    let typ: string;

    let inputData: any = {
      id: null,
      name: input['name'],
      description: input['description'],
      sku: input['sku'],
      unit: newUnit == undefined ? input['unit'] : newUnit.unit,
      stock: input['stock'],
      emergencyStock: input['emergencyStock'],
      picture: '',
      status: 'ACTIVO',
      createdAt: new Date(),
      createdBy: null,
      editedAt: null,
      editedBy: null
    }

    switch (types) {
      case 'INSUMOS':
        typ = 'warehouseInputs';
        inputData['averageCost'] = input['cost'];
        break;
      case 'MENAJES':
        typ = 'warehouseHousehold';
        inputData['averageCost'] = input['cost'];
        break;
      case 'OTROS':
        typ = 'warehouseGrocery';
        inputData['averageCost'] = input['cost'];
        inputData['price'] = input['price'];
        break;
      case 'POSTRES':
        typ = 'warehouseDesserts';
        inputData['averageCost'] = input['cost'];
        inputData['price'] = input['price'];
        break;

    }


    //Input
    let inputRef: DocumentReference = this.af.firestore.collection(`/db/deliciasTete/${typ}/`).doc();

    //KitchenUnits
    let kitchenUnitsRef: DocumentReference = this.af.firestore.collection(`/db/deliciasTete/kitchenUnits/`).doc();
    let kitchenUnitsData = {
      unit: input['unit'],
      id: kitchenUnitsRef.id
    }

    //CostTrend
    let costTrendRef: DocumentReference = this.af.firestore
      .collection(`/db/deliciasTete/${typ}/${inputRef.id}/costTrend`).doc();
    let costTrendData: CostTrend = {
      cost: input['cost'],
      createdAt: date,
      id: costTrendRef.id
    }

    batch.set(costTrendRef, costTrendData);

    return this.auth.user$.pipe(
      take(1),
      map(user => {

        inputData['createdBy'] = user;

        batch.set(inputRef, inputData);

        //if it doesn't have Id, this unit doesnt exist, so we create it
        if (newUnit == undefined) {
          batch.set(kitchenUnitsRef, kitchenUnitsData)
        }

        return batch;
      })
    )
  }


  onAddPurchase(payableDoc: PayableLimited, itemsList: Array<ItemModel>):
    Observable<firebase.firestore.WriteBatch> {

    //Payable
    let payableRef: DocumentReference = this.af.firestore.collection(`/db/deliciasTete/accountsPayable`).doc();
    let payableData: Payable;
    let batch = this.af.firestore.batch()

    //costTrend and item
    let costTrendRef: DocumentReference;
    let costTrendData: CostTrend
    let itemRef: DocumentReference;
    let typ: string;

    //Kardex
    let kardexRef: DocumentReference;
    let kardexData: Kardex;

    let date = new Date();

    return this.auth.user$.pipe(
      take(1),
      map(user => {
        //payableData
        payableData = {
          ...payableDoc,
          id: payableRef.id,
          createdAt: date,
          createdBy: user,
          editedAt: null,
          editedBy: null,
          approvedAt: null,
          approvedBy: null
        }

        payableData.payments[0].paidBy = user;
        payableData.payments[0].paidAt = date;

        //

        //Cost trends
        itemsList.forEach((item: ItemModel, index) => {
          
            typ = this.getWarehouseType(item.type);

            itemRef = this.af.firestore.collection(`/db/deliciasTete/${typ}`).doc(item.id);

            costTrendRef = this.af.firestore.collection(`/db/deliciasTete/${typ}/${item.id}/costTrend`).doc();
            costTrendData = {
              cost: Math.round(item.averageCost*100.0)/100.0,
              id: costTrendRef.id,
              createdAt: date
            };

            kardexRef = this.af.firestore.collection(`/db/deliciasTete/${typ}/${item.id}/kardex`).doc();
            kardexData = {
              id: kardexRef.id,
              details: 'Compra: '+payableData.documentType +" "+payableData.documentSerial + "-"+payableData.documentCorrelative+". " +payableData.provider.name,
              insQuantity: item.quantity,
              insPrice: costTrendData.cost,
              insTotal: Math.round(costTrendData.cost * item.quantity * 100.0) / 100.0,
              outsQuantity: 0.00,
              outsPrice: 0.00,
              outsTotal: 0.00,
              balanceQuantity: 0.00,
              balancePrice: 0.00,
              balanceTotal: 0.00,
              type: 'ENTRADA', /**@ ENTRADA, SALIDA, INICIAL, REINICIO, ANULADO */
              createdAt: date,
              createdBy: user,
            }

            payableData.itemsList[index].kardexId = kardexRef.id;
            payableData.itemsList[index].costTrendId = costTrendRef.id;

            payableData.itemsList[index].item = payableData.itemsList[index].item['name'];

            batch.update(itemRef, { 
              averageCost: costTrendData.cost,
              stock: firebase.firestore.FieldValue.increment(item.quantity),
              editedAt: date,
              editedBy: user
             });

            batch.set(costTrendRef, costTrendData);
            batch.set(kardexRef, kardexData);

          })

          //updating payable data
          batch.set(payableRef, payableData);

        return batch;
      }))
  }

  onDeletePurchase(payableDoc: Payable): Observable<firebase.firestore.WriteBatch> {
    console.log(payableDoc);
    let payableTemp: Payable = {...payableDoc}

    //Payable
    let payableRef: DocumentReference = this.af.firestore.collection(`/db/deliciasTete/accountsPayable`).doc(payableDoc.id);
    let batch = this.af.firestore.batch()

    //costTrend and item
    let costTrendRef: DocumentReference;
    let itemRef: DocumentReference;
    let typ: string;

    //Kardex
    let kardexRef: DocumentReference;

    let date = new Date();

    return this.auth.user$.pipe(
      take(1),
      map((user) => {
        //payableData

        //

        //Cost trends
        payableTemp.itemsList.forEach(async(item: ItemModel, index) => {
          
            switch (item.type) {
              case 'Insumos':
                typ = 'warehouseInputs';
                break;
              case 'Otros':
                typ = 'warehouseGrocery';
                break;
              case 'Postres':
                typ = 'warehouseDesserts';
                break;
              case 'Menajes':
                typ = 'warehouseHousehold';
                break;
            }

            itemRef = this.af.firestore.collection(`/db/deliciasTete/${typ}`).doc(item.id);

            costTrendRef = this.af.firestore.collection(`/db/deliciasTete/${typ}/${item.id}/costTrend`).doc(item.costTrendId);

            kardexRef = this.af.firestore.collection(`/db/deliciasTete/${typ}/${item.id}/kardex`).doc(item.kardexId);

            //item
            batch.update(itemRef, { 
              /*averageCost: await this.af.collection<CostTrend>(`/db/deliciasTete/${typ}/${item.id}/costTrend`, ref => ref.orderBy('createdAt')).valueChanges()
                            .pipe(take(1), map(res => 
                              {res.find(el => el.id != item.costTrendId).cost;
                                console.log('now!!');
                              }
                              
                            )).toPromise(),*/
              stock: firebase.firestore.FieldValue.increment(item.quantity*(-1)),
              editedAt: date,
              editedBy: user
             });

            //costTrend
            batch.delete(costTrendRef);

            //kardex
            batch.update(kardexRef, {
              type: 'ANULADO'
            });

          })

          //updating payable data
          batch.set(payableRef, {
            editedAt: date,
            editedBy: user,
            status: 'ANULADO'
          });

        return batch;
      }))
  }

  repPurchaseValidator(docType: string, serie: string, corr: number, provider: Provider) {
    return this.af.collection<Payable>(`/db/deliciasTete/accountsPayable`, ref => ref.where('documentDetails.provider.id', "==", provider.id)).valueChanges()
      .pipe(map((purchase) => {
        if (!purchase.length) {
          return null
        }
        else {
          if (purchase.find(el => (el.documentCorrelative == Number(corr) && el.documentSerial == serie && el.documentType == docType))
            == undefined) {
            return null
          }
          else {
            return { repeatedPurchase: true }
          }
        }

      }))
  }

  //Warehouse purchases
  onGetPurchases(startDate: Date, endDate: Date): Observable<Payable[]> {
    this.purchasesCollection = this.af.collection<Payable>(`/db/deliciasTete/accountsPayable`, ref => ref.where('documentDate', '>=', startDate).where('documentDate', '<=', endDate).orderBy('documentDate', 'desc'))
    this.purchases$ = this.purchasesCollection.valueChanges().pipe(shareReplay(1));
    return this.purchases$
  }

  //Kitchen
  onGetKitchenOrders() {
    return this.af.collection(`/db/deliciasTete/kitchenOrders`, ref => ref.orderBy('createdAt','desc')).valueChanges().pipe(shareReplay(1))
  }

  onGetRecipes(): Observable<Recipe[]> {
    return this.af.collection<Recipe>(`/db/deliciasTete/kitchenRecipes`, ref => ref.orderBy('name')).valueChanges();
  }

  onGetRecipesType(category: string): Observable<Recipe[]> {
    console.log(category);
    return this.af.collection<Recipe>(`/db/deliciasTete/kitchenRecipes`, ref => ref.where('category', '==', category)).valueChanges()
  }


  onUploadRecipe(recipe: Recipe): Observable<firebase.firestore.WriteBatch> {
    let recipeRef = this.af.firestore.collection(`/db/deliciasTete/kitchenRecipes`).doc();
    let recipeData = recipe;
    let date = new Date();
    let batch = this.af.firestore.batch();

    return this.auth.user$.pipe(take(1), map((user) => {
      recipeData.createdAt = date;
      recipeData.createdBy = user;
      recipeData.id = recipeRef.id;
      batch.set(recipeRef, recipeData);
      return batch;
    }));
  }

  onEditRecipe(recipe: Recipe): Observable<firebase.firestore.WriteBatch> {
    let recipeRef = this.af.firestore.collection(`/db/deliciasTete/kitchenRecipes`).doc(recipe.id);
    let recipeData = recipe;
    let date = new Date();
    let batch = this.af.firestore.batch();

    return this.auth.user$.pipe(take(1), map((user) => {
      recipeData.editedAt = date;
      recipeData.editedBy = user;
      console.log(recipeData);
      batch.update(recipeRef, recipeData);
      return batch;
    }));
  }

  onDeleteRecipe(recipe: Recipe): firebase.firestore.WriteBatch {
    let recipeRef = this.af.firestore.collection(`/db/deliciasTete/kitchenRecipes`).doc(recipe.id);
    let batch = this.af.firestore.batch();

    batch.delete(recipeRef);
    return batch;
  }


  // onGetRecipe(recipe: Recipe): Observable<firebase.firestore.WriteBatch>{}


  getItems(type: string): Observable<(any)[]> {
    switch (type) {
      case 'INSUMOS':
        this.inputsCollection = this.af.collection(`db/deliciasTete/warehouseInputs`, ref => ref.orderBy('createdAt', 'desc'));
        this.items$ = this.inputsCollection.valueChanges().pipe(shareReplay(1));
        return this.items$;
        break;

      case 'INVENTARIO':
        this.householdsCollection = this.af.collection(`db/deliciasTete/warehouseHousehold`, ref => ref.orderBy('createdAt', 'desc'));
        this.items$ = this.householdsCollection.valueChanges().pipe(shareReplay(1));
        return this.items$;
        break;

      case 'POSTRES':
        this.dessertsCollection = this.af.collection(`db/deliciasTete/warehouseDesserts`, ref => ref.orderBy('createdAt', 'desc'));
        this.items$ = this.dessertsCollection.valueChanges().pipe(shareReplay(1));
        return this.items$;
        break;

      case 'OTROS':
        this.groceriesCollection = this.af.collection(`db/deliciasTete/warehouseGrocery`, ref => ref.orderBy('createdAt', 'desc'));
        this.items$ = this.groceriesCollection.valueChanges().pipe(shareReplay(1));
        return this.items$;
        break;

      default:
        console.log('Sin resultados');
        break;
    }
  }

  getKardex(from: Date, to: Date, type: string, id: string): Observable<Kardex[]> {

    let typ;

    switch (type) {
      case 'INSUMOS':
        typ = 'warehouseInputs';
        break;
      case 'INVENTARIO':
        typ = 'warehouseHousehold';
        break;
      case 'OTROS':
        typ = 'warehouseGrocery';
        break;
      case 'POSTRES':
        typ = 'warehouseDesserts';
        break;
    }

    this.kardexCollection = this.af.collection(`db/deliciasTete/${typ}/${id}/kardex`, ref => ref.where('createdAt', '>=', from).where('createdAt', '<=', to));
    this.kardex$ =
      this.kardexCollection.valueChanges()
        .pipe(
          map(res => {
            return res.sort((a, b) => b.createdAt.valueOf() - a.createdAt.valueOf());
          }),
          shareReplay(1)
        );

    return this.kardex$;
  }

  /************ SALES METHODS ********* */

  onGetOthers(): Observable<Grocery[]> {
    this.othersCollection = this.af.collection('db/deliciasTete/warehouseGrocery', ref => ref.orderBy('createdAt', 'desc'));
    this.others$ = this.othersCollection.valueChanges().pipe(shareReplay(1));
    return this.others$;
  }

  onGetDishes() {
    this.dishesCollection = this.af.collection('db/deliciasTete/kitchenDishes', ref => ref.orderBy('createdAt', 'desc'));
    this.dishes$ = this.dishesCollection.valueChanges().pipe(shareReplay(1));
    return this.dishes$;
  }

  getOrders() {
    this.ordersCollection = this.af.collection('db/deliciasTete/orders', ref => ref.orderBy('createdAt', 'desc'));
    this.orders$ = this.ordersCollection.valueChanges().pipe(shareReplay(1));
    return this.orders$;
  }

  onGetOrders(from: Date, to: Date): Observable<Order[]> {
    this.ordersCollection = this.af.collection('db/deliciasTete/orders', ref => ref.where('createdAt', '>=', from).where('createdAt', '<=', to));
    this.orders$ =
      this.ordersCollection.valueChanges()
        .pipe(
          map(res => {
            return res.sort((a, b) => b.createdAt.valueOf() - a.createdAt.valueOf());
          }),
          shareReplay(1)
        );
    return this.orders$;
  }

  getOpenCash(cash) {
    let openingCollection = this.af.collection('db/deliciasTete/cashRegisters/' + cash + '/openings', ref => ref.orderBy('openedAt', 'desc'));
    return openingCollection.valueChanges().pipe(shareReplay(1));
  }

  getTransactions(cashId, openingId) {
    let transactionsCollection = this.af.collection('db/deliciasTete/cashRegisters/' + cashId + '/openings/' + openingId + '/transactions', ref => ref.orderBy('createdAt', 'desc'));
    return transactionsCollection.valueChanges().pipe(shareReplay(1));
  }

  printCash(cash, income, expenses) {
    var doc = new jsPDF({
      unit: 'pt',
      orientation: 'l',
      format: 'A4'
    });

    //Imagen
    let actualDate = this.getDate();
    //Importando Plantilla
    let img = new Image()
    img.src = '../../assets/images/cashPDF.jpg';

    doc.addImage(img, 'JPEG', 0, 0, 841, 594);

    //Efectivo
    doc.setFontStyle("normal");
    doc.setFontSize(18),
      doc.text("S/. " + cash[0]['amount'].toFixed(2), 268, 244, {
        align: "right",
        baseline: "bottom"
      });

    doc.text("S/. " + cash[1]['amount'].toFixed(2), 268, 280, {
      align: "right",
      baseline: "bottom"
    });

    doc.text("S/. " + cash[2]['amount'].toFixed(2), 268, 314, {
      align: "right",
      baseline: "bottom"
    });

    doc.text("S/. " +
      (cash[0]['amount'] * cash[0]['value'] +
        cash[1]['amount'] * cash[1]['value'] +
        cash[2]['amount'] * cash[2]['value']).toFixed(2)
      , 268, 363, {
      align: "right",
      baseline: "bottom"
    });

    //Ingresos por TIpo
    doc.setFontSize(18),
      doc.text("S/. " + income[0]['amount'].toFixed(2), 519, 244, {
        align: "right",
        baseline: "bottom"
      });

    doc.text("S/. " + income[1]['amount'].toFixed(2), 519, 280, {
      align: "right",
      baseline: "bottom"
    });

    doc.text("S/. " + income[2]['amount'].toFixed(2), 519, 314, {
      align: "right",
      baseline: "bottom"
    });

    doc.text("S/. " +
      (income[0]['amount'] * income[0]['value'] +
        income[1]['amount'] * income[1]['value'] +
        income[2]['amount'] * income[2]['value']).toFixed(2)
      , 519, 363, {
      align: "right",
      baseline: "bottom"
    });

    // doc.text("S/. " + "TITULO".toUpperCase(), 519, 401, {
    //     align: "right",
    //     baseline: "bottom"
    //   });

    //Egresos por tipo
    doc.setFontSize(18),
      doc.text("S/. " + expenses[0]['amount'].toFixed(), 768, 244, {
        align: "right",
        baseline: "bottom"
      });

    doc.text("S/. " + expenses[1]['amount'].toFixed(), 768, 280, {
      align: "right",
      baseline: "bottom"
    });

    doc.text("S/. " +
      (expenses[0]['amount'] * expenses[0]['value'] +
        expenses[1]['amount'] * expenses[1]['value']).toFixed(2)
      , 768, 327, {
      align: "right",
      baseline: "bottom"
    });

    //Footer
    doc.text(actualDate[2] + "/" + actualDate[1] + "/" + actualDate[0] + " " + actualDate[3] + ":" + actualDate[4], 676, 541, {
      align: "left",
      baseline: "bottom"
    });

    //window.open(doc.output('bloburl'), '_blank');

    //saveAs(doc.output('blob'));

    let blob = doc.output('blob');

    // doc.output('dataurlnewwindow');

    saveAs(blob);

    // console.log(navigator.userAgent);
    // if (window.navigator.msSaveOrOpenBlob) { //IE 11+
    //   console.log('IE 11');
    //   window.navigator.msSaveOrOpenBlob(blob, "my.pdf");
    // } else if (navigator.userAgent.match('FxiOS')) { //FF iOS
    //   alert("Cannot display on FF iOS");
    // } else if (navigator.userAgent.match('CriOS')) { //Chrome iOS
    //   console.log('chrome iOS');
    //   var reader = new FileReader();
    //   reader.onloadend = function () { window.open(String(reader.result));};
    //   reader.readAsDataURL(blob);
    // } else if (navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPhone/i)) { //Safari & Opera iOS
    //   console.log('Safari and Opera')
    //   var url = window.URL.createObjectURL(blob);
    //   window.location.href = url;
    // }
    // else{
    //   alert('desktop');
    //   saveAs(doc.output('blob'));
    // }


  }

  //Funcion para obtener valores de fechas
  getDate() {
    let date = new Date();
    let month = '' + (date.getMonth() + 1);
    let day = '' + date.getDate();
    let year = date.getFullYear();
    let hours = date.getHours();
    let minutes = '' + date.getMinutes();

    if (minutes.length < 2)
      minutes = '0' + minutes;
    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;

    return [year, month, day, hours, minutes]
  }

  //SE tiene que enviar contenido como en el ejemplo (titulo y content comentados). El numero máximo de columnas es 4,
  //pero se pueden incluir menos. El numero maximo de filas es 24
  printAnything4Column(titulo: Array<string>, content: Array<Array<string>>) {

    var doc = new jsPDF({
      unit: 'pt',
      format: 'A4'
    });



    // let titulo = [
    //   'titulo1', 'titulo2', 'titulo3', 'titulo4',
    // ]

    // let content = [
    //   ['Contenido11', 'Contenido12', 'Contenido13', 'Contenido14'],
    //   ['Contenido21', 'Contenido22', 'Contenido23', 'Contenido24'],
    //   ['Contenido11', 'Contenido12', 'Contenido13', 'Contenido14'],
    //   ['Contenido11', 'Contenido12', 'Contenido13', 'Contenido14']
    // ]

    //Title
    doc.setFontStyle("bold");
    doc.setFontSize(18),
      doc.text("Lista de insumos".toUpperCase(), 237 + 67, 59, {
        align: "center",
        baseline: "middle"
      });

    // Empty square
    doc.rect(67, 89, 474, 676);

    //Lines
    for (let i = 1; i < 24; i++) {
      doc.line(67, 89 + i * 28, 541, 89 + i * 28);
    }

    for (let i = 1; i < 4; i++) {
      doc.line(67 + 118.5 * i, 89, 67 + 118.5 * i, 89 + 676);
    }

    //Header
    doc.setFontStyle("bold");
    doc.setFontSize(12);
    for (let i = 0; i < 4; i++) {
      doc.text(titulo[i], 67 + 59.25 + 118.5 * i, 103, {
        align: "center",
        baseline: "middle"
      });
    }

    //Content
    let descriptionSliced = "ERROR";
    doc.setFontStyle("normal");
    doc.setFontSize(12);
    for (let j = 0; j < content.length; j++) {
      for (let i = 0; i < titulo.length; i++) {
        //Text delimiter
        for (let k = content[j][i].length; k > 0; k--) {
          if (doc.getTextWidth(content[j][i].slice(0, k)) < 116) {
            descriptionSliced = content[j][i].slice(0, k);
            k = 0;
            doc.text(descriptionSliced, 67 + 59.25 + 118.5 * i, 103 + 28 * (j + 1), {
              align: "center",
              baseline: "middle",
            });
          };
        };
      }
    }
    saveAs(doc.output('blob'));
    // doc.autoPrint({ variant: 'non-conform' });
    // doc.save(`Lista_de_insumos.pdf`);
  }

  calculateTotalTicketLength(elements: { quantity: number, description: string, vUnit: number, import: number,  element: Menu | Meal | Combo | Promo | Grocery}[]){
    let individualLength = 0;
    elements.forEach(el => {
      if(el.element.hasOwnProperty('type')){
        switch(el.element['type']){
          case 'executive':
            individualLength += 3;
            break;
          case 'simple':
            individualLength += 2;
            break;
          case 'second':
            individualLength++;
            break;
        }
      }
      else{
        if(el.element.hasOwnProperty('products')){
          el.element['products'].forEach(product => {
            individualLength++;
          })
        }
      }
    });
    individualLength += elements.length;

    return individualLength
  }

  cutTextTicket(doc: any, text: string): string{
    if (doc.getTextWidth(text) >= 175) {
      //Cut description
      let descriptionSliced = "ERROR";
      for (let j = text.length; j > 0; j--) {
        if (doc.getTextWidth(text.slice(0, j)) < 175) {
          descriptionSliced = text.slice(0, j);
          j = 0;
          return this.toTitleCase(descriptionSliced);
        };
      }
    }

    else {
      //Original description
      return this.toTitleCase(text);

    }

  }

  toTitleCase(str): string {
    return str.replace(
        /\w\S*/g,
        function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
  }

  printTicket(elements: { quantity: number, description: string, vUnit: number, import: number,  element: Menu | Meal | Combo | Promo | Grocery}[], ticketNumber: string) {
    console.log(elements);
    //Ejemplo: 
    // let elements = [{
    //   quantity: 2,
    //   description: 'ALMUERZO BASICO BASICOOOo',
    //   vUnit: 10.55,
    //   import: 20.39
    //   },{
    //   quantity: 1,
    //   description: 'Coca Cola 475 ml',
    //   vUnit: 3,
    //   import: 3
    //   }];

    // let ticketNumber = 'T001-000001';

    let total = elements.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.import;
    }, 0);

    var doc = new jsPDF({
      unit: 'pt',
      format: [414, 353 + 21 * (this.calculateTotalTicketLength(elements) - 1) ],
      orientation: 'p'
    });

    doc.setFontStyle("bold");
    doc.setFontSize(15),
      doc.text("TICKET", 207, 59, {
        align: "center",
        baseline: "middle"
      });

    doc.text(ticketNumber, 207, 82, {
      align: "center",
      baseline: "middle"
    });

    doc.text("DELICIAS TETE S.A.C. - 20603001304", 207, 122, {
      align: "center",
      baseline: "middle"
    });
    doc.setFontStyle('normal'),
      doc.text("Comedor SENATI", 207, 143, {
        align: "center",
        baseline: "middle"
      });

    doc.setFontSize(14),
      doc.line(22, 168, 392, 168);
    doc.setFontStyle('bold');

    doc.text("Cant.", 39, 188, {
      align: "left",
      baseline: "bottom"
    });

    doc.text("Descrip.", 138, 188, {
      align: "left",
      baseline: "bottom"
    });

    doc.text("V Unit.", 268, 188, {
      align: "left",
      baseline: "bottom"
    });

    doc.text("Importe.", 331, 188, {
      align: "left",
      baseline: "bottom"
    });

    doc.line(22, 196, 392, 196);

    //Inside elements
    doc.setFontStyle('normal');

    for (let i =0, aux = 0; i < this.calculateTotalTicketLength(elements); i++, aux++) {

      doc.setFontStyle('normal');
      doc.text(elements[aux].quantity.toFixed(2), 70, 228 + 21 * i, {
        align: "right",
        baseline: "bottom"
      });

      doc.setFontStyle('bold');

      //Cutting text
      doc.text(this.cutTextTicket(doc, elements[aux].description), 88, 228 + 21 * i, {
        align: "left",
        baseline: "bottom",
      });
      
      doc.setFontStyle('normal');
      doc.text(elements[aux].vUnit.toFixed(2), 309, 228 + 21 * i, {
        align: "right",
        baseline: "bottom"
      });

      doc.text(elements[aux].import.toFixed(2), 379, 228 + 21 * i, {
        align: "right",
        baseline: "bottom"
      });

      //entering components of each element
      if(elements[aux].element.hasOwnProperty('type')){
        i++
        doc.text("-"+this.cutTextTicket(doc, elements[aux].element['mainDish']['name']), 88, 228 + 21 * i, {
          align: "left",
          baseline: "bottom",
        });
        
        switch(elements[aux].element['type']){
          case 'executive':
            i++;
            doc.text("-"+this.cutTextTicket(doc, elements[aux].element['appetizer']['name']), 88, 228 + 21 * i, {
              align: "left",
              baseline: "bottom",
            });
            i++;
            doc.text("-"+this.cutTextTicket(doc, elements[aux].element['dessert']['name']), 88, 228 + 21 * i, {
              align: "left",
              baseline: "bottom",
            });
            break;
          case 'simple':
            i++;
            doc.text("-"+this.cutTextTicket(doc, elements[aux].element['appetizer']['name']), 88, 228 + 21 * i, {
              align: "left",
              baseline: "bottom",
            });
            break;
          case 'second':
            break;
        }
      }
      else{
        if(elements[aux].element.hasOwnProperty('products')){
          elements[aux].element['products'].forEach(product => {
            i++
            doc.text("-"+this.cutTextTicket(doc, product['product']['name']), 88, 228 + 21 * i, {
              align: "left",
              baseline: "bottom",
            });
          })
        }
      }
      //

      if (i == this.calculateTotalTicketLength(elements) - 1) {
        doc.setFontStyle('bold');
        doc.text('TOTAL', 70, 278 + 21 * i, {
          align: "right",
          baseline: "bottom"
        });

        doc.text("S/.", 207, 278 + 21 * i, {
          align: "center",
          baseline: "bottom"
        });


        doc.text(total.toFixed(2), 379, 278 + 21 * i, {
          align: "right",
          baseline: "bottom"
        });

        doc.setFontStyle('normal');
        doc.text("----- Gracias por su preferencia -----", 207, 323 + 21 * i, {
          align: "center",
          baseline: "bottom"
        });

      }
    }

    doc.autoPrint({ variant: 'non-conform' });
    //doc.save(`TICKET-${ticketNumber}.pdf`);
    saveAs(doc.output('blob'));

  }

  printTicket2(elements: { quantity: number, description: string, vUnit: number, import: number,  element: Menu | Meal | Combo | Promo | Grocery}[], ticketNumber: string) {
    //Ejemplo: 
    // let elements = [{
    //   quantity: 2,
    //   description: 'ALMUERZO BASICO BASICOOOo',
    //   vUnit: 10.55,
    //   import: 20.39
    //   },{
    //   quantity: 1,
    //   description: 'Coca Cola 475 ml',
    //   vUnit: 3,
    //   import: 3
    //   }];

    // let ticketNumber = 'T001-000001';

    let total = elements.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.import;
    }, 0);

    var doc = new jsPDF({
      unit: 'pt',
      format: [414, 353 + 21 * (elements.length - 1)],
      orientation: 'l'
    });

    doc.setFontStyle("bold");
    doc.setFontSize(15),
      doc.text("TICKET", 207, 59, {
        align: "center",
        baseline: "middle"
      });

    doc.text(ticketNumber, 207, 82, {
      align: "center",
      baseline: "middle"
    });

    doc.text("DELICIAS TETE S.A.C. - 20603001304", 207, 122, {
      align: "center",
      baseline: "middle"
    });
    doc.setFontStyle('normal'),
      doc.text("Comedor SENATI", 207, 143, {
        align: "center",
        baseline: "middle"
      });

    doc.setFontSize(14),
      doc.line(22, 168, 392, 168);
    doc.setFontStyle('bold');

    doc.text("Cant.", 39, 188, {
      align: "left",
      baseline: "bottom"
    });

    doc.text("Descrip.", 138, 188, {
      align: "left",
      baseline: "bottom"
    });

    doc.text("V Unit.", 268, 188, {
      align: "left",
      baseline: "bottom"
    });

    doc.text("Importe.", 331, 188, {
      align: "left",
      baseline: "bottom"
    });

    doc.line(22, 196, 392, 196);

    //Inside elements
    doc.setFontStyle('normal');

    for (let i = 0; i < elements.length; i++) {

      doc.setFontStyle('normal');
      doc.text(elements[i].quantity.toFixed(2), 70, 228 + 21 * i, {
        align: "right",
        baseline: "bottom"
      });

      doc.setFontStyle('bold');

      //Cutting text
      if (doc.getTextWidth(elements[i].description) >= 175) {
        //Cut description
        let descriptionSliced = "ERROR";
        for (let j = elements[i].description.length; j > 0; j--) {
          if (doc.getTextWidth(elements[i].description.slice(0, j)) < 175) {
            descriptionSliced = elements[i].description.slice(0, j);
            j = 0;
            doc.text(descriptionSliced, 88, 228 + 21 * i, {
              align: "left",
              baseline: "bottom",
            });
          };
        }
      }

      else {
        //Original description
        doc.text(elements[i].description, 88, 228 + 21 * i, {
          align: "left",
          baseline: "bottom",
        });

      }



      doc.setFontStyle('normal');
      doc.text(elements[i].vUnit.toFixed(2), 309, 228 + 21 * i, {
        align: "right",
        baseline: "bottom"
      });

      doc.text(elements[i].import.toFixed(2), 379, 228 + 21 * i, {
        align: "right",
        baseline: "bottom"
      });

      if (i == elements.length - 1) {
        doc.setFontStyle('bold');
        doc.text('TOTAL', 70, 278 + 21 * i, {
          align: "right",
          baseline: "bottom"
        });

        doc.text("S/.", 207, 278 + 21 * i, {
          align: "center",
          baseline: "bottom"
        });


        doc.text(total.toFixed(2), 379, 278 + 21 * i, {
          align: "right",
          baseline: "bottom"
        });

        doc.setFontStyle('normal');
        doc.text("----- Gracias por su preferencia -----", 207, 323 + 21 * i, {
          align: "center",
          baseline: "bottom"
        });

      }
    }

    doc.autoPrint({ variant: 'non-conform' });
    saveAs(doc.output('blob'));

  }

  //Offer

  calculateRecipeCost(recipe: Recipe): Observable<number>{
    let itemColl = this.af.collection<Input>(`/db/deliciasTete/warehouseInputs/`).valueChanges();
    let inputArray: Input[];

    return itemColl.pipe(take(1), map((inputList)=> {
      inputArray = inputList.filter(input => {
        if(!!recipe.inputs.find(inputFromRecipe => (inputFromRecipe.id == input.id))){
          return recipe.inputs.find(inputFromRecipe => (inputFromRecipe.id == input.id))
        }
      })
      return inputArray.reduce((acc, curr)=> {
        return acc + curr.averageCost*recipe.inputs.find(inputRecipe => inputRecipe.id == curr.id).quantity;
      },0 )
    }))
  }

  onGetProductType(type: string): Observable<Array<Grocery | Recipe | Dessert | Input | Household>> {
    switch (type.toUpperCase()) {
      case 'OTROS':
        return this.af.collection<Grocery>(`/db/deliciasTete/warehouseGrocery`).valueChanges();
        break;
      case 'POSTRES':
        return this.af.collection<Dessert>(`/db/deliciasTete/warehouseDesserts`).valueChanges();
        break;
      case 'PLATOS':
        return this.af.collection<Recipe>(`/db/deliciasTete/kitchenRecipes`).valueChanges();
        break;
      case 'INSUMOS':
        return this.af.collection<Input>(`/db/deliciasTete/warehouseInputs`).valueChanges();
        break;
      case 'INVENTARIO':
        return this.af.collection<Input>(`/db/deliciasTete/warehouseHousehold`).valueChanges();
        break;
    }
  }

  onCreateOffer(promo: Promo): Observable<firebase.firestore.WriteBatch> {
    let promoRef: DocumentReference = this.af.firestore.collection(`/db/deliciasTete/offers`).doc();
    let promoData: Promo = promo;
    let date = new Date();
    let batch = this.af.firestore.batch();

    return this.auth.user$.pipe(take(1),
      map(user => {
        promoData.createdAt = date;
        promoData.createdBy = user;
        promoData.id = promoRef.id;
        promoData.editedAt = null;
        promoData.editedBy = null;

        batch.set(promoRef, promoData);

        return batch;
      }))
  }

  onEditOffer(promo: Promo): Observable<firebase.firestore.WriteBatch> {
    let promoRef: DocumentReference = this.af.firestore.collection(`/db/deliciasTete/offers`).doc(promo.id);
    let promoData: Promo = {...promo};
    let date = new Date();
    let batch = this.af.firestore.batch();

    return this.auth.user$.pipe(take(1),
      map(user => {
        promoData.editedAt = date;
        promoData.editedBy = user;

        batch.set(promoRef, promoData);

        return batch;
      }))
  }

  onGetOffer(): Observable<Promo[]> {
    return this.af.collection<Promo>(`/db/deliciasTete/offers`).valueChanges().pipe(shareReplay(1));
  }

  changeOfferState(promo: Promo, newState: string): Observable<firebase.firestore.WriteBatch> {
    let promoRef: DocumentReference = this.af.firestore.collection(`/db/deliciasTete/offers`).doc(promo.id);
    let promoData: Promo = promo;
    let date = new Date();
    let batch = this.af.firestore.batch();

    return this.auth.user$.pipe(take(1),
      map(user => {
        promoData.editedAt = date;
        promoData.editedBy = user;
        promoData.state = newState == 'Activar' ? 'Publicado' : 'Inactivo';

        batch.update(promoRef, promoData);

        return batch;
      }))
  }

  onGetCombo(): Observable<Combo[]> {
    return this.af.collection<Combo>(`/db/deliciasTete/combos`).valueChanges().pipe(shareReplay(1));
  }


  onCreateCombo(combo: Combo): Observable<firebase.firestore.WriteBatch> {
    let comboRef: DocumentReference = this.af.firestore.collection(`/db/deliciasTete/combos`).doc();
    let comboData: Combo = {...combo};
    let date = new Date();
    let batch = this.af.firestore.batch();

    return this.auth.user$.pipe(take(1),
      map(user => {
        comboData.createdAt = date;
        comboData.createdBy = user;
        comboData.id = comboRef.id;
        comboData.editedAt = null;
        comboData.editedBy = null;

        batch.set(comboRef, comboData);

        return batch;
      }))
  }

  onEditCombo(combo: Combo): Observable<firebase.firestore.WriteBatch> {
    let comboRef: DocumentReference = this.af.firestore.collection(`/db/deliciasTete/combos`).doc(combo.id);
    let comboData: Combo = {...combo};
    let date = new Date();
    let batch = this.af.firestore.batch();

    return this.auth.user$.pipe(take(1),
      map(user => {
        comboData.editedAt = date;
        comboData.editedBy = user;

        batch.set(comboRef, comboData);

        return batch;
      }))
  }

  changeComboState(combo: Combo, newState: string): Observable<firebase.firestore.WriteBatch> {
    let comboRef: DocumentReference = this.af.firestore.collection(`/db/deliciasTete/combos`).doc(combo.id);
    let comboData: Combo = combo;
    let date = new Date();
    let batch = this.af.firestore.batch();

    return this.auth.user$.pipe(take(1),
      map(user => {
        comboData.editedAt = date;
        comboData.editedBy = user;
        comboData.state = newState == 'Activar' ? 'Publicado' : 'Inactivo';

        batch.update(comboRef, comboData);

        return batch;
      }))
  }

  //Kitchen
  getOrdersKitchen(from: Date, to: Date): Observable<Order[]> {

    let orderRef = this.af.collection<Order>(`db/deliciasTete/orders`, ref => ref.where('createdAt', '>=', from).where('createdAt', '<=', to));

    return orderRef.valueChanges();
  }


  getMenu() {
    return this.af.collection(`/db/deliciasTete/menuConfiguration`, ref => ref.orderBy('name', 'asc')).valueChanges().pipe(shareReplay(1));
  }

  //Receivable account

  getReceivableUsers(): Observable<ReceivableUser[]> {
    let customersCollection = this.af.collection<ReceivableUser>('db/deliciasTete/receivableUsers', ref => ref.orderBy('createdAt', 'desc'));
    let customers$ = customersCollection.valueChanges().pipe(shareReplay(1));
    return customers$;
  }

  getListReceivable(user) {
    let listCollection = this.af.collection<ReceivableUser>('db/deliciasTete/receivableUsers/' + user + '/list', ref => ref.orderBy('createdAt', 'desc'));
    return listCollection.valueChanges().pipe(shareReplay(1))
  }

  getPaysReceivable(user) {
    let listCollection = this.af.collection<ReceivableUser>('db/deliciasTete/receivableUsers/' + user + '/payments', ref => ref.orderBy('createdAt', 'desc'));
    return listCollection.valueChanges().pipe(shareReplay(1))
  }
  changeBalance(user: ReceivableUser, amount: number): Observable<firebase.firestore.WriteBatch> {
    let receivableUserRef = this.af.firestore.collection('db/deliciasTete/receivableUsers').doc(user.id);
    let receivableUserData;
    let batch = this.af.firestore.batch();

    this.auth.user$
    batch.update(receivableUserRef, receivableUserData)

    return this.auth.user$.pipe(take(1),
      map(user => {
        receivableUserData = {
          editedAt: new Date(),
          editedBy: user,
          balance: firebase.firestore.FieldValue.increment(amount),
        }

        batch.update(receivableUserRef, receivableUserData)
        return batch;
      }))
  }

  gettingTotalRealCost(itemsList: elementCombo[]): Observable<number[]>{
    let itemList: Observable<number>[] = [];
    let itemRef: Observable<number>;
    let recipeItemList: Observable<number>[];

    itemsList.forEach(item => {
      if(!item.hasOwnProperty('inputs')){
        itemRef = this.af.collection<Input|Household|Grocery|Dessert>(`/db/deliciasTete/${this.getWarehouseType((<productCombo>item).type)}`)
            .doc(item.id).valueChanges().pipe(tap(console.log), map((res: Input|Household|Grocery|Dessert)=>(res.averageCost*item.quantity)));
        itemList.push(itemRef);
      }
      //In the case it is a recipe, we calculate input of each
      else{
        itemList.push(this.gettingTotalRealCost((<recipeCombo>item).inputs).pipe(map((res: Array<number>)=> 
          res.reduce((acc,curr)=> (acc + curr),0)
        ))); 
      }
    });

    return combineLatest(...itemList)
  }


  getWarehouseType(type: string): string{
    switch (type.toUpperCase()) {
      case 'INSUMOS':
        return 'warehouseInputs';
      case 'INVENTARIO':
        return 'warehouseHousehold';
      case 'OTROS':
        return 'warehouseGrocery';
      case 'POSTRES':
        return 'warehouseDesserts';
    }
  }

  notObjectValidator(control: FormControl): {[s: string]: boolean}{
    if(typeof control.value == 'object'){
      return null;
    }
    else{
      return {'notObject': true};
    }
  }

}
