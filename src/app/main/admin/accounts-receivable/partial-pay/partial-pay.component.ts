import { filter, startWith, map, distinctUntilChanged, debounceTime, take } from 'rxjs/operators';
import { Cash } from './../../../../core/models/sales/cash/cash.model';
import { Observable, combineLatest } from 'rxjs';
import { MatSnackBar, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './../../../../core/auth.service';
import { DatabaseService } from './../../../../core/database.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit, Inject } from '@angular/core';

@Component({
  selector: 'app-partial-pay',
  templateUrl: './partial-pay.component.html',
  styleUrls: ['./partial-pay.component.css']
})
export class PartialPayComponent implements OnInit {

  dataFormGroup: FormGroup;

  paymentTypes = [
    'EFECTIVO',
    'TRANSFERENCIA'
  ]

  cashes$: Observable<Cash[]>;

  currentIndebt: number = 0;
  import$: Observable<boolean>;

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    private af: AngularFirestore,
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private dialogRef: MatDialogRef<PartialPayComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) { }

  ngOnInit() {
    this.createForm()
    
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

    this.import$ = this.dataFormGroup.get('import').valueChanges
      .pipe(
        distinctUntilChanged(),
        debounceTime(300),
        map(res => {
          if (res < 0) {
            this.dataFormGroup.get('import').setValue(0);
            this.snackbar.open(`No puede asignar montos negativos`, 'Aceptar', {
              duration: 6000
            });
            return true;
          } else {
            if (res > this.currentIndebt) {
              this.dataFormGroup.get('import').setValue(this.currentIndebt);
              this.snackbar.open(`El monto máximo a pagar es ${this.currentIndebt}`, 'Aceptar', {
                duration: 6000
              });
              return true;
            }
          }
          return false;

        })
      )
  }

  showCash(cash: Cash): string | null {
    return cash ? cash.name : null;
  }

  createForm(): void {
    this.dataFormGroup = this.fb.group({
      cash: [null, [Validators.required]],
      import: [null, [Validators.required]],
      paymentType: [null, [Validators.required]]
    })
  }

  pay(): void {
    if (this.dataFormGroup.valid) {

      const type = this.dataFormGroup.value['import'] === this.currentIndebt ? 'TOTAL' : 'PARCIAL';

      this.auth.user$
        .pipe(
          take(1)
        ).subscribe(user => {
          if (this.data.debt.payments) {
            this.data.debt.payments.push({
              type: type,
              paymentType: this.dataFormGroup.value['paymentType'],
              amount: this.dataFormGroup.value['import'],
              cashReference: this.dataFormGroup.value['cash'],
              paidBy: user,
              paidAt: new Date()
            });
          } else {
            this.data.debt['payments'] = [{
              type: type,
              paymentType: this.dataFormGroup.value['paymentType'],
              amount: this.dataFormGroup.value['import'],
              cashReference: this.dataFormGroup.value['cash'],
              paidBy: user,
              paidAt: new Date()
            }];
          }

          let data;

          if (this.dataFormGroup.value['import'] === this.currentIndebt) {
            data = {
              payments: this.data.debt.payments,
              paidAmount: this.data.debt.paidAmount + this.dataFormGroup.value['import'],
              indebtAmount: this.data.debt.indebtAmount - this.dataFormGroup.value['import'],
              status: 'Pagado',
              paymentDate: Date.now()
            };
          } else {
            data = {
              payments: this.data.debt.payments,
              paidAmount: this.data.debt.paidAmount + this.dataFormGroup.value['import'],
              indebtAmount: this.data.debt.indebtAmount - this.dataFormGroup.value['import'],
            };
          }

          const batch = this.af.firestore.batch();

          const payableRef = this.af.firestore.doc(this.dbs.payablesCollection.ref.path + `/${this.data.debt.id}`);

          const transactionRef = this.af.firestore.collection(this.dbs.cashesCollection.ref.path + `/${this.dataFormGroup.value['cash'].id}/openings` + `/${this.dataFormGroup.value['cash'].currentOpening}/transactions`).doc();

          batch.update(payableRef, data);

          const transaction = {
            id: transactionRef.id,
            description: `${this.data.debt.provider.name}, ${this.data.debt.documentType} Serie: ${this.data.debt.documentSerial}, Correlativo: ${this.data.debt.documentCorrelative}`,
            amount: this.currentIndebt,
            user: user,
            verified: false,
            status: 'GRABADO',
            ticketType: null,
            paymentType: this.dataFormGroup.value['paymentType'],
            expenseType: null,
            // departureType: this.data.debt.isRawMaterial ? 'MATERIA PRIMA' : 'GASTO',
            originAccount: this.dataFormGroup.value['originAccount'],
            debt: 0,
            editedBy: null,
            editedAt: null,
            approvedBy: null,
            approvedAt: null,
            createdAt: new Date,
            createdBy: user
          }

          batch.set(transactionRef, transaction);

          batch.commit()
            .then(() => {
              this.snackbar.open(`Cuenta ${type === 'TOTAL' ? 'pagada' : 'parcialmente pagada'} con caja : ${this.dataFormGroup.value['cash'].name}.`, 'Aceptar', {
                duration: 15000
              });
              this.dialogRef.close(true);
            })
            .catch(err => {
              this.snackbar.open('Parece que hubo un error accediendo a la base de datos', 'Cerrar', {
                duration: 6000
              });
            })
        })


    }
  }

}
