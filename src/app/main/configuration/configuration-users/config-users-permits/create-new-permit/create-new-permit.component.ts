import { Component, OnInit } from '@angular/core';
import { Role } from 'src/app/core/models/general/role.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { DatabaseService } from 'src/app/core/database.service';
import { MatSnackBar, MatDialogRef } from '@angular/material';
import { combineLatest, Observable } from 'rxjs';
import { startWith, filter, map, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-create-new-permit',
  templateUrl: './create-new-permit.component.html',
  styles: []
})
export class CreateNewPermitComponent implements OnInit {

  loading: boolean = false;
  nameExist$: Observable<boolean>;

  permitsResults: Array<Role> = [];

  detailsFormGroup: FormGroup;
  permitsConfigurationFormGroup: FormGroup;

  kitchenSelection = new SelectionModel<any>(true, []);
  kitchenKeys: Array<any> = [
    { name: 'Combos', value: 'kitchenCombos' },
    { name: 'Crear Combo', value: 'kitchenCombosCreateAction' },
    { name: 'Descargar Combo', value: 'kitchenCombosDownloadAction' },
    { name: 'Cambio de estado de Combo', value: 'kitchenCombosActions' },
    { name: 'Editar Combo', value: 'kitchenCombosEditActions' },


    { name: 'Recetas', value: 'kitchenRecipes' },
    { name: 'Crear Receta', value: 'kitchenRecipesCreateAction' },
    { name: 'Descargar Receta', value: 'kitchenRecipesDownloadAction' },
    { name: 'Editar Receta', value: 'kitchenRecipesEditAction' },
    { name: 'Eliminar Receta', value: 'kitchenRecipesDeleteAction' },

    { name: 'Platos/Varios', value: 'kitchenDishes' },
    { name: 'Planificacion', value: 'kitchenDishesPlanning' },
    { name: 'Ordenes de Cocina', value: 'kitchenDishesOrders' },
    { name: 'Finalizar Ordenes de Cocina', value: 'kitchenDishesOrdersFinishAction' },
    { name: 'Anular Ordenes de Cocina', value: 'kitchenDishesOrdersDisableAction' },
    { name: 'Publicar Ordenes de Cocina', value: 'kitchenDishesOrdersPublishAction' },
    { name: 'Configuración', value: 'kitchenDishesConfiguration' },
    { name: 'Guardar Configuración', value: 'kitchenDishesConfigurationSaveAction' },
    { name: 'Editar Configuración de Menú', value: 'kitchenDishesConfigurationEditAction' },

    { name: 'Pedidos', value: 'kitchenOrders' },
    { name: 'Descargar Pedido', value: 'kitchenOrdersDownloadAction' },
    { name: 'Detalles de Pedido', value: 'kitchenOrdersDetailsAction' },
    { name: 'Detalles de Insumo', value: 'kitchenOrdersInputDetailsAction' },

    { name: 'Promociones', value: 'kitchenPromos' },
    { name: 'Crear Promoción', value: 'kitchenPromosCreateAction' },
    { name: 'Descargar Promoción', value: 'kitchenPromosDownloadAction' },
    { name: 'Editar Promoción', value: 'kitchenPromosEditAction' },
    { name: 'Cambio de estado de Promoción', value: 'kitchenPromosStateActions' },
  ]

  warehouseSelection = new SelectionModel<any>(true, []);
  warehouseKeys: Array<any> = [
    { name: 'Compras', value: 'warehousePurchases' },
    { name: 'Registrar Compra', value: 'warehousePurchasesRegisterAction' },
    { name: 'Descargar Compra', value: 'warehousePurchasesDownloadAction' },
    { name: 'Cancelar Compra', value: 'warehousePurchasesCancelAction' },

    { name: 'Inventario', value: 'warehouseStocktaking' },
    { name: 'Crear Nuevo', value: 'warehouseStocktakingCreateAction' },
    { name: 'Retirar Menaje', value: 'warehouseStocktakingRemoveAction' },
    { name: 'Descargar inventario', value: 'warehouseStocktakingDownloadAction' },
    { name: 'Inventario Valorado', value: 'warehouseStocktakingValuedCheckbox' },
    { name: 'Kardex', value: 'warehouseStocktakingKardexAction' },
    { name: 'Kardex Valorado', value: 'warehouseStocktakingKardexValuedCheckbox' },

    { name: 'Editar Item', value: 'warehouseStocktakingEditAction' },
    { name: 'Borrar item', value: 'warehouseStocktakingDeleteAction' },
  ]

