import { Component, OnInit, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DatabaseService } from 'src/app/core/database.service';
import { MatSnackBar, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-stocktaking-delete-confirm',
  templateUrl: './stocktaking-delete-confirm.component.html',
  styles: []
})
export class StocktakingDeleteConfirmComponent implements OnInit {

  loading = new BehaviorSubject<number>(1);
  loading$ = this.loading.asObservable();

  constructor(
    public dbs: DatabaseService,
    private snackbar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { id: string, name: string, type: string },
    private dialogRef: MatDialogRef<StocktakingDeleteConfirmComponent>,
    private af: AngularFirestore
  ) { }

  ngOnInit() {
  }

  delete(): void {
    this.loading.next(2);

    const batch = this.af.firestore.batch();

    let typ;

    switch (this.data.type) {
      case 'INSUMOS':
        typ = 'warehouseInputs';
        break;
      case 'MENAJES':
        typ = 'warehouseHousehold';
        break;
      case 'OTROS':
        typ = 'warehouseGrocery';
        break;
      case 'POSTRES':
        typ = 'warehouseDesserts';
        break;

    }

    const itemDocument = this.af.firestore.doc(`db/deliciasTete/${typ}/${this.data.id}`);

    // deleting request in ssgg collection
    batch.delete(itemDocument);

    batch.commit()
      .then(() => {
        this.loading.next(3);
        this.snackbar.open('Item borrado exitosamente!', 'Aceptar', {
          duration: 6000
        });
        this.dialogRef.close(true);
      })
      .catch(err => {
        console.log(err);
        this.loading.next(1);
        this.snackbar.open('Parece que hubo un error accediendo a la base de datos!', 'Aceptar', {
          duration: 6000
        });
      })

  }

}
