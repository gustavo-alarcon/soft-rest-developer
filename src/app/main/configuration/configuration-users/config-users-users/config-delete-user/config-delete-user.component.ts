import { Component, OnInit, Inject } from '@angular/core';
import { DatabaseService } from 'src/app/core/database.service';
import { HttpClient } from '@angular/common/http';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-config-delete-user',
  templateUrl: './config-delete-user.component.html',
  styles: []
})
export class ConfigDeleteUserComponent implements OnInit {

  uploading: boolean = false;

  httpOptions;
  _data;

  constructor(
    public dbs: DatabaseService,
    private http: HttpClient,
    public dialogRef: MatDialogRef<ConfigDeleteUserComponent>,
    private snackbar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
  }

  delete(): void {
    this.uploading = true;

    this.http.post(`https://us-central1-soft-rest-developer.cloudfunctions.net/msDeleteUser/?uid=${this.data['uid']}`
      , this._data
      , this.httpOptions)
      .subscribe(res => {
        if (res['result'] === "ERROR") {
          switch (res['code']) {
            case "auth/email-already-exists":
              this.snackbar.open("Error: Este correo ya existe", "Cerrar", {
                duration: 6000
              });
              this.uploading = false;
              break;

            default:
              break;
          }
        }

        if (res['result'] === "OK") {

          this.dbs.usersCollection
            .doc(this.data['uid'])
            .delete()
            .then(() => {
              this.uploading = false;
              this.snackbar.open("Listo!", "Cerrar", {
                duration: 6000
              });
              this.dialogRef.close(true);
            })
            .catch(err => {
              this.uploading = false;
              console.log(err);
              this.snackbar.open("Ups..Parece que hubo un error actualizando la información de usuario", "Cerrar", {
                duration: 6000
              });
            })
        }
      })
  }

}
