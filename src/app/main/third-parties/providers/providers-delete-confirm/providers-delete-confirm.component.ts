import { Component, OnInit, Inject } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { DatabaseService } from 'src/app/core/database.service';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { Provider } from 'src/app/core/models/third-parties/provider.model';


@Component({
  selector: 'app-providers-delete-confirm',
  templateUrl: './providers-delete-confirm.component.html',
  styles: []
})
export class ProvidersDeleteConfirmComponent implements OnInit {

  uploading: boolean = false;

  flags = {
    deleted: false,
  }

  constructor(
    public dbs: DatabaseService,
    private af: AngularFirestore,
    private dialogRef: MatDialogRef<ProvidersDeleteConfirmComponent>,
    private snackbar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { provider: Provider }
  ) { }

  ngOnInit() {
  }

  delete(): void {
    this.uploading = true;

    const batch = this.af.firestore.batch();

    const providerRef = this.af.firestore.doc(this.dbs.providersCollection.ref.path + `/${this.data.provider.id}`);

    batch.delete(providerRef);

    batch.commit()
      .then(() => {
        this.flags.deleted = true;
        this.uploading = false;
        this.snackbar.open(`${this.data.provider.name} borrado!`, 'Cerrar', {
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
