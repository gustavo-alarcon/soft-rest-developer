import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { BankAccount } from 'src/app/core/models/third-parties/bankAccount.model';
import { Contact } from 'src/app/core/models/third-parties/contact.model';
import { DatabaseService } from 'src/app/core/database.service';
import { AuthService } from 'src/app/core/auth.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { map, tap, debounceTime, take } from 'rxjs/operators';
import { Provider } from 'src/app/core/models/third-parties/provider.model';

@Component({
  selector: 'app-providers-edit-dialog',
  templateUrl: './providers-edit-dialog.component.html',
  styles: []
})
export class ProvidersEditDialogComponent implements OnInit {

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
    private dialogRef: MatDialogRef<ProvidersEditDialogComponent>,
    private snackbar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { provider: Provider }
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
      name: [this.data.provider.name, [Validators.required]],
      ruc: [this.data.provider.ruc, [Validators.required]],
      address: [this.data.provider.address, [Validators.required]],
      phone: this.data.provider.phone,
      detractionAccount: this.data.provider.detractionAccount,
      bank: null,
      type: null,
      accountNumber: null,
      contactName: null,
      contactPhone: null,
      contactMail: null
    });

    this.contactList = this.data.provider.contacts;
    this.bankAccounts = this.data.provider.bankAccounts;
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

      const providerRef = this.af.firestore.doc(this.dbs.providersCollection.ref.path + `/${this.data.provider.id}`);

      this.auth.user$
        .pipe(
          take(1)
        )
        .subscribe(user => {
          const data = {
            name: this.dataFormGroup.value['name'],
            address: this.dataFormGroup.value['address'],
            ruc: this.dataFormGroup.value['ruc'],
            phone: this.dataFormGroup.value['phone'],
            detractionAccount: this.dataFormGroup.value['detractionAccount'],
            contacts: this.contactList,
            bankAccounts: this.bankAccounts,
            editedAt: new Date(),
            editedBy: user,
          }

          batch.update(providerRef, data);

          batch.commit()
            .then(() => {
              this.snackbar.open('Cliente actualizado!', 'Cerrar', {
                duration: 6000
              });
              this.dialogRef.close(true);
            })
            .catch(err => {
              console.log(err);
              this.snackbar.open('Parece que hubo un error accediendo a la base de datos!', 'Cerrar', {
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
