import { Component, OnInit, Inject } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { Role } from 'src/app/core/models/general/role.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { DatabaseService } from 'src/app/core/database.service';
import { MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { startWith, filter, map, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-users-permit-dialog-edit',
  templateUrl: './users-permit-dialog-edit.component.html',
  styles: []
})
export class UsersPermitDialogEditComponent implements OnInit {

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
    public dialogRef: MatDialogRef<UsersPermitDialogEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.detailsFormGroup = this.fb.group({
      name: [this.data['name'], Validators.required]
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

      kitchenSection: this.data['kitchenSection'] ? this.data['kitchenSection'] : false,
      kitchenCombos: this.data['kitchenCombos'] ? this.data['kitchenCombos'] : false,
      kitchenCombosCreateAction: this.data['kitchenCombosCreateAction'] ? this.data['kitchenCombosCreateAction'] : false,
      kitchenCombosDownloadAction: this.data['kitchenCombosDownloadAction'] ? this.data['kitchenCombosDownloadAction'] : false,
      kitchenCombosActions: this.data['kitchenCombosActions'] ? this.data['kitchenCombosActions'] : false,
      kitchenCombosEditActions: this.data['kitchenCombosEditActions'] ? this.data['kitchenCombosEditActions'] : false,

      
      kitchenRecipes: this.data['kitchenRecipes'] ? this.data['kitchenRecipes'] : false,
      kitchenRecipesCreateAction: this.data['kitchenRecipesCreateAction'] ? this.data['kitchenRecipesCreateAction'] : false,
      kitchenRecipesDownloadAction: this.data['kitchenRecipesDownloadAction'] ? this.data['kitchenRecipesDownloadAction'] : false,
      kitchenRecipesEditAction: this.data['kitchenRecipesEditAction'] ? this.data['kitchenRecipesEditAction'] : false,
      kitchenRecipesDeleteAction: this.data['kitchenRecipesDeleteAction'] ? this.data['kitchenRecipesDeleteAction'] : false,

      kitchenDishes: this.data['kitchenDishes'] ? this.data['kitchenDishes'] : false,
      kitchenDishesPlanning: this.data['kitchenDishesPlanning'] ? this.data['kitchenDishesPlanning'] : false,
      kitchenDishesOrders: this.data['kitchenDishesOrders'] ? this.data['kitchenDishesOrders'] : false,
      kitchenDishesOrdersFinishAction: this.data['kitchenDishesOrdersFinishAction'] ? this.data['kitchenDishesOrdersFinishAction'] : false,
      kitchenDishesOrdersDisableAction: this.data['kitchenDishesOrdersDisableAction'] ? this.data['kitchenDishesOrdersDisableAction'] : false,
      kitchenDishesOrdersPublishAction: this.data['kitchenDishesOrdersPublishAction'] ? this.data['kitchenDishesOrdersPublishAction'] : false,
      kitchenDishesConfiguration: this.data['kitchenDishesConfiguration'] ? this.data['kitchenDishesConfiguration'] : false,
      kitchenDishesConfigurationSaveAction: this.data['kitchenDishesConfigurationSaveAction'] ? this.data['kitchenDishesConfigurationSaveAction'] : false,
      kitchenDishesConfigurationEditAction: this.data['kitchenDishesConfigurationEditAction'] ? this.data['kitchenDishesConfigurationEditAction'] : false,

      
      kitchenOrders: this.data['kitchenOrders'] ? this.data['kitchenOrders'] : false,
      kitchenOrdersDownloadAction: this.data['kitchenOrdersDownloadAction'] ? this.data['kitchenOrdersDownloadAction'] : false,
      kitchenOrdersDetailsAction: this.data['kitchenOrdersDetailsAction'] ? this.data['kitchenOrdersDetailsAction'] : false,
      kitchenOrdersInputDetailsAction: this.data['kitchenOrdersInputDetailsAction'] ? this.data['kitchenOrdersInputDetailsAction'] : false,

      
      kitchenPromos: this.data['kitchenPromos'] ? this.data['kitchenPromos'] : false,
      kitchenPromosCreateAction: this.data['kitchenPromosCreateAction'] ? this.data['kitchenPromosCreateAction'] : false,
      kitchenPromosDownloadAction: this.data['kitchenPromosDownloadAction'] ? this.data['kitchenPromosDownloadAction'] : false,
      kitchenPromosEditAction: this.data['kitchenPromosEditAction'] ? this.data['kitchenPromosEditAction'] : false,
      kitchenPromosStateActions: this.data['kitchenPromosStateActions'] ? this.data['kitchenPromosStateActions'] : false,



      warehouseSection: this.data['warehouseSection'] ? this.data['warehouseSection'] : false,
      warehousePurchases: this.data['warehousePurchases'] ? this.data['warehousePurchases'] : false,
      warehousePurchasesRegisterAction: this.data['warehousePurchasesRegisterAction'] ? this.data['warehousePurchasesRegisterAction'] : false,
      warehousePurchasesDownloadAction: this.data['warehousePurchasesDownloadAction'] ? this.data['warehousePurchasesDownloadAction'] : false,
      warehousePurchasesCancelAction: this.data['warehousePurchasesCancelAction'] ? this.data['warehousePurchasesCancelAction'] : false,

      
      warehouseStocktaking: this.data['warehouseStocktaking'] ? this.data['warehouseStocktaking'] : false,
      warehouseStocktakingCreateAction: this.data['warehouseStocktakingCreateAction'] ? this.data['warehouseStocktakingCreateAction'] : false,
      warehouseStocktakingRemoveAction: this.data['warehouseStocktakingRemoveAction'] ? this.data['warehouseStocktakingRemoveAction'] : false,
      warehouseStocktakingDownloadAction: this.data['warehouseStocktakingDownloadAction'] ? this.data['warehouseStocktakingDownloadAction'] : false,
      warehouseStocktakingValuedCheckbox: this.data['warehouseStocktakingValuedCheckbox'] ? this.data['warehouseStocktakingValuedCheckbox'] : false,
      warehouseStocktakingKardexAction: this.data['warehouseStocktakingKardexAction'] ? this.data['warehouseStocktakingKardexAction'] : false,
      warehouseStocktakingKardexValuedCheckbox: this.data['warehouseStocktakingKardexValuedCheckbox'] ? this.data['warehouseStocktakingKardexValuedCheckbox'] : false,
      warehouseStocktakingEditAction: this.data['warehouseStocktakingEditAction'] ? this.data['warehouseStocktakingEditAction'] : false,
      warehouseStocktakingDeleteAction: this.data['warehouseStocktakingDeleteAction'] ? this.data['warehouseStocktakingDeleteAction'] : false,


      
      salesSection: this.data['salesSection'] ? this.data['salesSection'] : false,
      salesMenu: this.data['salesMenu'] ? this.data['salesMenu'] : false,

      
      salesRecord: this.data['salesRecord'] ? this.data['salesRecord'] : false,
      salesRecordDownloadAction: this.data['salesRecordDownloadAction'] ? this.data['salesRecordDownloadAction'] : false,
      salesRecordCancelAction: this.data['salesRecordCancelAction'] ? this.data['salesRecordCancelAction'] : false,

      
      salesCash: this.data['salesCash'] ? this.data['salesCash'] : false,
      salesCashCloseAction: this.data['salesCashCloseAction'] ? this.data['salesCashCloseAction'] : false,
      salesCashTotalAction: this.data['salesCashTotalAction'] ? this.data['salesCashTotalAction'] : false,
      salesCashHistoryAction: this.data['salesCashHistoryAction'] ? this.data['salesCashHistoryAction'] : false,
      salesCashAddMoneyAction: this.data['salesCashAddMoneyAction'] ? this.data['salesCashAddMoneyAction'] : false,
      salesCashRetrieveMoneyAction: this.data['salesCashRetrieveMoneyAction'] ? this.data['salesCashRetrieveMoneyAction'] : false,
      salesCashConfigurationAction: this.data['salesCashConfigurationAction'] ? this.data['salesCashConfigurationAction'] : false,
      salesCashDownloadAction: this.data['salesCashDownloadAction'] ? this.data['salesCashDownloadAction'] : false,

      
      adminSection: this.data['adminSection'] ? this.data['adminSection'] : false,
      adminAccountsPayable: this.data['adminAccountsPayable'] ? this.data['adminAccountsPayable'] : false,
      adminAccountsPayableListButton: this.data['adminAccountsPayableListButton'] ? this.data['adminAccountsPayableListButton'] : false,
      adminAccountsPayablePaysButton: this.data['adminAccountsPayablePaysButton'] ? this.data['adminAccountsPayablePaysButton'] : false,
      adminAccountsPayableTotalPayAction: this.data['adminAccountsPayableTotalPayAction'] ? this.data['adminAccountsPayableTotalPayAction'] : false,
      adminAccountsPayablePartialPayAction: this.data['adminAccountsPayablePartialPayAction'] ? this.data['adminAccountsPayablePartialPayAction'] : false,

      
      adminAccountsReceivable: this.data['adminAccountsReceivable'] ? this.data['adminAccountsReceivable'] : false,
      adminAccountsReceivableCreateAction: this.data['adminAccountsReceivableCreateAction'] ? this.data['adminAccountsReceivableCreateAction'] : false,
      adminAccountsReceivableItemButton: this.data['adminAccountsReceivableItemButton'] ? this.data['adminAccountsReceivableItemButton'] : false,
      adminAccountsReceivablePaymentButton: this.data['adminAccountsReceivablePaymentButton'] ? this.data['adminAccountsReceivablePaymentButton'] : false,
      adminAccountsReceivableTotalPayAction: this.data['adminAccountsReceivableTotalPayAction'] ? this.data['adminAccountsReceivableTotalPayAction'] : false,
      adminAccountsReceivablePartialPayAction: this.data['adminAccountsReceivablePartialPayAction'] ? this.data['adminAccountsReceivablePartialPayAction'] : false,

      
      adminManageCash: this.data['adminManageCash'] ? this.data['adminManageCash'] : false,
      adminManageCashCreateAction: this.data['adminManageCashCreateAction'] ? this.data['adminManageCashCreateAction'] : false,
      adminManageCashEditAction: this.data['adminManageCashEditAction'] ? this.data['adminManageCashEditAction'] : false,
      adminManageCashDeleteAction: this.data['adminManageCashDeleteAction'] ? this.data['adminManageCashDeleteAction'] : false,
      adminManageCashHistoryButton: this.data['adminManageCashHistoryButton'] ? this.data['adminManageCashHistoryButton'] : false,
      adminManageCashHistoryDownloadButton: this.data['adminManageCashHistoryDownloadButton'] ? this.data['adminManageCashHistoryDownloadButton'] : false,

      
      thirdPartiesSection: this.data['thirdPartiesSection'] ? this.data['thirdPartiesSection'] : false,
      thirdPartiesCustomers: this.data['thirdPartiesCustomers'] ? this.data['thirdPartiesCustomers'] : false,
      thirdPartiesCustomersCreateAction: this.data['thirdPartiesCustomersCreateAction'] ? this.data['thirdPartiesCustomersCreateAction'] : false,
      thirdPartiesCustomersEditAction: this.data['thirdPartiesCustomersEditAction'] ? this.data['thirdPartiesCustomersEditAction'] : false,
      thirdPartiesCustomersDeleteAction: this.data['thirdPartiesCustomersDeleteAction'] ? this.data['thirdPartiesCustomersDeleteAction'] : false,
      thirdPartiesCustomersContactsAction: this.data['thirdPartiesCustomersContactsAction'] ? this.data['thirdPartiesCustomersContactsAction'] : false,

      
      thirdPartiesProviders: this.data['thirdPartiesProviders'] ? this.data['thirdPartiesProviders'] : false,
      thirdPartiesProvidersCreateAction: this.data['thirdPartiesProvidersCreateAction'] ? this.data['thirdPartiesProvidersCreateAction'] : false,
      thirdPartiesProvidersEditAction: this.data['thirdPartiesProvidersEditAction'] ? this.data['thirdPartiesProvidersEditAction'] : false,
      thirdPartiesProvidersDeleteAction: this.data['thirdPartiesProvidersDeleteAction'] ? this.data['thirdPartiesProvidersDeleteAction'] : false,
      thirdPartiesProvidersAccountsAction: this.data['thirdPartiesProvidersAccountsAction'] ? this.data['thirdPartiesProvidersAccountsAction'] : false,
      thirdPartiesProvidersContactsAction: this.data['thirdPartiesProvidersContactsAction'] ? this.data['thirdPartiesProvidersContactsAction'] : false,

      
      configurationSection: this.data['configurationSection'] ? this.data['configurationSection'] : false,
      configurationUsers: this.data['configurationUsers'] ? this.data['configurationUsers'] : false,

    });