  salesSelection = new SelectionModel<any>(true, []);
  salesKeys: Array<any> = [
    { name: 'Menu', value: 'salesMenu' },
    { name: 'Historial', value: 'salesRecord' },
    { name: 'Descargar Historial', value: 'salesRecordDownloadAction' },
    { name: 'Anular Registro de Historial', value: 'salesRecordCancelAction' },
    { name: 'Caja', value: 'salesCash' },
    { name: 'Cerrar Caja', value: 'salesCashCloseAction' },
    { name: 'Total Ventas', value: 'salesCashTotalAction' },
    { name: 'Historial', value: 'salesCashHistoryAction' },
    { name: 'Agregar Dinero', value: 'salesCashAddMoneyAction' },
    { name: 'Retirar Dinero', value: 'salesCashRetrieveMoneyAction' },
    { name: 'Configuración', value: 'salesCashConfigurationAction' },
    { name: 'Descargar Caja', value: 'salesCashDownloadAction' },
  ]

  adminSelection = new SelectionModel<any>(true, []);
  adminKeys: Array<any> = [
    { name: 'Cuentas por Pagar', value: 'adminAccountsPayable' },
    { name: 'Lista de Items', value: 'adminAccountsPayableListButton' },
    { name: 'Lista de Pagos a cuenta', value: 'adminAccountsPayablePaysButton' },
    { name: 'Pago total', value: 'adminAccountsPayableTotalPayAction' },
    { name: 'Pago parcial', value: 'adminAccountsPayablePartialPayAction' },

    { name: 'Cuentas por Cobrar', value: 'adminAccountsReceivable' },
    { name: 'Crear Cuenta por Cobrar', value: 'adminAccountsReceivableCreateAction' },
    { name: 'Lista de Items', value: 'adminAccountsReceivableItemButton' },
    { name: 'Lista de Pagos', value: 'adminAccountsReceivablePaymentButton' },
    { name: 'Pago total', value: 'adminAccountsReceivableTotalPayAction' },
    { name: 'Pago parcial', value: 'adminAccountsReceivablePartialPayAction' },

    { name: 'Admin. Cajas', value: 'adminManageCash' },
    { name: 'Crear', value: 'adminManageCashCreateAction' },
    { name: 'Editar', value: 'adminManageCashEditAction' },
    { name: 'Borrar', value: 'adminManageCashDeleteAction' },
    { name: 'Ver Historial', value: 'adminManageCashHistoryButton' },
    { name: 'Descargar Historial', value: 'adminManageCashHistoryDownloadButton' },

  ]

  thirdPartiesSelection = new SelectionModel<any>(true, []);
  thirdPartiesKeys: Array<any> = [
    { name: 'Clientes', value: 'thirdPartiesCustomers' },
    { name: 'Crear', value: 'thirdPartiesCustomersCreateAction' },
    { name: 'Editar', value: 'thirdPartiesCustomersEditAction' },
    { name: 'Borrar', value: 'thirdPartiesCustomersDeleteAction' },
    { name: 'Cuentas', value: 'thirdPartiesCustomersContactsAction' },


    { name: 'Proveedores', value: 'thirdPartiesProviders' },
    { name: 'Crear', value: 'thirdPartiesProvidersCreateAction' },
    { name: 'Editar', value: 'thirdPartiesProvidersEditAction' },
    { name: 'Borrar', value: 'thirdPartiesProvidersDeleteAction' },
    { name: 'Cuentas', value: 'thirdPartiesProvidersAccountsAction' },
    { name: 'Contactos', value: 'thirdPartiesProvidersContactsAction' },
  ]

  configurationSelection = new SelectionModel<any>(true, []);
  configurationKeys: Array<any> = [
    { name: 'Usuarios', value: 'configurationUsers' },
  ];

  constructor(
    private fb: FormBuilder,
    public dbs: DatabaseService,
    private snackbar: MatSnackBar,
    public dialogRef: MatDialogRef<CreateNewPermitComponent>
  ) { }

  ngOnInit() {
    this.detailsFormGroup = this.fb.group({
      name: ['', Validators.required]
    })

    this.nameExist$ = combineLatest(
      this.dbs.permitsList$,
      this.detailsFormGroup.get('name').valueChanges.pipe(
          startWith<any>(''),
          filter(input => input !== null),
          map(value => typeof value === 'string' ? value.toLowerCase() : value.name.toLowerCase()))
      ).pipe(
        map(([permits, name]) => {
          this.permitsResults = permits.filter(option =>
            option['name'] === name);
          if (this.permitsResults.length > 0) {
            return true
          } else {
            return false;
          }
        })
      );

    this.permitsConfigurationFormGroup = this.fb.group({

      kitchenSection: false,
      kitchenCombos: false,
      kitchenCombosCreateAction: false,
      kitchenCombosDownloadAction: false,
      kitchenCombosActions: false,
      kitchenCombosEditActions: false,

      
      kitchenRecipes: false,
      kitchenRecipesCreateAction: false,
      kitchenRecipesDownloadAction: false,
      kitchenRecipesEditAction: false,
      kitchenRecipesDeleteAction: false,


      kitchenDishes: false,
      kitchenDishesPlanning: false,
      kitchenDishesOrders: false,
      kitchenDishesOrdersFinishAction: false,
      kitchenDishesOrdersDisableAction: false,
      kitchenDishesOrdersPublishAction: false,
      kitchenDishesConfiguration: false,
      kitchenDishesConfigurationSaveAction: false,
      kitchenDishesConfigurationEditAction: false,

      
      kitchenOrders: false,
      kitchenOrdersDownloadAction: false,
      kitchenOrdersDetailsAction: false,
      kitchenOrdersInputDetailsAction: false,

      
      kitchenPromos: false,
      kitchenPromosCreateAction: false,
      kitchenPromosDownloadAction: false,
      kitchenPromosEditAction: false,
      kitchenPromosStateActions: false,


      warehouseSection: false,
      warehousePurchases: false,
      warehousePurchasesRegisterAction: false,
      warehousePurchasesDownloadAction: false,
      warehousePurchasesCancelAction: false,

      
      warehouseStocktaking: false,
      warehouseStocktakingCreateAction: false,
      warehouseStocktakingRemoveAction: false,
      warehouseStocktakingDownloadAction: false,
      warehouseStocktakingValuedCheckbox: false,
      warehouseStocktakingKardexAction: false,
      warehouseStocktakingKardexValuedCheckbox: false,
      warehouseStocktakingEditAction: false,
      warehouseStocktakingDeleteAction: false,


      
      salesSection: false,
      salesMenu: false,

      
      salesRecord: false,
      salesRecordDownloadAction: false,
      salesRecordCancelAction: false,

      
      salesCash: false,
      salesCashCloseAction: false,
      salesCashTotalAction: false,
      salesCashHistoryAction: false,
      salesCashAddMoneyAction: false,
      salesCashRetrieveMoneyAction: false,
      salesCashConfigurationAction: false,
      salesCashDownloadAction: false,

      
      adminSection: false,
      adminAccountsPayable: false,
      adminAccountsPayableListButton: false,
      adminAccountsPayablePaysButton: false,
      adminAccountsPayableTotalPayAction: false,
      adminAccountsPayablePartialPayAction: false,

      
      adminAccountsReceivable: false,
      adminAccountsReceivableCreateAction: false,
      adminAccountsReceivableItemButton: false,
      adminAccountsReceivablePaymentButton: false,
      adminAccountsReceivableTotalPayAction: false,
      adminAccountsReceivablePartialPayAction: false,

      
      adminManageCash: false,
      adminManageCashCreateAction: false,
      adminManageCashEditAction: false,
      adminManageCashDeleteAction: false,
      adminManageCashHistoryButton: false,
      adminManageCashHistoryDownloadButton: false,

      
      thirdPartiesSection: false,
      thirdPartiesCustomers: false,
      thirdPartiesCustomersCreateAction: false,
      thirdPartiesCustomersEditAction: false,
      thirdPartiesCustomersDeleteAction: false,
      thirdPartiesCustomersContactsAction: false,

      
      thirdPartiesProviders: false,
      thirdPartiesProvidersCreateAction: false,
      thirdPartiesProvidersEditAction: false,
      thirdPartiesProvidersDeleteAction: false,
      thirdPartiesProvidersAccountsAction: false,
      thirdPartiesProvidersContactsAction: false,

      
      configurationSection: false,
      configurationUsers: false,


    })
    

    this.kitchenSelection.onChange
      .pipe(
        debounceTime(1000)
        ).subscribe(res => {
          if(!this.kitchenSelection.hasValue()){
            this.permitsConfigurationFormGroup.get('kitchenSection').setValue(false);
          } else {
            this.permitsConfigurationFormGroup.get('kitchenSection').setValue(true);
          }
        });

    this.warehouseSelection.onChange
      .pipe(
        debounceTime(1000)
        ).subscribe(res => {
          if(!this.warehouseSelection.hasValue()){
            this.permitsConfigurationFormGroup.get('warehouseSection').setValue(false);
          } else {
            this.permitsConfigurationFormGroup.get('warehouseSection').setValue(true);
          }
        });

    this.salesSelection.onChange
      .pipe(
        debounceTime(1000)
        ).subscribe(res => {
          if(!this.salesSelection.hasValue()){
            this.permitsConfigurationFormGroup.get('salesSection').setValue(false);
          } else {
            this.permitsConfigurationFormGroup.get('salesSection').setValue(true);
          }
        });

    this.adminSelection.onChange
      .pipe(
        debounceTime(1000)
        ).subscribe(res => {
          if(!this.adminSelection.hasValue()){
            this.permitsConfigurationFormGroup.get('adminSection').setValue(false);
          } else {
            this.permitsConfigurationFormGroup.get('adminSection').setValue(true);
          }
        });

    this.thirdPartiesSelection.onChange
      .pipe(
        debounceTime(1000)
        ).subscribe(res => {
          if(!this.thirdPartiesSelection.hasValue()){
            this.permitsConfigurationFormGroup.get('thirdPartiesSection').setValue(false);
          } else {
            this.permitsConfigurationFormGroup.get('thirdPartiesSection').setValue(true);
          }
        });

    this.configurationSelection.onChange
      .pipe(
        debounceTime(1000)
        ).subscribe(res => {
          if(!this.configurationSelection.hasValue()){
            this.permitsConfigurationFormGroup.get('configurationSection').setValue(false);
          } else {
            this.permitsConfigurationFormGroup.get('configurationSection').setValue(true);
          }
        });

  }

