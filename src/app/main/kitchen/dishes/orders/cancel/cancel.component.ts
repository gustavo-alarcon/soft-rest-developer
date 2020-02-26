import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './../../../../../core/auth.service';
import { DatabaseService } from './../../../../../core/database.service';
import { Component, OnInit, Inject } from '@angular/core';

@Component({
  selector: 'app-cancel',
  templateUrl: './cancel.component.html',
  styleUrls: ['./cancel.component.css']
})
export class CancelComponent implements OnInit {

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    private af: AngularFirestore,
    private dialog: MatDialogRef<CancelComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) { }

  ngOnInit() {
  }

  cancel(){
    const batch = this.af.firestore.batch();

    let orderRef = this.af.firestore.collection(`/db/deliciasTete/kitchenOrders`).doc(this.data['id']);

    batch.update(orderRef, {
      status: 'cancelado'
    })

    batch.commit().then(() => {
      console.log('cancelado');

    })
  }
}
