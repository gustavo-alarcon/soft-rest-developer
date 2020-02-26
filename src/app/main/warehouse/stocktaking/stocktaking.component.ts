import { Component, OnInit, ViewChild, Provider } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { FormControl, FormBuilder } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatDialog } from '@angular/material';
import { DatabaseService } from 'src/app/core/database.service';
import { AuthService } from 'src/app/core/auth.service';
import { startWith, debounceTime, switchMap, map, tap, distinctUntilChanged, take } from 'rxjs/operators';
import { Household } from 'src/app/core/models/warehouse/household.model';
import { StocktakingEditDialogComponent } from './stocktaking-edit-dialog/stocktaking-edit-dialog.component';
import { StocktakingDeleteConfirmComponent } from './stocktaking-delete-confirm/stocktaking-delete-confirm.component';
import { StocktakingKardexDialogComponent } from './stocktaking-kardex-dialog/stocktaking-kardex-dialog.component';
import { StocktakingRemoveHouseholdDialogComponent } from './stocktaking-remove-household-dialog/stocktaking-remove-household-dialog.component';
import { CreateInputDialogComponent } from 'src/app/main/create-input-dialog/create-input-dialog.component';

import * as XLSX from 'xlsx';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-stocktaking',
  templateUrl: './stocktaking.component.html',
  styleUrls: ['./stocktaking.component.css']
})
export class StocktakingComponent implements OnInit {

  loadingItems = new BehaviorSubject<boolean>(false);
  loadingItems$ = this.loadingItems.asObservable();

  itemsTypeFormControl = new FormControl('INSUMOS');
  itemFormControl = new FormControl();
  valoradoFormControl: FormControl = new FormControl(false);

  displayedColumns: string[] = [];

  dataSource = new MatTableDataSource();

  defaultImage = "../../../../assets/images/default-image.jpg";

  

  @ViewChild(MatPaginator, { static: false }) set content(paginator: MatPaginator) {
    this.dataSource.paginator = paginator;
  }

  itemsTypes: Array<string> = [
    'INSUMOS',
    'INVENTARIO',
    'POSTRES',
    'OTROS'
  ];

  items$: Observable<(any)[]>;
  typeAndItems$: Observable<(any)[]>;

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private datePipe: DatePipe,
  ) { }

  ngOnInit() {

    this.typeAndItems$ = combineLatest(this.itemsTypeFormControl.valueChanges.pipe(startWith('INSUMOS')), this.valoradoFormControl.valueChanges.pipe(startWith(false)))
        .pipe(
          debounceTime(300),
          tap(([type, valorado]) => {
            if(valorado){
              if (type === 'INSUMOS' || type === 'INVENTARIO') {
                this.displayedColumns = ['index', 'picture', 'name', 'sku', 'unit', 'stock', 'averageCost', 'totalValue', 'description', 'createdBy', 'editedBy', 'actions'];
              } else if (type === 'POSTRES' || type === 'OTROS') {
                this.displayedColumns = ['index', 'picture', 'name', 'sku', 'unit', 'stock', 'averageCost', 'price', 'totalValue', 'utility', 'description', 'createdBy', 'editedBy', 'actions'];
              }
            }
            else{
              if (type === 'INSUMOS' || type === 'INVENTARIO') {
                this.displayedColumns = ['index', 'picture', 'name', 'sku', 'unit', 'stock', 'description', 'createdBy', 'editedBy', 'actions'];
              } else if (type === 'POSTRES' || type === 'OTROS') {
                this.displayedColumns = ['index', 'picture', 'name', 'sku', 'unit', 'stock', 'description', 'createdBy', 'editedBy', 'actions'];
              }
            }
          }),
          switchMap(([type, valorado]) => {
            return this.observeItems(type);
          })
        );

    this.items$ =
      combineLatest(
        this.typeAndItems$,
        this.itemFormControl.valueChanges.pipe(startWith<any>(''), debounceTime(300), distinctUntilChanged())
      ).pipe(
        map(([items, filterKey]) => {
          const key = filterKey.toLowerCase();

          const list = items.filter(option =>
            option.name.toLowerCase().includes(key) ||
            option.sku.toLowerCase().includes(key)
          );

          this.dataSource.data = key ? list : items;

          return this.dataSource.data;
        })
      )
  }

  observeItems(type: string): Observable<(any)[]> {
    this.loadingItems.next(true);

    return this.dbs.getItems(type)
      .pipe(
        tap(res => {
          this.loadingItems.next(false);
        })
      )
  }

  createItem(): void {
    this.dialog.open(CreateInputDialogComponent)
      .afterClosed()
      .pipe(take(1))
      .subscribe(type => {
        if (type) {
          this.itemsTypeFormControl.setValue(type);
        }
      })
  }

  withdrawHousehold(): void {
    this.dialog.open(StocktakingRemoveHouseholdDialogComponent)
      .afterClosed()
      .pipe(take(1))
      .subscribe(type => {
        if (type) {
          this.itemsTypeFormControl.setValue(type);
        }

      })
  }

  addHousehold(item: Household): void {
    // this.dialog.open()
  }

  kardex(item: any): void {
    this.dialog.open(StocktakingKardexDialogComponent, {
      data: {
        name: item['name'],
        type: this.itemsTypeFormControl.value,
        id: item['id'],
      }
    });
  }

  edit(item: any): void {
    this.dialog.open(StocktakingEditDialogComponent, {
      data: {
        item: item,
        type: this.itemsTypeFormControl.value
      }
    });
  }

  delete(item: any): void {
    this.dialog.open(StocktakingDeleteConfirmComponent, {
      data: {
        id: item['id'],
        name: item['name'],
        type: this.itemsTypeFormControl.value
      }
    });
  }

  downloadXls(): void {
    console.log(this.dataSource.data);
    let table_xlsx: any[] = [];
    let dateRange;

    let headerXlsx = this.valoradoFormControl.value ? 
      [
        'Nombre',
        'SKU',
        'Medida',
        'Stock',
        'Costo promedio',
        'Valor Total',
        'Descripción',
        'Creado por',
        'Editado por'
      ]
      :
      [
        'Nombre',
        'SKU',
        'Medida',
        'Stock',
        'Descripción',
        'Creado por',
        'Editado por'
      ];

    table_xlsx.push(headerXlsx);

    this.dataSource.data.forEach((element) => {

      const temp = this.valoradoFormControl.value ?  
      [
        element['name'],
        element['sku'],
        element['unit'],
        element['stock'],
        element['averageCost'],
        element['averageCost']*element['stock'],
        element['description'],
        element['createdBy']['displayName'],
        !!element['editedBy'] ? element['editedBy']['displayName'] : "",
      ]
        :
      [
        element['name'],
        element['sku'],
        element['unit'],
        element['stock'],
        element['description'],
        element['createdBy']['displayName'],
        !!element['editedBy'] ? element['editedBy']['displayName'] : "",
      ];

      table_xlsx.push(temp);
    })

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(table_xlsx);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'inventario');

    const name = 'inventario.xlsx';

    XLSX.writeFile(wb, name);
  }


}
