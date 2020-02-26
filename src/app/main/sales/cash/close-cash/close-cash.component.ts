import { FormGroup, Validators, FormBuilder, AsyncValidatorFn, AbstractControl } from '@angular/forms';
import { Component, OnInit, Inject } from '@angular/core';
import { take, debounceTime, map, filter } from 'rxjs/operators';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { AuthService } from './../../../../core/auth.service';
import { DatabaseService } from './../../../../core/database.service';
import { MatTableDataSource, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-close-cash',
  templateUrl: './close-cash.component.html',
  styleUrls: ['./close-cash.component.css']
})
export class CloseCashComponent implements OnInit {
  hidePass: boolean = true;
  checked: boolean = false

  bills: Array<any> = [
    {
      name: 'Billete S/. 200',
      value: 200,
      quantity: 2
    },
    {
      name: 'Billete S/. 100',
      value: 100,
      quantity: 0
    },
    {
      name: 'Billete S/. 50',
      value: 50,
      quantity: 0
    },
    {
      name: 'Billete S/. 20',
      value: 20,
      quantity: 1
    },
    {
      name: 'Billete S/. 10',
      value: 10,
      quantity: 1
    },
    {
      name: 'Moneda S/. 5',
      value: 5,
      quantity: 0
    },
    {
      name: 'Moneda S/. 2',
      value: 2,
      quantity: 0
    },
    {
      name: 'Moneda S/. 1',
      value: 1,
      quantity: 0
    },
    {
      name: 'Otras Monedas',
      value: 1,
      quantity: 0
    },

  ]

  closingForm: FormGroup

  cash = null
  balance: number = 0
  transactions = null

  displayedColumns: string[] = ['name', 'quantity', 'total'];
  dataSource = new MatTableDataSource();

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    private fb: FormBuilder,
    private af: AngularFirestore,
    private dialog: MatDialogRef<CloseCashComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) { }

  ngOnInit() {
    this.createForm()
    this.dataSource.data = this.bills
    this.cash = this.data['cash']
    this.balance = this.data['openCash']['openingBalance']
    this.transactions = this.data['transactions']

  }

  createForm() {
    this.closingForm = this.fb.group({
      password: ['', [Validators.required], [this.matchPassword()]],
      amount: ['', Validators.required],
      checked: [false]
    })
  }
  matchPassword(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      return control.valueChanges.pipe(
        debounceTime(500),
        take(1),
        map(pass => {
          return pass !== this.cash.password ? { passValid: true } : null
        })
      );
    }
  }
  close() {
    let batch = this.af.firestore.batch();
    let cashRef: DocumentReference = this.af.firestore.collection(`/db/deliciasTete/cashRegisters/`).doc(this.cash['id']);
    let openingRef: DocumentReference = this.af.firestore.collection(`/db/deliciasTete/cashRegisters/${this.cash['id']}/openings`).doc(this.cash['currentOpeningId']);

    let income = this.transactions.filter(el => el['type'] == 'Ingreso').filter(el => el['status'] == "PAGADO")
    let expence = this.transactions.filter(el => el['type'] == 'Egreso').filter(el => el['status'] == "PAGADO")

    this.auth.user$.pipe(
      take(1))
      .subscribe(user => {
        const openUpdate = {
          closedAt: new Date(),
          closedBy: user,
          closureBalance: this.balance + income.map(el => Number(el['amount'])).reduce((a, b) => a + b, 0) - expence.map(el => Number(el['amount'])).reduce((a, b) => a + b, 0),
          totalAmount: this.balance + income.map(el => Number(el['amount'])).reduce((a, b) => a + b, 0) - expence.map(el => Number(el['amount'])).reduce((a, b) => a + b, 0),
          amountAdded: 0,
          amountWithdrawn: this.closingForm.get('amount').value,
          cashCount: 0,
          totalIncomes: income.map(el => Number(el['amount'])).reduce((a, b) => a + b, 0),
          totalTickets: this.transactions.filter(el => el['description'].split(' ')[0] == 'Venta').length,
          totalDepartures: expence.map(el => Number(el['amount'])).reduce((a, b) => a + b, 0),
          totalTicketsByPaymentType: {
            VISA: income.filter(el => el['paymentType'] == 'VISA').map(el => Number(el['amount'])).reduce((a, b) => a + b, 0),
            MASTERCARD: income.filter(el => el['paymentType'] == 'MASTERCARD').map(el => Number(el['amount'])).reduce((a, b) => a + b, 0),
            EFECTIVO: income.filter(el => el['paymentType'] == 'EFECTIVO').map(el => Number(el['amount'])).reduce((a, b) => a + b, 0),
          },
          totalDeparturesByPaymentType: {
            TRANSFERENCIA: expence.filter(el => el['paymentType'] == 'TRANSFERENCIA').map(el => Number(el['amount'])).reduce((a, b) => a + b, 0),
            EFECTIVO: expence.filter(el => el['paymentType'] == 'EFECTIVO').map(el => Number(el['amount'])).reduce((a, b) => a + b, 0),
          }
        }

        const inputUpdate = {
          open: false,
          currentOwnerName: '',
          currentOwnerId: '',
          currentOpeningId: '',
          lastClosure: new Date()
        }


        batch.update(openingRef, openUpdate)
        batch.update(cashRef, inputUpdate)

        batch.commit().then(() => {
          console.log('open');
          this.dialog.close()
        })
      })

  }

}