  //Kitchen METHODS
  isAllKitchenSelected() {

    const numSelected = this.kitchenSelection.selected.length;

    return numSelected === this.kitchenKeys.length;
  }

  masterKitchenToggle() {
    if (this.isAllKitchenSelected()) {
      this.kitchenSelection.clear();
      this.kitchenKeys.forEach(key => this.permitsConfigurationFormGroup.get(key['value']).setValue(false));
      this.permitsConfigurationFormGroup.get('kitchenSection').setValue(false)
    } else {
      this.kitchenKeys.forEach(key => this.kitchenSelection.select(key['value']));
      this.kitchenKeys.forEach(key => this.permitsConfigurationFormGroup.get(key['value']).setValue(true));
    }
  }

  //Warehouse METHODS
  isAllWarehouseSelected() {

    const numSelected = this.warehouseSelection.selected.length;

    return numSelected === this.warehouseKeys.length;
  }

  masterWarehouseToggle() {
    if (this.isAllWarehouseSelected()) {
      this.warehouseSelection.clear();
      this.warehouseKeys.forEach(key => this.permitsConfigurationFormGroup.get(key['value']).setValue(false));
      this.permitsConfigurationFormGroup.get('warehouseSection').setValue(false)
    } else {
      this.warehouseKeys.forEach(key => this.warehouseSelection.select(key['value']));
      this.warehouseKeys.forEach(key => this.permitsConfigurationFormGroup.get(key['value']).setValue(true));
    }
  }

