import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatTableDataSource, MatPaginator, MatSnackBar } from '@angular/material';
import { DatabaseService } from 'src/app/core/database.service';
import { CreateNewPromoDialogComponent } from './create-new-promo-dialog/create-new-promo-dialog.component';
import { Observable } from 'rxjs';
import { Promo } from 'src/app/core/models/sales/menu/promo.model';
import { tap } from 'rxjs/operators';
import { FormBuilder, FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';
import * as XLSX from 'xlsx';
import { AuthService } from 'src/app/core/auth.service';

@Component({
  selector: 'app-promos',
  templateUrl: './promos.component.html',
  styleUrls: ['./promos.component.css']
})
export class PromosComponent implements OnInit {
  //Table
  promosTableDataSource= new MatTableDataSource();

  promosTableDisplayedColumns: string[] = [
    'index', 'createdAt', 'name', 'recipesRecipe', 'state', 'dateRange', 'realPrice', 'promoPrice', 'disccount',
    'units', 'soldUnits', 'createdBy', 'actions'
  ]

  promoData$: Observable<Promo[]>;

  filterControl: FormControl = new FormControl()

  //Excel
  headersXlsx: string[] = [
    'Fecha de Creación',
    'Nombre',
    'Productos',
    'Estado',
    'Rango de Fechas',
    'Precio de Venta (S/.)',
    'Precio Promocional (S/.)',
    '% DCTO',
    'Unidades Disponibles',
    'Unidades Vendidas',
    'Creado por:'
  ]

  constructor(
    private dialog: MatDialog,
    private dbs: DatabaseService,
    private snackBar: MatSnackBar,
    public datePipe: DatePipe,
    public auth: AuthService

  ) { }

  @ViewChild('promoTablePaginator', {static: false}) set matPaginator(mp: MatPaginator){
    this.promosTableDataSource.paginator = mp;
  }
  
  ngOnInit() {
    this.promoData$ = this.dbs.onGetOffer().pipe(
      tap(offerList => {
        console.log(offerList);
        this.promosTableDataSource.data = offerList;
      }));
  }

  onCreateNewPromo(){
    this.dialog.open(CreateNewPromoDialogComponent, {
      width: '600px',
      data: null
    })
  }

  onEditPromo(promo: Promo){
    this.dialog.open(CreateNewPromoDialogComponent, {
      width: '600px',
      data: promo
    })
  }

  filter(){
    this.promosTableDataSource.filter = this.filterControl.value;
  }

  formatDate(date: {seconds: number, nanoseconds: number}){
    let t = new Date(1970);
    t.setSeconds(date.seconds);
    return t;
  }

  changeOfferState(promo: Promo, newState: string){
    this.dbs.changeOfferState(promo, newState).subscribe(batch => {
      batch.commit().then(()=> {
        this.snackBar.open('Se cambió el estado satisfactoriamente', 'Aceptar');
      }).catch((err)=> {
        console.log(err);
        this.snackBar.open('No se pudo cambiar el estado. Intentelo nuevamente', 'Aceptar');
      })
    })

  }

  
  downloadXls(): void {
    let table_xlsx: any[] = [];
    let dateRange;
    let availableUnits;
    table_xlsx.push(this.headersXlsx);

    this.promosTableDataSource.data.forEach((element: Promo) => {
      dateRange = element.validityPeriod == 'Indefinido'? 'Indefinido': 
      (this.datePipe.transform(this.getDate(element.dateRange.begin['seconds']), 'dd/MM/yyyy')+ " - " +
        this.datePipe.transform(this.getDate(element.dateRange.end['seconds']), 'dd/MM/yyyy'));

      availableUnits = element.quantity == 'Indefinido' ? 'Indefinido':
        element.units;

      const temp = [
        this.datePipe.transform(this.getDate(element.createdAt['seconds']), 'dd/MM/yyyy'),
        element.name,
        element.products.map(el => el.name).join(', '),
        element.state,
        dateRange,
        element.realPrice.toFixed(2),
        element.price.toFixed(2),
        ((element.realPrice-element.price)/element.realPrice*100.0).toFixed(2),
        element.quantity == 'Definido' ? element.units: 'Ilimitado',
        element.soldUnits,
        element.createdBy.displayName
      ];
      table_xlsx.push(temp);
    })

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(table_xlsx);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'promos');

    const name = 'promos.xlsx';

    XLSX.writeFile(wb, name);
  }

  getDate(seconds: number){
    let date = new Date(1970);
    date.setSeconds(seconds);
    return date.valueOf();
  }
}
