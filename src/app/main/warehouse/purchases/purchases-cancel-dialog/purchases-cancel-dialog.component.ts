import { Component, OnInit, Inject } from '@angular/core';
import { Payable } from 'src/app/core/models/admin/payable.model';
import { MAT_DIALOG_DATA, MatSnackBar, MatDialogRef } from '@angular/material';
import { DatabaseService } from 'src/app/core/database.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-purchases-cancel-dialog',
  templateUrl: './purchases-cancel-dialog.component.html',
  styles: []
})
export class PurchasesCancelDialogComponent implements OnInit {

  loading = new BehaviorSubject<number>(1);
  loading$ = this.loading.asObservable();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Payable,
    private dbs: DatabaseService,
    public snackbar: MatSnackBar,
    private dialogRef: MatDialogRef<PurchasesCancelDialogComponent>
    
  ) { }

  ngOnInit() {
    console.log(this.data);
  }

  async delete(){
    this.loading.next(2);

    let batch = await this.dbs.onDeletePurchase(this.data).toPromise();
    batch.commit()
      .then(() => {
        this.loading.next(3);
        this.snackbar.open('Item anulado exitosamente!', 'Aceptar', {
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