  //Sales METHODS
  isAllSalesSelected() {

    const numSelected = this.salesSelection.selected.length;

    return numSelected === this.salesKeys.length;
  }

  masterSalesToggle() {
    if (this.isAllSalesSelected()) {
      this.salesSelection.clear();
      this.salesKeys.forEach(key => this.permitsConfigurationFormGroup.get(key['value']).setValue(false));
      this.permitsConfigurationFormGroup.get('salesSection').setValue(false)
    } else {
      this.salesKeys.forEach(key => this.salesSelection.select(key['value']));
      this.salesKeys.forEach(key => this.permitsConfigurationFormGroup.get(key['value']).setValue(true));
    }
  }

  //Admin METHODS
  isAllAdminSelected() {

    const numSelected = this.adminSelection.selected.length;

    return numSelected === this.adminKeys.length;
  }

  masterAdminToggle() {
    if (this.isAllAdminSelected()) {
      this.adminSelection.clear();
      this.adminKeys.forEach(key => this.permitsConfigurationFormGroup.get(key['value']).setValue(false));
      this.permitsConfigurationFormGroup.get('adminSection').setValue(false)
    } else {
      this.adminKeys.forEach(key => this.adminSelection.select(key['value']));
      this.adminKeys.forEach(key => this.permitsConfigurationFormGroup.get(key['value']).setValue(true));
    }
  }

  //ThirdParties METHODS
  isAllThirdPartiesSelected() {

    const numSelected = this.thirdPartiesSelection.selected.length;

    return numSelected === this.thirdPartiesKeys.length;
  }

  masterThirdPartiesToggle() {
    if (this.isAllThirdPartiesSelected()) {
      this.thirdPartiesSelection.clear();
      this.thirdPartiesKeys.forEach(key => this.permitsConfigurationFormGroup.get(key['value']).setValue(false));
      this.permitsConfigurationFormGroup.get('thirdPartiesSection').setValue(false)
    } else {
      this.thirdPartiesKeys.forEach(key => this.thirdPartiesSelection.select(key['value']));
      this.thirdPartiesKeys.forEach(key => this.permitsConfigurationFormGroup.get(key['value']).setValue(true));
    }
  }

  //Configuration METHODS
  isAllConfigurationSelected() {

    const numSelected = this.configurationSelection.selected.length;

    return numSelected === this.configurationKeys.length;
  }

  masterConfigurationToggle() {
    if (this.isAllConfigurationSelected()) {
      this.configurationSelection.clear();
      this.configurationKeys.forEach(key => this.permitsConfigurationFormGroup.get(key['value']).setValue(false));
      this.permitsConfigurationFormGroup.get('configurationSection').setValue(false)
    } else {
      this.configurationKeys.forEach(key => this.configurationSelection.select(key['value']));
      this.configurationKeys.forEach(key => this.permitsConfigurationFormGroup.get(key['value']).setValue(true));
    }
  }

  create(): void {
    let _permits: Role = this.permitsConfigurationFormGroup.value;

    _permits['name'] = this.detailsFormGroup.value['name'];
    _permits['createdAt'] = Date.now();

    _permits['kitchenSection'] = this.kitchenSelection.selected.length > 0 ? true : false;
    _permits['warehouseSection'] = this.warehouseSelection.selected.length > 0 ? true : false;
    _permits['salesSection'] = this.salesSelection.selected.length > 0 ? true : false;
    _permits['adminSection'] = this.adminSelection.selected.length > 0 ? true : false;
    _permits['thirdPartiesSection'] = this.thirdPartiesSelection.selected.length > 0 ? true : false;
    _permits['configurationSection'] = this.configurationSelection.selected.length > 0 ? true : false;
    
    this.dbs.permitsCollection
      .add(_permits)
      .then(ref => {
        ref.update({
          id: ref.id
        });
        this.snackbar.open("Listo!", "Cerrar");
        this.dialogRef.close(true);
      })
      .catch(err => {
        console.log(err);
        this.snackbar.open("Ups...Parece que hubo un error al guardar el permiso", "Cerrar");
        this.dialogRef.close(true);
      })

  }

}
