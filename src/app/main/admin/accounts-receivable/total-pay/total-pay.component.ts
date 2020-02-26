import { Transaction } from './../../../../core/models/sales/cash/transaction.model';
import { filter, startWith, map, take } from 'rxjs/operators';
import { MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './../../../../core/auth.service';
import { DatabaseService } from 'src/app/core/database.service';
import { Cash } from './../../../../core/models/sales/cash/cash.model';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { Component, OnInit, Inject } from '@angular/core';

@Component({
  selector: 'app-total-pay',
  templateUrl: './total-pay.component.html',
  styleUrls: ['./total-pay.component.css']
})
export class TotalPayComponent implements OnInit {

  savingPayment = new BehaviorSubject<boolean>(false);
  savingPayment$ = this.savingPayment.asObservable();

  dataFormGroup: FormGroup;

  filteredCashList: Observable<Cash[]>;

  paidSum: number = 0;
  currentIndebt: number = 0;

  originAccounts = [
    'CUENTA 1',
    'CUENTA 2',
    'CUENTA 3'
  ]

  paymentTypes = [
    'EFECTIVO',
    'TRANSFERENCIA'
  ]

  cashes$: Observable<Cash[]>;

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    private af: AngularFirestore,
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private dialogRef: MatDialogRef<TotalPayComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) { }


  ngOnInit() {
    this.createForm();
    console.log(this.data);

    this.cashes$ = combineLatest(
      this.dbs.getCashes(),
      this.dataFormGroup.get('cash').valueChanges.pipe(
        filter(input => input !== null),
        startWith<any>(''),
        map(value => typeof value === 'string' ? value.toLowerCase() : value.name.toLowerCase()))
    ).pipe(
      map(([cashes, name]) => {
        return name ? cashes.filter(option => option['name'].toLowerCase().includes(name)) : cashes;
      })
    );
  }

  createForm(): void {
    this.dataFormGroup = this.fb.group({
      cash: [null, [Validators.required]],
      paymentType: [null, [Validators.required]],
      originAccount: null
    })
  }

  getPaymentsSum(debt): number {
    let sum = 0;

    debt.payments.forEach(element => {
      sum += element.amount
    });

    return sum;
  }

  showCash(cash: Cash): string | null {
    return cash ? cash.name : null;
  }

  pay(): void {
    if (this.dataFormGroup.valid) {

      this.savingPayment.next(true);
      const cash = this.dataFormGroup.value['cash']
      this.auth.user$
        .pipe(
          take(1)
        ).subscribe(user => {
          const batch = this.af.firestore.batch();

          const transactionRef = this.af.firestore.collection(`/db/deliciasTete/cashRegisters/${cash['id']}/openings/${cash['currentOpeningId']}/transactions`).doc();

          let transaction: Transaction = {
            id: transactionRef.id,
            type: 'Ingreso',
            description: 'Pago Total de cuenta ' + this.data['name'],
            amount: this.data['indebtAmount'],
            status: 'PAGADO',
            ticketType: null,
            paymentType: this.dataFormGroup.value['paymentType'],
            expenseType: null,
            editedBy: user,
            editedAt: new Date,
            createdAt: new Date,
            createdBy: user
          }

          const receivableUserRef = this.af.firestore.collection(`/db/deliciasTete/receivableUsers`).doc(this.data['id'])

          batch.update(receivableUserRef, {
            indebtAmount: 0,
            paidAmount: this.data['indebtAmount']
          })

          const receivablePayRef = this.af.firestore.collection(`/db/deliciasTete/receivableUsers/${this.data['id']}/payments`).doc(transactionRef.id)

          const data = {
            id: receivablePayRef.id,
            createdAt: new Date,
            createdBy: user,
            paidAmount: this.data['indebtAmount'],
            cash: this.dataFormGroup.value['cash'],
            transactionId: transactionRef.id,
            type: 'Pago Total'
          }

          batch.set(receivablePayRef, data)
          batch.set(transactionRef, transaction)

          this.dbs.getListReceivable(this.data['id']).pipe(
            take(1)
          ).subscribe(res => {
            res.forEach(el => {
              const ref = this.af.firestore.collection(`/db/deliciasTete/receivableUsers/${this.data['id']}/payments`).doc(el.id)
              batch.update(ref, {
                debt: false
              })
            })
          })

          batch.commit()
            .then(() => {
              this.savingPayment.next(false);
              this.snackbar.open(`Cuenta pagada con caja : ${this.dataFormGroup.value['cash'].name}.`, 'Aceptar', {
                duration: 15000
              });
              this.dialogRef.close(true);
            })
            .catch(err => {
              this.savingPayment.next(false);
              this.snackbar.open('Parece que hubo un error accediendo a la base de datos', 'Cerrar', {
                duration: 6000
              });
            })
        })


    }
  }

}
