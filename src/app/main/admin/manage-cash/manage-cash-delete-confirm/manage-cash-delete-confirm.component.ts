import { Component, OnInit, Inject } from '@angular/core';
import { DatabaseService } from 'src/app/core/database.service';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { Cash } from 'src/app/core/models/sales/cash/cash.model';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-manage-cash-delete-confirm',
  templateUrl: './manage-cash-delete-confirm.component.html',
  styles: []
})
export class ManageCashDeleteConfirmComponent implements OnInit {

  uploading: boolean = false;

  flags = {
    deleted: false,
  }

  constructor(
    public dbs: DatabaseService,
    private af: AngularFirestore,
    private dialogRef: MatDialogRef<ManageCashDeleteConfirmComponent>,
    private snackbar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { cash: Cash }
  ) { }

  ngOnInit() {
  }

  delete(): void {
    this.uploading = true;

    const batch = this.af.firestore.batch();

    const cashRef = this.af.firestore.doc(this.dbs.cashesCollection.ref.path + `/${this.data.cash.id}`);

    batch.delete(cashRef);

    batch.commit()
      .then(() => {
        this.flags.deleted = true;
        this.uploading = false;
        this.snackbar.open(`Caja ${this.data.cash.name} borrada!`, 'Cerrar', {
          duration: 6000
        });
        this.dialogRef.close(true);
      })
      .catch(err => {
        this.flags.deleted = false;
        this.uploading = false;
        this.snackbar.open(`PArece que hubo un error accediendo a la base de datos!`, 'Cerrar', {
          duration: 6000
        });
      })

  }

}
