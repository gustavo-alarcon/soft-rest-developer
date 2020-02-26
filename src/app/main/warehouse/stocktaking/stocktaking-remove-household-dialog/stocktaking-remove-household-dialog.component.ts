import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSnackBar, MatDialogRef } from '@angular/material';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { Household } from 'src/app/core/models/warehouse/household.model';
import { DatabaseService } from 'src/app/core/database.service';
import { map, startWith, take } from 'rxjs/operators';
import { AuthService } from 'src/app/core/auth.service';
import { AngularFirestore } from '@angular/fire/firestore';

interface Item {
  id: string;
  name: string;
  unit: string;
  stock: number;
  averageCost: number;
  quantity: number;
  observations: string;
};

@Component({
  selector: 'app-stocktaking-remove-household-dialog',
  templateUrl: './stocktaking-remove-household-dialog.component.html',
  styles: []
})
export class StocktakingRemoveHouseholdDialogComponent implements OnInit {

  savingItems = new BehaviorSubject<boolean>(false);
  savingItems$ = this.savingItems.asObservable();

  dataFormGroup: FormGroup;

  displayedColumns: string[] = ['index', 'item', 'unit', 'stock', 'quantity', 'observations', 'actions'];

  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator, { static: false }) set content(paginator: MatPaginator) {
    this.dataSource.paginator = paginator;
  }

  households$: Observable<Household[]>;

  itemsList: Array<Item> = [];

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    private af: AngularFirestore,
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private dialogRef: MatDialogRef<StocktakingRemoveHouseholdDialogComponent>
  ) { }

  ngOnInit() {
    this.createForm();

    this.households$ = combineLatest(
      this.dbs.getItems('INVENTARIO'),
      this.dataFormGroup.get('household').valueChanges.pipe(
        startWith<any>(''),
        map(household => typeof household === 'string' ? household.toLowerCase() : household.name.toLowerCase())
      )
    ).pipe(
      map(([households, name]) => {
        return name ? households.filter(option => option.name.toLowerCase().includes(name)) : households;
      })
    )
  }

  createForm(): void {
    this.dataFormGroup = this.fb.group({
      household: ['', Validators.required],
      quantity: [null, Validators.required],
      observations: ''
    })
  }

  showHousehold(household: Household): string | null {
    return household ? household.name : null;
  }

  addItem(): void {
    if (this.dataFormGroup.valid) {

      const item = {
        id: this.dataFormGroup.value['household'].id,
        name: this.dataFormGroup.value['household'].name,
        unit: this.dataFormGroup.value['household'].unit,
        stock: this.dataFormGroup.value['household'].stock,
        averageCost: this.dataFormGroup.value['household'].averageCost,
        quantity: this.dataFormGroup.value['quantity'],
        observations: this.dataFormGroup.value['observations']
      }

      if (this.checkDuplicates(item)) {
        this.snackbar.open("Menaje repetido", "Aceptar");
        return;
      }

      if (!this.checkStock(this.dataFormGroup.value['quantity'], this.dataFormGroup.value['household'])) {
        this.snackbar.open("La cantidad no puede ser mayor al stock del menaje", "Aceptar");
        return;
      }

      this.itemsList.push(item);

      this.dataSource.data = this.itemsList;

    } else {
      this.snackbar.open("Complete el formulario", "Aceptar");
    }

  }

  checkDuplicates(item: Item): boolean {
    return !!this.itemsList.filter(option => option.id === item.id).length;
  }

  checkStock(quantity: number, household: Household): boolean {
    return quantity <= household.stock;
  }

  removeItem(id: string): void {
    this.itemsList.splice(this.itemsList.findIndex(option => option.id === id), 1);
    this.dataSource.data = this.itemsList;
  }

  register(): void {
    this.savingItems.next(true);

    this.auth.user$
      .pipe(
        take(1)
      )
      .subscribe(user => {

        const batch = this.af.firestore.batch();

        this.itemsList.forEach(item => {

          const householdRef = this.af.firestore.doc(`db/deliciasTete/warehouseHousehold/${item.id}`);
          const kardexRef = this.af.firestore.collection(`db/deliciasTete/warehouseHousehold/${item.id}/kardex`).doc();

          const householdData = { stock: item.stock - item.quantity };

          const kardexData = {
            id: kardexRef.id,
            details: item.observations ? item.observations : 'Retiro de menaje',
            insQuantity: 0,
            insPrice: 0,
            insTotal: 0,
            outsQuantity: item.quantity,
            outsPrice: item.averageCost,
            outsTotal: item.quantity * item.averageCost,
            balanceQuantity: 0,
            balancePrice: 0,
            balanceTotal: 0,
            type: 'SALIDA', /**@ ENTRADA, SALIDA, INICIAL, REINICIO */
            createdAt: new Date(),
            createdBy: user
          }

          batch.update(householdRef, householdData);
          batch.set(kardexRef, kardexData);

        });

        batch.commit()
          .then(() => {
            this.savingItems.next(false);
            this.snackbar.open('Listo!', 'Aceptar');
            this.dialogRef.close('INVENTARIO');
          })
          .catch(err => {
            console.log(err);
            this.snackbar.open('Parece que hubo un error accediendo a la base de datos.', 'Aceptar');
          })
      })
  }

}
