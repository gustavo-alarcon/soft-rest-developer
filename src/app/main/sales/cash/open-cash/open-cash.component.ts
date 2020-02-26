import { CashOpening } from './../../../../core/models/sales/cash/cashOpening.model';
import { take } from 'rxjs/operators';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { AuthService } from './../../../../core/auth.service';
import { DatabaseService } from './../../../../core/database.service';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-open-cash',
  templateUrl: './open-cash.component.html',
  styleUrls: ['./open-cash.component.css']
})
export class OpenCashComponent implements OnInit {

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    private af: AngularFirestore,
    private dialog: MatDialogRef<OpenCashComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) { }

  ngOnInit() {
  }

  open() {
    let batch = this.af.firestore.batch();
    let cashRef: DocumentReference = this.af.firestore.collection(`/db/deliciasTete/cashRegisters/`).doc(this.data['cash']['id']);
    let openingRef: DocumentReference = this.af.firestore.collection(`/db/deliciasTete/cashRegisters/${this.data['cash']['id']}/openings`).doc();


    this.auth.user$.pipe(
      take(1))
      .subscribe(user => {
        let inputData:CashOpening = {
          id: openingRef.id,
          openedBy: user,
          openedAt: new Date(),
          closedBy: null,
          closedAt: null,
          openingBalance: this.data['amount'],
          closureBalance: 0,
          amountAdded: 0,
          amountWithdrawn: 0,
          cashCount: 0,
          totalAmount: 0,
          totalTickets: 0,
          totalDepartures: 0,
          totalTicketsByPaymentType: {
            VISA: 0,
            MASTERCARD: 0,
            EFECTIVO: 0,
          },
          totalDeparturesByPaymentType: {
            TRANSFERENCIA: 0,
            EFECTIVO: 0,
          }
        }

        const inputUpdate = {
          open: true,
          currentOwnerName: user['displayName'],
          currentOwnerId: user['uid'],
          currentOpeningId: openingRef.id,
          lastOpening: new Date()
        }


        batch.set(openingRef, inputData)
        batch.update(cashRef, inputUpdate)

        batch.commit().then(() => {
          console.log('open');
          this.dialog.close()
        })
      })

  }
}
