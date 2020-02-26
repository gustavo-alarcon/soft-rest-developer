import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Grocery } from 'src/app/core/models/warehouse/grocery.model';
import { Dessert } from 'src/app/core/models/warehouse/desserts.model';
import { DatabaseService } from 'src/app/core/database.service';
import { switchMap, debounceTime, map, tap, filter } from 'rxjs/operators';
import { Input } from 'src/app/core/models/warehouse/input.model';
import { Combo, elementCombo, elementComboTable } from 'src/app/core/models/sales/menu/combo.model';
import { Recipe } from 'src/app/core/models/kitchen/recipe.model';
import { Household } from 'src/app/core/models/warehouse/household.model';

@Component({
  selector: 'app-create-new-combo-dialog',
  templateUrl: './create-new-combo-dialog.component.html',
  styleUrls: ['./create-new-combo-dialog.component.css']
})
export class CreateNewComboDialogComponent implements OnInit {
  //Loading 
  loadingTable = new BehaviorSubject(false);
  loadingTable$ = this.loadingTable.asObservable();

  //Table
  inputTableDataSource = new MatTableDataSource<elementComboTable>();
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

  comboForm: FormGroup;
  itemForm: FormGroup;

  productList$: Observable<Array<Grocery | Recipe | Dessert>>;

  productsObservable$: Observable<number[]>;
  productsList: elementCombo[] = [];

  constructor(
    private fb: FormBuilder,
    private dbs: DatabaseService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: Combo
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

  initForms(combo: Combo){
    this.loadingTable.next(true);
    if(combo == null){
      this.comboForm = this.fb.group({
        name: [null, Validators.required],
        price: [0, Validators.required],
        realPrice: [{value: 0, disabled: true}, Validators.required],
        percentageDiscount: [{value: 0, disabled: true}, Validators.required],
        validityPeriod: [null, Validators.required],
        dateRange: [{begin: new Date(), end: new Date()}, Validators.required],
      })
  
      this.comboForm.get('dateRange').disable();
  
      this.itemForm = this.fb.group({
        productCategory: [null, Validators.required],
        product: [null, [Validators.required, this.dbs.notObjectValidator]],
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

        this.comboForm = this.fb.group({
          name: [this.data.name, Validators.required],
          price: [this.data.price, Validators.required],
          realPrice: [{value: 0, disabled: true}, Validators.required],
          percentageDiscount: [{value: 0, disabled: true}, Validators.required],
          validityPeriod: [this.data.validityPeriod, Validators.required],
          dateRange: [{begin: begin, end: end}, Validators.required],
        })
      }
      else{
        this.comboForm = this.fb.group({
          name: [this.data.name, Validators.required],
          price: [this.data.price, Validators.required],
          realPrice: [{value: 0, disabled: true}, Validators.required],
          percentageDiscount: [{value: 0, disabled: true}, Validators.required],
          validityPeriod: [this.data.validityPeriod, Validators.required],
          dateRange: [{begin: new Date(), end: new Date()}, Validators.required],
        })
        this.comboForm.get('dateRange').disable();
      }
  
      this.itemForm = this.fb.group({
        productCategory: [null, Validators.required],
        product: [null, Validators.required],
        quantity: [null, Validators.required]
      })

      this.initTable();
    }
  }

  initTable(){
    let aux: elementComboTable[] = [];

    this.productsList = this.data.products;
    
    this.productsObservable$ = this.dbs.gettingTotalRealCost(this.productsList).pipe(tap(res => {
      this.productsList.forEach((elementCombo, index) => {
          aux.push(
            {
              ...elementCombo,
              index: index,
              averageCost: res[index]/elementCombo.quantity
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
  //Adding items
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
    let aux: elementComboTable[] = [];

    this.productsObservable$ = this.dbs.gettingTotalRealCost(this.productsList).pipe(tap(res => {
      this.productsList.forEach((elementCombo, index) => {
          aux.push(
            {
              ...elementCombo,
              index: index,
              averageCost: res[index]/elementCombo.quantity
            }
          )
      });
      this.inputTableDataSource.data = [...aux];
      this.loadingTable.next(false);
    }));
  }

  onDeleteItem(item: elementComboTable){
    this.itemForm.reset();
    this.loadingTable.next(true);
    let aux: elementComboTable[] = [];

    this.productsList.splice(item.index, 1);
    
    this.productsObservable$ = this.dbs.gettingTotalRealCost(this.productsList).pipe(tap(res => {
      this.productsList.forEach((elementCombo, index) => {
          aux.push(
            {
              ...elementCombo,
              index: index,
              averageCost: res[index]/elementCombo.quantity
            }
          )
      });
      this.inputTableDataSource.data = [...aux];
      this.loadingTable.next(false);
    }));
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
    if(!this.comboForm.get('price').value || !this.getTotalCost()){
      return 0;
    }
    return ((this.getTotalCost()-this.comboForm.get('price').value)*100/this.getTotalCost());
  }

  onUploadCombo(){
    
    let combo: Combo;
    combo = {
      name: <string>this.comboForm.get('name').value,
      price: <number>this.comboForm.get('price').value,
      realPrice: <number>this.getTotalCost(),
      validityPeriod: <string>this.comboForm.get('validityPeriod').value, //Indefinido, Definido
      dateRange: this.comboForm.get('validityPeriod').value == 'Definido' ? <{begin: Date, end: Date}>this.comboForm.get('dateRange').value: null,
      products: this.productsList,
      state: 'Publicado',
      soldUnits: 0
    }

    if(this.data == null){
      this.dbs.onCreateCombo(combo).subscribe(batch => {
        batch.commit().then(() => {
          this.snackBar.open('Se almacenó el combo satisfactoriamente!', 'Aceptar');
        })
        .catch((err)=> {
          console.log(err);
          this.snackBar.open('No se pudo guardar el combo. Por favor, vuelva a intentarlo.', 'Aceptar');
        })
      })
    }
    else{
      combo.id = this.data.id;
      combo.createdAt = this.data.createdAt;
      combo.createdBy = this.data.createdBy;

      this.dbs.onEditCombo(combo).subscribe(batch => {
        batch.commit().then(() => {
          this.snackBar.open('Se actualizó el combo satisfactoriamente!', 'Aceptar');
        })
        .catch((err)=> {
          console.log(err);
          this.snackBar.open('No se pudo guardar el combo. Por favor, vuelva a intentarlo.', 'Aceptar');
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


