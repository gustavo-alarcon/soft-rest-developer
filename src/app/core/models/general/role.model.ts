export interface Role {
  id: string;
  name: string;
  
  kitchenSection: boolean,
  kitchenCombos: boolean,
  kitchenCombosCreateAction: boolean,
  kitchenCombosDownloadAction: boolean,
  kitchenCombosActions: boolean,

  
  kitchenRecipes: boolean,
  kitchenRecipesCreateAction: boolean,
  kitchenRecipesDownloadAction: boolean,
  kitchenRecipesEditAction: boolean,
  kitchenRecipesDeleteAction: boolean,

  
  kitchenOrders: boolean,
  kitchenOrdersDownloadAction: boolean,
  kitchenOrdersDetailsAction: boolean,

  
  kitchenPromos: boolean,
  kitchenPromosCreateAction: boolean,
  kitchenPromosDownloadAction: boolean,
  kitchenPromosActions: boolean,


  warehouseSection: boolean,
  warehousePurchases: boolean,
  warehousePurchasesRegisterAction: boolean,
  warehousePurchasesDownloadAction: boolean,
  warehousePurchasesCancelAction: boolean,

  
  warehouseStocktaking: boolean,
  warehouseStocktakingCreateAction: boolean,
  warehouseStocktakingRemoveAction: boolean,
  warehouseStocktakingDownloadAction: boolean,
  warehouseStocktakingKardexAction: boolean,
  warehouseStocktakingEditAction: boolean,
  warehouseStocktakingDeleteAction: boolean,


  
  salesSection: boolean,
  salesMenu: boolean,

  
  salesRecord: boolean,
  salesRecordDownloadAction: boolean,
  salesRecordCancelAction: boolean,

  
  salesCash: boolean,
  salesCashCloseAction: boolean,
  salesCashTotalAction: boolean,
  salesCashHistoryAction: boolean,
  salesCashAddMoneyAction: boolean,
  salesCashRetrieveMoneyAction: boolean,
  salesCashConfigurationAction: boolean,
  salesCashDownloadAction: boolean,

  
  adminSection: boolean,
  adminAccountsPayable: boolean,
  adminAccountsPayableListAction: boolean,
  adminAccountsPayablePaysAction: boolean,
  adminAccountsPayableTotalPayAction: boolean,
  adminAccountsPayablePartialPayAction: boolean,

  
  adminAccountsReceivable: boolean,

  
  adminManageCash: boolean,
  adminManageCashCreateAction: boolean,
  adminManageCashEditAction: boolean,
  adminManageCashDeleteAction: boolean,

  
  thirdPartiesSection: boolean,
  thirdPartiesCustomers: boolean,
  thirdPartiesCustomersCreateAction: boolean,
  thirdPartiesCustomersEditAction: boolean,
  thirdPartiesCustomersDeleteAction: boolean,
  thirdPartiesCustomersContactsAction: boolean,

  
  thirdPartiesProviders: boolean,
  thirdPartiesProvidersCreateAction: boolean,
  thirdPartiesProvidersEditAction: boolean,
  thirdPartiesProvidersDeleteAction: boolean,
  thirdPartiesProvidersAccountsAction: boolean,
  thirdPartiesProvidersContactsAction: boolean,

  
  configurationSection: boolean,
  configurationUsers: boolean,
}