import { take } from 'rxjs/operators';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { AuthService } from './../../../../core/auth.service';
import { DatabaseService } from './../../../../core/database.service';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-delete-transaction',
  templateUrl: './delete-transaction.component.html',
  styleUrls: ['./delete-transaction.component.css']
})
export class DeleteTransactionComponent implements OnInit {

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    private af: AngularFirestore,
    private dialog: MatDialogRef<DeleteTransactionComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) { }

  ngOnInit() {
    console.log(this.data);
    
  }
  cancel() {
    let batch = this.af.firestore.batch();
    let transactionRef: DocumentReference = this.af.firestore.collection(`/db/deliciasTete/cashRegisters/${this.data['cash']['id']}/openings/${this.data['cash']['currentOpeningId']}/transactions`).doc(this.data['transaction']['id']);
    let orderRef: DocumentReference = this.af.firestore.collection(`/db/deliciasTete/orders/`).doc(this.data['transaction']['id']);

    let isOrder = this.data['transaction']['description'].split(' ')[0] == 'Venta'
    console.log(isOrder);
    

    this.auth.user$.pipe(
      take(1))
      .subscribe(user => {
        let transactionUpdate = {
          status: 'ANULADO',
          editAt: new Date(),
          editBy: user
        }

        let orderUpdate = {
          orderStatus: 'ANULADO',
          canceledAt: new Date(),
          canceledBy: user
        }

        batch.update(transactionRef, transactionUpdate);

        if(isOrder){
          batch.update(orderRef, orderUpdate);
        }


        batch.commit().then(() => {
          console.log('transaction anulada');
          this.dialog.close()
        })
      })
  }

}
