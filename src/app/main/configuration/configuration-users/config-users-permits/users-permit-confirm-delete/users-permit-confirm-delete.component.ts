import { Component, OnInit, Inject } from '@angular/core';
import { DatabaseService } from 'src/app/core/database.service';
import { HttpClient } from '@angular/common/http';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';


@Component({
  selector: 'app-users-permit-confirm-delete',
  templateUrl: './users-permit-confirm-delete.component.html',
  styles: []
})
export class UsersPermitConfirmDeleteComponent implements OnInit {

  uploading: boolean = false;


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dbs: DatabaseService,
    private snackbar: MatSnackBar,
    public dialogRef: MatDialogRef<UsersPermitConfirmDeleteComponent>
  ) { }

  ngOnInit() {
  }

  save(): void{
    this.uploading = true;

    this.dbs.permitsCollection
      .doc(this.data['id'])
      .delete()
        .then(() => {
          this.uploading = false;
          this.snackbar.open("Listo!","Cerrar",{
            duration: 6000
          });
          this.dialogRef.close(true);
        })
        .catch(err => {
          this.uploading = false;
          console.log(err);
          this.snackbar.open("Ups...Parece que hubo un error borrando el permiso","Cerrar",{
            duration: 6000
          })
        })
  }

}
