import { take } from 'rxjs/operators';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { AuthService } from './../../../../../core/auth.service';
import { DatabaseService } from './../../../../../core/database.service';
import { Component, OnInit, Inject } from '@angular/core';

@Component({
  selector: 'app-to-post',
  templateUrl: './to-post.component.html',
  styleUrls: ['./to-post.component.css']
})
export class ToPostComponent implements OnInit {

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    private af: AngularFirestore,
    private snackBar: MatSnackBar,
    private dialog: MatDialogRef<ToPostComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) { }

  ngOnInit() {
    console.log(this.data);
    
  }

  save(){
    const batch = this.af.firestore.batch();
    this.auth.user$.pipe(
      take(1)
    ).subscribe(user => {
      this.data['menu'].forEach(el => {
        let menuRef: DocumentReference = this.af.firestore.collection(`/db/deliciasTete/kitchenDishes/`).doc(el['dishId']);
        let menuDataUpdate = {
          status: 'DISPONIBLE', // DISPONIBLE, COCINANDO, INACTIVO
          editedAt: new Date,
          editedBy: user,
        }

        batch.update(menuRef, menuDataUpdate)
      })

      let orderRef = this.af.firestore.collection(`/db/deliciasTete/kitchenOrders`).doc(this.data['id']);

      batch.update(orderRef, {
        status: 'publicado'
      })

      batch.commit().then(() => {
        this.snackBar.open('Menú publicado', 'Aceptar', {
          duration: 5000
        });
        this.dialog.close()
      })
    })
  }
}
