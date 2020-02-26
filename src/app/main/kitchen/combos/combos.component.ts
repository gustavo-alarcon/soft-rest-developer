import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatDialog, MatSnackBar, MatPaginator } from '@angular/material';
import { Observable } from 'rxjs';
import { Combo } from 'src/app/core/models/sales/menu/combo.model';
import { FormControl } from '@angular/forms';
import { DatabaseService } from 'src/app/core/database.service';
import { tap } from 'rxjs/operators';
import { CreateNewComboDialogComponent } from './create-new-combo-dialog/create-new-combo-dialog.component';
import * as XLSX from 'xlsx';
import { DatePipe } from '@angular/common';
import { AuthService } from 'src/app/core/auth.service';

@Component({
  selector: 'app-combos',
  templateUrl: './combos.component.html',
  styleUrls: ['./combos.component.css']
})
export class CombosComponent implements OnInit {
  //Table
  combosTableDataSource= new MatTableDataSource();

  combosTableDisplayedColumns: string[] = [
    'index', 'createdAt', 'name', 'recipesRecipe', 'state', 'dateRange', 'price',
    'soldUnits', 'createdBy', 'actions'
  ]

  comboData$: Observable<Combo[]>;

  filterControl: FormControl = new FormControl()

  //Excel
  headersXlsx: string[] = [
    'Fecha de Creación',
    'Nombre',
    'Productos',
    'Estado',
    'Rango de Fechas',
    'Precio real',
    'Precio de venta',
    'Unidades Vendidas',
    'Creado por:'
  ]


  //Paginator
  constructor(
    private dialog: MatDialog,
    private dbs: DatabaseService,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe,
    public auth: AuthService
  ) { }

  @ViewChild('comboTablePaginator', {static: false}) set matPaginator(mp: MatPaginator){
    this.combosTableDataSource.paginator = mp;
  }
  
  ngOnInit() {
    this.comboData$ = this.dbs.onGetCombo().pipe(
      tap(offerList => {
        console.log(offerList);
        this.combosTableDataSource.data = offerList;
        console.log(this.combosTableDataSource.data);
      }));
  }

  onCreateNewCombo(){
    this.dialog.open(CreateNewComboDialogComponent, {
      width: '600px',
      data: null
    })
  }

  onEditCombo(combo: Combo){
    console.log(combo);
    this.dialog.open(CreateNewComboDialogComponent, {
      width: '600px',
      data: combo
    })
  }

  filter(){
    this.combosTableDataSource.filter = this.filterControl.value;
  }

  formatDate(date: {seconds: number, nanoseconds: number}){
    let t = new Date(1970);
    t.setSeconds(date.seconds);
    return t;
  }

  changeComboState(combo: Combo, newState: string){
    this.dbs.changeComboState(combo, newState).subscribe(batch => {
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
    table_xlsx.push(this.headersXlsx);

    this.combosTableDataSource.data.forEach((element: Combo) => {
      dateRange = element.validityPeriod == 'Indefinido'? 'Indefinido': 
      (this.datePipe.transform(this.getDate(element.dateRange.begin['seconds']), 'dd/MM/yyyy')+ " - " +
        this.datePipe.transform(this.getDate(element.dateRange.end['seconds']), 'dd/MM/yyyy'));



      const temp = [
        this.datePipe.transform(this.getDate(element.createdAt['seconds']), 'dd/MM/yyyy'),
        element.name,
        element.products.map(el => el.name).join(', '),
        element.state,
        dateRange,
        'S/.'+element.realPrice.toFixed(2),
        'S/.'+element.price.toFixed(2),
        element.soldUnits,
        element.createdBy.displayName
      ];
      table_xlsx.push(temp);
    })

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(table_xlsx);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'combos');

    const name = 'combos.xlsx';

    XLSX.writeFile(wb, name);
  }

  getDate(seconds: number){
    let date = new Date(1970);
    date.setSeconds(seconds);
    return date.valueOf();
  }
}
