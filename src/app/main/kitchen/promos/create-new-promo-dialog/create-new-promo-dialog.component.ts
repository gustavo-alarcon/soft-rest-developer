import { Component, OnInit, ChangeDetectionStrategy, ViewChild, Inject, } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Dessert } from 'src/app/core/models/warehouse/desserts.model';
import { Observable, combineLatest, of, BehaviorSubject } from 'rxjs';
import { Grocery } from 'src/app/core/models/warehouse/grocery.model';
import { Household } from 'src/app/core/models/warehouse/household.model';
import { Input } from 'src/app/core/models/warehouse/input.model';
import { Tool } from 'src/app/core/models/warehouse/tools.model';
import { DatabaseService } from 'src/app/core/database.service';
import { map, startWith, tap, debounceTime, distinctUntilChanged, take, switchMap } from 'rxjs/operators';
import { MatTableDataSource, MatPaginator, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { Recipe } from 'src/app/core/models/kitchen/recipe.model';
import { Promo, elementPromoTable, elementPromo } from 'src/app/core/models/sales/menu/promo.model';
import { Meal } from 'src/app/core/models/sales/menu/meal.model';

@Component({
  selector: 'app-create-new-promo-dialog',
  templateUrl: './create-new-promo-dialog.component.html',
  styleUrls: ['./create-new-promo-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateNewPromoDialogComponent implements OnInit {
  //Loading 
  loadingTable = new BehaviorSubject(false);
  loadingTable$ = this.loadingTable.asObservable();

  //Table
  inputTableDataSource = new MatTableDataSource<elementPromoTable>();
  inputTableDisplayedColumns: string[] = [
    'index', 'itemName', 'itemUnit', 'quantity', 'actions'
  ]
  @ViewChild('inputTablePaginator', {static:false}) set matPaginator(mp: MatPaginator){
    this.inputTableDataSource.paginator = mp;
  }
  
  //Variables
  productCategory: Array<string> = [
    'Platos', 'Postres', 'Otros'
  ]

  quantity: Array<string> = [
    'Indefinido', 'Definido'
  ]

  period: Array<string> = [
    'Indefinido', 'Definido'
  ]

  productNameFormat$: Observable<any>;

  promoForm: FormGroup;
  itemForm: FormGroup;

  productList$: Observable<Array<Grocery | Recipe | Dessert>>;

  productsObservable$: Observable<number[]>;
  productsList: elementPromo[] = [];

  constructor(
    private fb: FormBuilder,
    private dbs: DatabaseService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: Promo
  ) { }

  ngOnInit() {
    this.inputTableDataSource.data = [];
    this.initForms(this.data);

    this.productList$ = this.itemForm.get('product').valueChanges.pipe(
      switchMap((productName)=> {
        if(this.itemForm.get('productCategory').value == null){
          return of([]);
        }
        else{
          return this.dbs.onGetProductType(this.itemForm.get('productCategory').value).pipe(
            debounceTime(100), 
            map((productList)=> {
              return this.filterRecipe(productList, this.itemForm.get('product').value)
            }))
        }
      }));
    
  }

  initForms(promo: Promo){
    this.loadingTable.next(true);
    if(promo == null){
      this.promoForm = this.fb.group({
        name: [null, Validators.required],
        quantity: [null, Validators.required],
        units: [ {value: null, disabled: true}, Validators.required],
        promoPrice: [0, Validators.required],
        realPrice: [{value: 0, disabled: true}, Validators.required],
        percentageDiscount: [{value: 0, disabled: true}, Validators.required],
        validityPeriod: [null, Validators.required],
        dateRange: [{begin: new Date(), end: new Date()}, Validators.required],
      })
  
      this.promoForm.get('dateRange').disable();
  
      this.itemForm = this.fb.group({
        productCategory: [null, Validators.required],
        product: [null, Validators.required],
        quantity: [null, Validators.required]
      })
      this.loadingTable.next(false);
    }
    else{
      if(this.data.validityPeriod == 'Definido'){
        let begin = new Date(1970);
        begin.setSeconds(this.data.dateRange.begin['seconds']);
        let end = new Date(1970);
        end.setSeconds(this.data.dateRange.end['seconds'])

        this.promoForm = this.fb.group({
          name: [this.data.name, Validators.required],
          quantity: [this.data.quantity, Validators.required],
          units: [ {value: this.data.units, disabled: true}, Validators.required],
          promoPrice: [this.data.price, Validators.required],
          realPrice: [{value: 0, disabled: true}, Validators.required],
          percentageDiscount: [{value: 0, disabled: true}, Validators.required],
          validityPeriod: [this.data.validityPeriod, Validators.required],
          dateRange: [{begin: begin, end: end}, Validators.required],
        })
      }
      else{
        this.promoForm = this.fb.group({
          name: [this.data.name, Validators.required],
          quantity: [this.data.quantity, Validators.required],
          units: [ {value: this.data.units, disabled: true}, Validators.required],
          promoPrice: [this.data.price, Validators.required],
          realPrice: [{value: 0, disabled: true}, Validators.required],
          percentageDiscount: [{value: 0, disabled: true}, Validators.required],
          validityPeriod: [this.data.validityPeriod, Validators.required],
          dateRange: [{begin: new Date(), end: new Date()}, Validators.required],
        })
        this.promoForm.get('dateRange').disable();
      }
  
      this.itemForm = this.fb.group({
        productCategory: [null, Validators.required],
        product: [null, Validators.required, this.dbs.notObjectValidator],
        quantity: [null, Validators.required]
      })

      this.initTable();
    }
    
  }

  initTable(){
    let aux: elementPromoTable[] = [];

    this.productsList = this.data.products;
    
    this.productsObservable$ = this.dbs.gettingTotalRealCost(this.productsList).pipe(tap(res => {
      this.productsList.forEach((elementPromo, index) => {
          aux.push(
            {
              ...elementPromo,
              index: index,
              averageCost: res[index]/elementPromo.quantity
            }
          )
      });
      this.inputTableDataSource.data = [...aux];
      this.loadingTable.next(false);
    }));
  }

  onFilterInputs(inputList: Input[], inputForm: string | Input){
    if(typeof inputForm != 'string'){
      return inputList.filter(input => input.name.toLowerCase().includes(inputForm.name.toLowerCase()))
    }
    else{
      const filterValue = inputForm.toLowerCase();
      return inputList.filter(input => input.name.toLowerCase().includes(filterValue))
    }
  }

  //Table
  //Adding Items

  onAddItem(){


    //In the case it is an input, it wont have property inputs.
    if(!this.itemForm.get('product').value.hasOwnProperty('inputs')){
      this.productsList.push({
        name: (<Input>this.itemForm.get('product').value).name,
        sku: (<Input>this.itemForm.get('product').value).sku,
        quantity: <number>this.itemForm.get('quantity').value,
        id: (<Input>this.itemForm.get('product').value).id,
        unit: (<Input>this.itemForm.get('product').value).unit,
        type: this.itemForm.get('productCategory').value,
      });
    }
    //In the case there is a recipe, it will have property inputs
    else{
      this.productsList.push({
        ...(<Recipe>this.itemForm.get('product').value),
        quantity: <number>this.itemForm.get('quantity').value,
        unit: 'UND'
      });
    }

    this.itemForm.reset();
    this.loadingTable.next(true);
    let aux: elementPromoTable[] = [];

    this.productsObservable$ = this.dbs.gettingTotalRealCost(this.productsList).pipe(tap(res => {
      this.productsList.forEach((elementPromo, index) => {
          aux.push(
            {
              ...elementPromo,
              index: index,
              averageCost: res[index]/elementPromo.quantity
            }
          )
      });
      this.inputTableDataSource.data = [...aux];
      this.loadingTable.next(false);
    }));
  }

  onDeleteItem(item: elementPromoTable){
    this.itemForm.reset();
    this.loadingTable.next(true);
    let aux: elementPromoTable[] = [];
    

    this.productsList.splice(item.index, 1);
    
    if(this.productsList.length)
    {
      this.productsObservable$ = this.dbs.gettingTotalRealCost(this.productsList).pipe(tap(res => {
        this.productsList.forEach((elementPromo, index) => {
            aux.push(
              {
                ...elementPromo,
                index: index,
                averageCost: res[index]/elementPromo.quantity
              }
            )
        });
  
        this.inputTableDataSource.data = [...aux];
        this.loadingTable.next(false);
      }));
    }
    else{
      this.inputTableDataSource.data = [];
      this.loadingTable.next(false);
    }

  }

  getTotalCost(): number{
    if(this.inputTableDataSource.data.length){
      return this.inputTableDataSource.data.reduce<number>((acc, curr)=> {
        return <number>acc + <number>(curr.averageCost*curr.quantity)
      }, 0);

    }
    return 0
  }

  getPercentage(){
    if(!this.promoForm.get('promoPrice').value || !this.getTotalCost()){
      return 0;
    }
    return ((this.getTotalCost()-this.promoForm.get('promoPrice').value)*100/this.getTotalCost());
  }

  onUploadOffer(){

    let promo: Promo;
    promo = {
      name: <string>this.promoForm.get('name').value,
      quantity: <string>this.promoForm.get('quantity').value, //Indefinido, Definido
      units: this.promoForm.get('quantity').value == 'Definido' ? <number>this.promoForm.get('units').value: null,
      price: <number>this.promoForm.get('promoPrice').value,
      realPrice: <number>this.getTotalCost(),
      validityPeriod: <string>this.promoForm.get('validityPeriod').value, //Indefinido, Definido
      dateRange: this.promoForm.get('validityPeriod').value == 'Definido' ? <{begin: Date, end: Date}>this.promoForm.get('dateRange').value: null,
      products: this.productsList,
      state: 'Publicado',
      soldUnits: 0
    }

    if(this.data == null){
      this.dbs.onCreateOffer(promo).subscribe(batch => {
        batch.commit().then(() => {
          this.snackBar.open('Se almacenó la oferta satisfactoriamente!', 'Aceptar');
        })
        .catch((err)=> {
          console.log(err);
          this.snackBar.open('No se pudo guardar la oferta. Por favor, vuelva a intentarlo.', 'Aceptar');
        })
      })
    }
    else{
      promo.id = this.data.id;
      promo.createdAt = this.data.createdAt;
      promo.createdBy = this.data.createdBy;

      this.dbs.onEditOffer(promo).subscribe(batch => {
        batch.commit().then(() => {
          this.snackBar.open('Se actualizó la oferta satisfactoriamente!', 'Aceptar');
        })
        .catch((err)=> {
          console.log(err);
          this.snackBar.open('No se pudo guardar la oferta. Por favor, vuelva a intentarlo.', 'Aceptar');
        })
      })
    }
    

  }

  formatInput(value: string){
    let aux = value;
    let regex = new RegExp(/\s+/, 'ig');
    if(aux != null && aux !=""){
      aux = aux.replace(regex, ' ').toLowerCase().trim();
      return aux.split('')[0].toUpperCase() + aux.split('').slice(1).join('');
    }
    else return value;
  }

  filterRecipe(recipeList: Array<Grocery | Recipe | Dessert | Household>, recipeName:  | Grocery | Recipe | Dessert | Household | string){
    if(typeof recipeName != 'string'){
      return recipeList.filter(recipe => recipe.name.toUpperCase().includes(recipeName.name.toUpperCase()))
    }
    else{
      return recipeList.filter(recipe => recipe.name.toUpperCase().includes(recipeName.toUpperCase()))
    }
  }

  displayFn(input: Input) {
    if (!input) return '';
    return input.name.split('')[0].toUpperCase() + input.name.split('').slice(1).join('').toLowerCase();
  }

}


