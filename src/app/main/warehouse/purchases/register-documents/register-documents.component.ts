import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialog, MatTableDataSource, MatPaginator, MatSnackBar, MatDialogRef } from '@angular/material';
import { Provider } from 'src/app/core/models/third-parties/provider.model';
import { KitchenInput } from 'src/app/core/models/warehouse/kitchenInput.model';
import { DatabaseService } from 'src/app/core/database.service';
import { Observable, of, BehaviorSubject, combineLatest } from 'rxjs';
import { tap, map, debounceTime, take, switchMap, startWith } from 'rxjs/operators';
import { PurchasesCreateProviderDialogComponent } from '../purchases-create-provider-dialog/purchases-create-provider-dialog.component';
import { Payable, ItemModel, PayableLimited } from 'src/app/core/models/admin/payable.model';
import { Household } from 'src/app/core/models/warehouse/household.model';
import { Grocery } from 'src/app/core/models/warehouse/grocery.model';
import { Dessert } from 'src/app/core/models/warehouse/desserts.model';
import { Input } from 'src/app/core/models/warehouse/input.model';
import { CreateInputDialogComponent } from 'src/app/main/create-input-dialog/create-input-dialog.component';
import { Recipe } from 'src/app/core/models/kitchen/recipe.model';

@Component({
  selector: 'app-register-documents',
  templateUrl: './register-documents.component.html',
  styleUrls: ['./register-documents.component.css']
})
export class RegisterDocumentsComponent implements OnInit {
  //Table
  inputsTableDataSource = new MatTableDataSource<any>([]);
  inputsTableDisplayedColumns = ['N°', 'Tipo', 'Producto', 'Medida', 'Cantidad', 'averageCost', 'totalCost', 'Acciones'];
  footerSubtotalDisplayedColumns = ['emptyFooter', 'emptyFooter', 'emptyFooter', 'emptyFooter','emptyFooter',  'descriptionSub', 'subtotal', 'emptyFooter'];
  footerIGVDisplayedColumns = ['emptyFooter', 'emptyFooter', 'emptyFooter', 'emptyFooter','emptyFooter',  'descriptionIGV', 'IGV', 'emptyFooter'];
  footerTotalDisplayedColumns = ['emptyFooter', 'emptyFooter', 'emptyFooter', 'emptyFooter','emptyFooter',  'descriptionTotal', 'total', 'emptyFooter'];

  //Paginators
  @ViewChild('inputsTablePaginator', {static: false}) inputsTablePaginator: MatPaginator;

  documentForm: FormGroup;
  itemsListForm: FormGroup;

  //Templates
  providers: Provider[];
  items: KitchenInput[];
  documentType: String[] = [
    'BOLETA', 'FACTURA', 'TICKET'
  ]
  paymentType: String[] = [
    'CREDITO', 'EFECTIVO', 'TARJETA'
  ]
  inputList: Observable<KitchenInput[]>;
  inputList$: Observable<Array<Grocery | Input | Dessert | Household>>;


  providersList$: Observable<Provider[]>
  socialReason$: Observable<string>;

  savingPurchase = new BehaviorSubject(false);
  savingPurchase$ = this.savingPurchase.asObservable();

