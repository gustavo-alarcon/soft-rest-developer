import { Component, OnInit, Inject } from '@angular/core';
import { DatabaseService } from 'src/app/core/database.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { Customer } from 'src/app/core/models/third-parties/customer.model';

@Component({
  selector: 'app-delete-confirm',
  templateUrl: './delete-confirm.component.html',
  styles: []
})
export class DeleteConfirmComponent implements OnInit {

  uploading: boolean = false;

  flags = {
    deleted: false,
  }

  constructor(
    public dbs: DatabaseService,
    private af: AngularFirestore,
    private dialogRef: MatDialogRef<DeleteConfirmComponent>,
    private snackbar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { customer: Customer }
  ) { }

  ngOnInit() {
  }

  delete(): void {
    this.uploading = true;

    const batch = this.af.firestore.batch();

    const documentRef = this.af.firestore.doc(this.dbs.customersCollection.ref.path + `/${this.data.customer.id}`);

    batch.delete(documentRef);

    batch.commit()
      .then(() => {
        this.flags.deleted = true;
        this.uploading = false;
        this.snackbar.open(`${this.data.customer.name} borrado!`, 'Cerrar', {
          duration: 6000
        });
        this.dialogRef.close(true)
      })
      .catch(err => {
        console.log(err);
        this.snackbar.open(`Parece que hubo un error accediendo a la base de datos`, 'Cerrar', {
          duration: 6000
        });
      })

  }
}
