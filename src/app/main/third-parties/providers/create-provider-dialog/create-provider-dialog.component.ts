import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BankAccount } from 'src/app/core/models/third-parties/bankAccount.model';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { Contact } from 'src/app/core/models/third-parties/contact.model';
import { DatabaseService } from 'src/app/core/database.service';
import { AuthService } from 'src/app/core/auth.service';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { map, tap, debounceTime, take } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import { Provider } from 'src/app/core/models/third-parties/provider.model';

@Component({
  selector: 'app-create-provider-dialog',
  templateUrl: './create-provider-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateProviderDialogComponent implements OnInit {

  bankList: String[] = [
    'BBVA CONTINENTAL', 'BCP', 'INTERBANK', 'SCOTIABANK', 'CAJA AREQUIPA'
  ]
  bankAccountTypes: String[] = [
    'AHORROS', 'CTA. CORRIENTE'
  ]

  dataFormGroup: FormGroup;

  rucLoading = new BehaviorSubject(false);
  rucLoading$ = this.rucLoading.asObservable();

  savingCustomer = new BehaviorSubject(false);
  savingCustomer$ = this.savingCustomer.asObservable();

  bankAccounts: Array<BankAccount> = [];
  contactList: Array<Contact> = [];

  ruc$: Observable<boolean>;

  constructor(
    private fb: FormBuilder,
    public dbs: DatabaseService,
    public auth: AuthService,
    private af: AngularFirestore,
    private dialogRef: MatDialogRef<CreateProviderDialogComponent>,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit() {
    this.createForm();

    this.ruc$ = combineLatest(
      this.dbs.providers$,
      this.dataFormGroup.get('ruc').valueChanges.pipe(tap(() => { this.rucLoading.next(true) }), debounceTime(300))
    ).pipe(
      map(([providers, ruc]) => {

        const find = providers.filter(option => option.ruc === ruc);

        if (find.length > 0) {
          this.snackbar.open('El RUC ya existe en el sistema', 'Aceptar', {
            duration: 4000
          });
        }

        this.rucLoading.next(false);

        return !!find.length;
      })
    );
  }

  createForm(): void {
    this.dataFormGroup = this.fb.group({
      name: [null, [Validators.required]],
      ruc: [null, [Validators.required]],
      address: [null, [Validators.required]],
      phone: null,
      detractionAccount: null,
      bank: null,
      type: null,
      accountNumber: null,
      contactName: null,
      contactPhone: null,
      contactMail: null
    });
  }

  addContact(): void {
    if (this.dataFormGroup.value['contactName']) {
      const contact = {
        index: this.contactList.length,
        contactName: this.dataFormGroup.value['contactName'],
        contactPhone: this.dataFormGroup.value['contactPhone'],
        contactMail: this.dataFormGroup.value['contactMail'],
      };

      this.contactList.push(contact);

      this.dataFormGroup.get('contactName').reset();
      this.dataFormGroup.get('contactPhone').reset();
      this.dataFormGroup.get('contactMail').reset();

    } else {
      this.snackbar.open('Para agregar un contacto, debes asignar nombres y apellidos', 'Cerrar', {
        duration: 6000
      });
    }
  }

  removeContact(index: number): void {
    this.contactList.splice(index, 1);

    this.contactList.forEach((element, index) => {
      element['index'] = index;
    });
  }

  addBank(): void {
    if (this.dataFormGroup.value['bank'] && this.dataFormGroup.value['type'] && this.dataFormGroup.value['accountNumber']) {
      const bank = {
        index: this.bankAccounts.length,
        bank: this.dataFormGroup.value['bank'],
        type: this.dataFormGroup.value['type'],
        accountNumber: this.dataFormGroup.value['accountNumber'],
      };

      this.bankAccounts.push(bank);

      this.dataFormGroup.get('bank').reset();
      this.dataFormGroup.get('type').reset();
      this.dataFormGroup.get('accountNumber').reset();

    } else {
      this.snackbar.open('Para agregar una cuenta de deposito, debe llenar todos los campos', 'Cerrar', {
        duration: 6000
      });
    }
  }

  removeBank(index: number): void {
    this.bankAccounts.splice(index, 1);

    this.bankAccounts.forEach((element, index) => {
      element['index'] = index;
    });
  }

  save(): void {
    if (this.dataFormGroup.valid) {
      this.savingCustomer.next(true);

      const batch = this.af.firestore.batch();

      const providerRef =this.af.firestore.collection('db/deliciasTete/thirdPartiesProviders').doc();

      this.auth.user$
        .pipe(
          take(1)
        )
        .subscribe(user => {
          const data: Provider = {
            id: providerRef.id,
            name: this.dataFormGroup.value['name'],
            address: this.dataFormGroup.value['address'],
            ruc: this.dataFormGroup.value['ruc'],
            phone: this.dataFormGroup.value['phone'],
            detractionAccount: this.dataFormGroup.value['detractionAccount'],
            contacts: this.contactList,
            bankAccounts: this.bankAccounts,
            createdAt: new Date(),
            createdBy: user
          }

          batch.set(providerRef, data);

          batch.commit()
            .then(() => {
              this.snackbar.open('Proveedor creado!', 'Cerrar', {
                duration: 6000
              });
              this.dialogRef.close(true);
            })
            .catch(err => {
              console.log(err);
              this.snackbar.open('Parece que hubo un error creando el nuevo proveedor!', 'Cerrar', {
                duration: 6000
              });
            });
        })

    } else {
      this.snackbar.open('Debe completar el formulario!', 'Cerrar', {
        duration: 6000
      });
    }
  }

}