    this.fillingSelections();

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

  fillingSelections(): void {
    this.kitchenKeys.forEach(key => {
      if (this.data[key['value']]) {
        this.kitchenSelection.toggle(key['value']);
      }
    })

    if (this.kitchenSelection.selected.length) {
      this.permitsConfigurationFormGroup.get('kitchenSection').setValue(true);
    }

    this.warehouseKeys.forEach(key => {
      if (this.data[key['value']]) {
        this.warehouseSelection.toggle(key['value']);
      }
    })

    if (this.warehouseSelection.selected.length) {
      this.permitsConfigurationFormGroup.get('warehouseSection').setValue(true);
    }

    this.salesKeys.forEach(key => {
      if (this.data[key['value']]) {
        this.salesSelection.toggle(key['value']);
      }
    })

    if (this.salesSelection.selected.length) {
      this.permitsConfigurationFormGroup.get('salesSection').setValue(true);
    }

    this.adminKeys.forEach(key => {
      if (this.data[key['value']]) {
        this.adminSelection.toggle(key['value']);
      }
    })

    if (this.adminSelection.selected.length) {
      this.permitsConfigurationFormGroup.get('adminSection').setValue(true);
    }

    this.thirdPartiesKeys.forEach(key => {
      if (this.data[key['value']]) {
        this.thirdPartiesSelection.toggle(key['value']);
      }
    })

    if (this.thirdPartiesSelection.selected.length) {
      this.permitsConfigurationFormGroup.get('thirdPartiesSection').setValue(true);
    }

    this.configurationKeys.forEach(key => {
      if (this.data[key['value']]) {
        this.configurationSelection.toggle(key['value']);
      }
    })

    if (this.configurationSelection.selected.length) {
      this.permitsConfigurationFormGroup.get('configurationSection').setValue(true);
    }

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

  edit(): void {
    let _permits = this.permitsConfigurationFormGroup.value;

    _permits['name'] = this.detailsFormGroup.value['name'];
    _permits['id'] = this.data['id'];
    _permits['editedAt'] = Date.now();
    _permits['createdAt']=this.data['createdAt'];

    _permits['kitchenSection'] = this.kitchenSelection.selected.length > 0 ? true : false;
    _permits['warehouseSection'] = this.warehouseSelection.selected.length > 0 ? true : false;
    _permits['salesSection'] = this.salesSelection.selected.length > 0 ? true : false;
    _permits['adminSection'] = this.adminSelection.selected.length > 0 ? true : false;
    _permits['thirdPartiesSection'] = this.thirdPartiesSelection.selected.length > 0 ? true : false;
    _permits['configurationSection'] = this.configurationSelection.selected.length > 0 ? true : false;
    
    this.dbs.permitsCollection
      .doc(this.data['id'])
      .set(_permits)
      .then(() => {
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
