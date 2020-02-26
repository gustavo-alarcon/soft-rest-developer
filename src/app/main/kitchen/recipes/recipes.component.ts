import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, combineLatest } from 'rxjs';
import { startWith, map, switchMap, tap, debounceTime } from 'rxjs/operators';
import { MatDialog, MatTableDataSource, MatPaginator, MatDialogRef, MatSnackBar } from '@angular/material';
import { CreateNewRecipeDialogComponent } from './create-new-recipe-dialog/create-new-recipe-dialog.component';
import { Recipe } from 'src/app/core/models/kitchen/recipe.model';
import { DatabaseService } from 'src/app/core/database.service';
import { Input } from 'src/app/core/models/warehouse/input.model';
import { EditNewRecipeDialogComponent } from './edit-new-recipe-dialog/edit-new-recipe-dialog.component';
import { ConfirmRecipeDialogComponent } from './confirm-recipe-dialog/confirm-recipe-dialog.component';
import * as XLSX from 'xlsx';
import { AuthService } from 'src/app/core/auth.service';


@Component({
  selector: 'app-recipes',
  templateUrl: './recipes.component.html',
  styleUrls: ['./recipes.component.css']
})
export class RecipesComponent implements OnInit {
  productCategory: Array<string> = [
    'Platos', 'Piqueo', 'Extras', 'Bebidas'
  ]

  //Table
  inputTableDataSource = new MatTableDataSource();
  inputTableDisplayedColumns: string[] = [
    'index', 'name', 'unit', 'quantity'
  ]
  @ViewChild('recipeTablePaginator', {static:false}) set matPaginator(mp: MatPaginator){
    this.inputTableDataSource.paginator = mp;
  };

  searchForm: FormGroup;
  options: string[] = ['One', 'Two', 'Three'];
  filteredOptions: Observable<string[]>;
  availableOptions$: Observable<string | Recipe[]>;
  getRecipe$: Observable<Recipe | string>;
  dialogRef: MatDialogRef<any>

  //Excel
  headersXlsx: string[] = [
    'Insumo',
    'Medida',
    'Cantidad por Ración',
  ]

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private dbs: DatabaseService,
    private snackBar: MatSnackBar,
    public auth: AuthService
  ) { }

  ngOnInit() {
    this.initForm();

    this.availableOptions$ = this.searchForm.get('productName').valueChanges.pipe(
      //First tap to initialize table data
      tap((productName: Recipe | string)=>{
        if(typeof productName=='string'){
          this.inputTableDataSource.data = [];
        }
        else{
          this.inputTableDataSource.data = productName == null ?  [] : productName.inputs;
        }
      }),
      //switchMap to get filtered data of options available
      switchMap((productName)=> {
        return this.dbs.onGetRecipesType(this.searchForm.get('productCategory').value).pipe(
          debounceTime(500), 
          map((recipesList: Recipe[])=> {
            console.log(recipesList);
            return this.filterRecipe(recipesList, this.searchForm.get('productName').value)
          }))
      }));

  }

  

  
  displayFn(input: Input) {
    if (!input) return '';
    return input.name.split('')[0].toUpperCase() + input.name.split('').slice(1).join('').toLowerCase();
  }

  initForm(){
    this.searchForm = this.fb.group({
      productCategory: [null, Validators.required],
      productName: [null, Validators.required]
    });
  }

  onCreateProduct(){
    this.dialog.open(CreateNewRecipeDialogComponent,
      {
        width: '600px'
      });
    console.log('creating');
  }

  onEditRecipe(){
    this.dialogRef = this.dialog.open(EditNewRecipeDialogComponent, {
      data: this.searchForm.get('productName').value,
      width: '600px',
    })
    this.dialogRef.afterClosed().subscribe(res => {this.searchForm.reset()});
  }

  onDeleteRecipe(){
    this.dialogRef = this.dialog.open(ConfirmRecipeDialogComponent,{
      width: '360px',
      maxWidth: '360px',      
      data: {
      warning: `Usted está eliminando la receta.`,
      content: `¿Está seguro de eliminar la receta ${this.searchForm.get('productName').value['name'].bold()}?`,
      title: 'Eliminando Receta',
      titleIcon: 'delete'
    }
  });

  this.dialogRef.afterClosed().subscribe((answer: {action: string, lastObservation: string}) => {
    if(answer != undefined){
      if(answer.action =="cancel"){
        //console.log("cancelled");
      }
      if(answer.action =="confirm"){
        this.dbs.onDeleteRecipe(this.searchForm.get('productName').value).commit().then(()=> {
          this.snackBar.open('La receta se eliminó satisfactoriamente.', 'Aceptar');
          this.searchForm.reset();
        }).catch(() => {
          this.snackBar.open('Ocurrió un error. Vuelva a intentarlo.', 'Aceptar')
        });
      }
    }
    });
  }

  filterRecipe(recipeList: Recipe[], recipeName: Recipe | string){
    if(typeof recipeName != 'string'){
      return recipeList.filter(recipe => recipe.name.toUpperCase().includes(recipeName.name.toUpperCase()))
    }
    else{
      return recipeList.filter(recipe => recipe.name.toUpperCase().includes(recipeName.toUpperCase()))
    }
  }


  _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }


  downloadXls(): void {
    let table_xlsx: any[] = [];

    table_xlsx.push(this.headersXlsx);

    this.inputTableDataSource.data.forEach(element => {
      const temp = [
        element['name'],
        element['unit'],
        element['quantity'],
      ];
      table_xlsx.push(temp);
    })

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(table_xlsx);

    let sheetName = (<string>this.searchForm.get('productName').value['name']).replace(/\s/g, "_");

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Receta de "'+ sheetName +'"');

    const name = 'receta_de_'+sheetName+'.xlsx';

    XLSX.writeFile(wb, name);
  }
}