  types: String[] = ['INSUMOS', 'OTROS', 'POSTRES', 'INVENTARIO'];

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private dbs: DatabaseService,
    private snackbar: MatSnackBar,
    private dialogRef: MatDialogRef<RegisterDocumentsComponent>
  ) { }

  ngOnInit() {
    this.initForms();
    this.providersList$ = this.dbs.getProviders();
    this.inputList = of([]);

    this.inputList$ = combineLatest(this.itemsListForm.get('type').valueChanges.pipe(startWith('INSUMOS')), this.itemsListForm.get('item').valueChanges.pipe(startWith(''))).pipe(
      map(([type, item])=> (item)),
      switchMap((productName)=> {
        if(this.itemsListForm.get('type').value == null){
          return of([]);
        }
        else{
          return this.dbs.onGetProductType(this.itemsListForm.get('type').value).pipe(
            debounceTime(300), 
            map((inputList)=> {
                return this.filterRecipe(inputList, this.itemsListForm.get('item').value)
            }))
        }
      }));

  }

  initForms(){
    this.documentForm = this.fb.group({
      documentDetails: this.fb.group({
        documentDate: [null, Validators.required],
        documentType: [null, Validators.required, this.purchaseValidator(this.dbs)],
        documentSerial: [null, Validators.required, this.purchaseValidator(this.dbs)],
        documentCorrelative: [null, Validators.required, this.purchaseValidator(this.dbs)],
        //socialReason: [{value: null, disabled: true}, Validators.required],     //Depends on RUC, should not be sent
        provider: [null, Validators.required, this.purchaseValidator(this.dbs)],
        paymentType: [null, Validators.required],
        creditExpirationDate: [{value: null, disabled: true}, Validators.required]  //Depend on Credito
      }),
      imports: this.fb.group({
        subtotalImport: [{value: null, disabled: true}, Validators.required],   //Depends on RUC
        igvImport: [{value: null, disabled: true}, Validators.required],        //Depends on RUC // 0.18
        totalImport: [{value: null, disabled: true}, Validators.required],
        paidImport: [null, Validators.required],
        indebtImport: [{value: null, disabled: true}, Validators.required],
      }),
    });
    this.itemsListForm = this.fb.group({
      kitchenInputId: null,
      type: ['INSUMOS', Validators.required],
      item: [{value: '', disabled: false}, [Validators.required, this.dbs.notObjectValidator]],
      quantity: [null, Validators.required],
      cost: [null, Validators.required]    //Have to check, if we need to disable
    })
    //La lista de items debe ser puntual

    this.documentForm.get('documentDetails.paymentType').valueChanges.subscribe((obs)=>{
      if(obs == 'CREDITO'){
        this.documentForm.get('documentDetails.creditExpirationDate').enable();
        this.documentForm.get('imports.paidImport').reset();
    }
      else{
        this.documentForm.get('documentDetails.creditExpirationDate').disable();
        this.documentForm.get('imports.paidImport').setValue(this.getTotalCost());
      }
    });

    this.itemsListForm.get('item').valueChanges.subscribe((item: Input) => {
      if(item != null){
        this.itemsListForm.get('kitchenInputId').setValue(item.id);
      }
    })


    this.socialReason$ = this.documentForm.get('documentDetails.provider').valueChanges.pipe(map((provider: Provider)=> {
      if(provider != null){
        return provider.name;
      }
      else{
        return null;
      }
    }))

    this.documentForm.get('imports.paidImport').valueChanges.subscribe((res: number) => {
      this.documentForm.get('imports.indebtImport').setValue(Math.round(this.getTotalCost()*100.0 - res*100.0)/100.0)
    })

  }

  onAddProvider(){
    this.dialog.open(PurchasesCreateProviderDialogComponent);
  }

  onCreateInput(){
    this.dialog.open(CreateInputDialogComponent);
  }

  onAddInput(){
    this.inputsTableDataSource.data = [
      ...this.inputsTableDataSource.data,
      {
        id: <string>(this.itemsListForm.get('kitchenInputId').value),
        type: <string>(this.itemsListForm.get('type').value),
        item: <(string | Household | Grocery | Dessert | Input)>(this.itemsListForm.get('item').value),
        sku: <string>(this.itemsListForm.get('item').value['sku']),
        quantity: <number>(this.itemsListForm.get('quantity').value),
        averageCost: <number>(this.itemsListForm.get('cost').value)/<number>(this.itemsListForm.get('quantity').value),
        totalCost: <number>(this.itemsListForm.get('cost').value),
        unit: <string>(this.itemsListForm.get('item').value['unit']),
      }
    ];
    this.inputsTableDataSource.paginator = this.inputsTablePaginator;
    this.itemsListForm.get('item').reset();
    this.itemsListForm.get('quantity').reset();
    this.itemsListForm.get('cost').reset();
    if(this.documentForm.get('documentDetails.paymentType').value != 'CREDITO'){
      this.documentForm.get('imports.paidImport').setValue(this.getTotalCost());
    }

  }

  onDeleteInput(element){
    let aux = this.inputsTableDataSource.data;
    this.inputsTableDataSource.data = aux.filter(el => element!=el);
    this.documentForm.get('imports.paidImport').setValue(this.getTotalCost());
  }

  getSubtotal() {
    return this.getTotalCost() / 1.18;
  }

  getIGV() {
    return this.getTotalCost() - this.getSubtotal();
  }

  getTotalCost(){
    let aux = this.inputsTableDataSource.data;
    return aux.reduce((accumulator, currentValue) => {
      return (accumulator + currentValue['totalCost']);
    }, 0)
  }


  onSubmitPurchase(){
    this.savingPurchase.next(true);

    let aux: ItemModel[] = [];

    this.inputsTableDataSource.data.forEach(el => {
      aux.push({
        id: el['id'],
        type: el['type'],
        item: el['item'],
        sku: el['sku'],
        quantity: el['quantity'],
        averageCost: el['averageCost'],
        unit: el['unit']
      });
    })


    if(this.documentForm.get('documentDetails.documentType').value == 'FACTURA'){
      this.documentForm.get('imports.subtotalImport').enable();
      this.documentForm.get('imports.igvImport').enable();
      this.documentForm.get('imports.totalImport').enable();
      this.documentForm.get('imports.indebtImport').enable();

      this.documentForm.get('imports.subtotalImport').setValue(this.getSubtotal());
      this.documentForm.get('imports.igvImport').setValue(this.getIGV());
      this.documentForm.get('imports.totalImport').setValue(this.getTotalCost());
    }
    else{
      this.documentForm.get('imports.totalImport').enable();
      this.documentForm.get('imports.indebtImport').enable();
      this.documentForm.get('imports.totalImport').setValue(this.getTotalCost());
    }

    //Constructing doc to upload
    let payableDoc: PayableLimited;
    payableDoc = {
      documentDate: this.documentForm.get('documentDetails.documentDate').value,
      documentType: this.documentForm.get('documentDetails.documentType').value,
      documentSerial: this.documentForm.get('documentDetails.documentSerial').value,
      documentCorrelative: this.documentForm.get('documentDetails.documentCorrelative').value,
      provider: {
        id: this.documentForm.get('documentDetails.provider').value['id'],
        name: this.documentForm.get('documentDetails.provider').value['name'],
        ruc: this.documentForm.get('documentDetails.provider').value['ruc'],
      },
      itemsList: aux,
      payments: this.documentForm.get('documentDetails.paymentType').value == 'CREDITO' ? [{//SOLO CREDITO
        type: 'PARCIAL',
        paymentType: this.documentForm.get('documentDetails.paymentType').value,
        amount: this.documentForm.get('imports.paidImport').value,
        cashReference: null,
        paidAt: null,
        paidBy: null,
      }] : [{
        type: 'TOTAL',
        paymentType: this.documentForm.get('documentDetails.paymentType').value,
        amount: this.documentForm.get('imports.paidImport').value,
        cashReference: null,
        paidAt: null,
        paidBy: null,
      }],
      creditDate: this.documentForm.get('documentDetails.creditExpirationDate').value == undefined ? null : this.documentForm.get('documentDetails.creditExpirationDate').value,
      paymentDate: null,
      totalAmount: this.documentForm.get('imports.totalImport').value,
      subtotalAmount: this.documentForm.get('documentDetails.documentType').value == 'FACTURA' ? this.getSubtotal(): null,
      igvAmount: this.documentForm.get('documentDetails.documentType').value == 'FACTURA' ? this.getIGV(): null,
      paymentType: this.documentForm.get('documentDetails.paymentType').value, // CREDITO, EFECTIVO, TARJETA
      paidAmount: this.documentForm.get('documentDetails.paymentType').value == 'CREDITO' ? this.documentForm.get('imports.paidImport').value : this.documentForm.get('imports.totalImport').value,
      indebtAmount: this.documentForm.get('documentDetails.paymentType').value == 'CREDITO' ? this.documentForm.get('imports.indebtImport').value : null,
      status: this.documentForm.get('documentDetails.paymentType').value == 'CREDITO' ? 'PENDIENTE' : 'PAGADO', // PENDIENTE, PAGADO, ANULADO
    }

    //Uploading
    this.dbs.onAddPurchase(payableDoc, aux).subscribe(batch => {
      batch.commit().then(() => {
        this.snackbar.open('Se registró la compra exitosamente', 'Aceptar', {duration: 6000});
        this.dialogRef.close();
      }).catch((err) => {
        console.log(err);
        console.log(this.inputsTableDataSource.data);
        this.snackbar.open('Ocurrió un error. Por favor, vuelva a intentarlo.', 'Aceptar', {duration: 6000});
        this.documentForm.get('imports.subtotalImport').disable();
        this.documentForm.get('imports.igvImport').disable();
        this.documentForm.get('imports.totalImport').disable();
        this.documentForm.get('imports.indebtImport').disable();
        this.savingPurchase.next(false);
      })
    });
  }

  //Validators
  purchaseValidator(dbs: DatabaseService){
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if(
        control.parent.get('documentType').value == null ||
        control.parent.get('documentSerial').value == null ||
        control.parent.get('documentCorrelative').value == null ||
        control.parent.get('provider').value == null
      ){
        return of(null)
      }
      else{
        return dbs.repPurchaseValidator(
          control.parent.get('documentType').value,
          control.parent.get('documentSerial').value,
          control.parent.get('documentCorrelative').value,
          control.parent.get('provider').value,
        ).pipe(debounceTime(500),take(1),tap((res)=> {
          if(res != null){
            this.snackbar.open('Esta compra ya se encuentra registrada', 'Aceptar', {duration: 6000});
            control.parent.get('documentType').setValue(null);
            control.parent.get('documentSerial').setValue(null);
            control.parent.get('documentCorrelative').setValue(null);
            control.parent.get('provider').setValue(null);
          }
        }))
      }
    }
  }

  filterRecipe(recipeList: Array<Grocery | Input | Household | Dessert | Recipe>, recipeName: Grocery | Input | Household | Dessert | Recipe | string){
    if(!!recipeName){
      if(typeof recipeName != 'string'){
        return recipeList.filter(recipe => recipe.name.toUpperCase().includes(recipeName.name.toUpperCase()))
      }
      else{
        return recipeList.filter(recipe => recipe.name.toUpperCase().includes(recipeName.toUpperCase()))
      }
    }
    else{
      return recipeList;
    }
  }

  displayFn(input: Input) {
    if (!input || input.name == undefined) return '';
    return input.name.split('')[0].toUpperCase() + input.name.split('').slice(1).join('').toLowerCase();
  }
  
}