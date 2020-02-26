import { MainComponent } from './main.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: 'configuration',
        loadChildren: () => import('./configuration/configuration.module').then(mod => mod.ConfigurationModule)
      },
      {
        path: 'ventas/menu',
        loadChildren: () => import('./sales/menu/menu.module').then(mod => mod.MenuModule)
      },
      {
        path: 'ventas/historial',
        loadChildren: () => import('./sales/sales-record/sales-record.module').then(mod => mod.SalesRecordModule)
      },
      {
        path: 'ventas/caja',
        loadChildren: () => import('./sales/cash/cash.module').then(mod => mod.CashModule)
      },
      {
        path: 'almacen/compras',
        loadChildren: () => import('./warehouse/purchases/purchases.module').then(mod => mod.PurchasesModule)
      },
      {
        path: 'almacen/inventario',
        loadChildren: () => import('./warehouse/stocktaking/stocktaking.module').then(mod => mod.StocktakingModule)
      },
      {
        path: 'cocina/recetas',
        loadChildren: () => import('./kitchen/recipes/recipes.module').then(mod => mod.RecipesModule)
      },
      {
        path: 'cocina/platos',
        loadChildren: () => import('./kitchen/dishes/dishes.module').then(mod => mod.DishesModule)
      },
      {
        path: 'cocina/pedidos',
        loadChildren: () => import('./kitchen/orders/orders.module').then(mod => mod.OrdersModule)
      },
      {
        path: 'cocina/promociones',
        loadChildren: () => import('./kitchen/promos/promos.module').then(mod => mod.PromosModule)
      },
      {
        path: 'cocina/combos',
        loadChildren: () => import('./kitchen/combos/combos.module').then(mod => mod.CombosModule)
      },
      {
        path: 'administrativo/cuentas-por-pagar',
        loadChildren: () => import('./admin/accounts-payable/accounts-payable.module').then(mod => mod.AccountsPayableModule)
      },
      {
        path: 'administrativo/cuentas-por-cobrar',
        loadChildren: () => import('./admin/accounts-receivable/accounts-receivable.module').then(mod => mod.AccountsReceivableModule)
      },
      {
        path: 'administrativo/admin-cajas',
        loadChildren: () => import('./admin/manage-cash/manage-cash.module').then(mod => mod.ManageCashModule)
      },
      {
        path: 'terceros/clientes',
        loadChildren: () => import('./third-parties/customers/customers.module').then(mod => mod.CustomersModule)
      },
      {
        path: 'terceros/proveedores',
        loadChildren: () => import('./third-parties/providers/providers.module').then(mod => mod.ProvidersModule)
      }
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }
