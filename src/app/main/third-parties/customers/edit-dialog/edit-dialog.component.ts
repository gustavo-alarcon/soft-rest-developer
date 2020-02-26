import { Component, OnInit, Inject } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Contact } from 'src/app/core/models/third-parties/contact.model';
import { DatabaseService } from 'src/app/core/database.service';
import { AuthService } from 'src/app/core/auth.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { Customer } from 'src/app/core/models/third-parties/customer.model';
import { debounceTime, map, tap, take, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-edit-dialog',
  templateUrl: './edit-dialog.component.html',
  styles: []
})
export class EditDialogComponent implements OnInit {

  dniLoading = new BehaviorSubject(false);
  dniLoading$ = this.dniLoading.asObservable();

  rucLoading = new BehaviorSubject(false);
  rucLoading$ = this.rucLoading.asObservable();

  savingCustomer = new BehaviorSubject(false);
  savingCustomer$ = this.savingCustomer.asObservable();

  dataFormGroup: FormGroup;

  contactsList: Array<Contact> = [];

  type$: Observable<string>;
  dni$: Observable<boolean>;
  ruc$: Observable<boolean>;

  constructor(
    private fb: FormBuilder,
    public dbs: DatabaseService,
    public auth: AuthService,
    private af: AngularFirestore,
    private dialogRef: MatDialogRef<EditDialogComponent>,
    private snackbar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { customer: Customer }
  ) { }

  ngOnInit() {
    this.createForm();

    this.type$ =
      this.dataFormGroup.get('type').valueChanges
        .pipe(
          startWith<any>(this.data.customer.type),
          debounceTime(500),
          map(res => {
            if (res === 'NATURAL') {
              this.dataFormGroup.get('dni').setValidators([Validators.required]);
              this.dataFormGroup.get('name').setValidators([Validators.required]);

              this.dataFormGroup.get('ruc').setValidators([]);
              this.dataFormGroup.get('businessName').setValidators([]);
              this.dataFormGroup.get('businessAddress').setValidators([]);

              // this.dataFormGroup.get('dni').reset();
              // this.dataFormGroup.get('name').reset();
              // this.dataFormGroup.get('ruc').reset();
              // this.dataFormGroup.get('businessName').reset();
              // this.dataFormGroup.get('businessAddress').reset();

            } else {
              this.dataFormGroup.get('dni').setValidators([]);
              this.dataFormGroup.get('name').setValidators([]);

              this.dataFormGroup.get('ruc').setValidators([Validators.required]);
              this.dataFormGroup.get('businessName').setValidators([Validators.required]);
              this.dataFormGroup.get('businessAddress').setValidators([Validators.required]);

              // this.dataFormGroup.get('dni').reset();
              // this.dataFormGroup.get('name').reset();
              // this.dataFormGroup.get('ruc').reset();
              // this.dataFormGroup.get('businessName').reset();
              // this.dataFormGroup.get('businessAddress').reset();

            }

            return res;
          })
        )

    this.dni$ = combineLatest(
      this.dbs.customers$,
      this.dataFormGroup.get('dni').valueChanges.pipe(tap(() => { this.dniLoading.next(true) }), debounceTime(300))
    ).pipe(
      map(([customers, dni]) => {
        const find = customers.filter(option => option.dni === dni);

        if (find.length > 0) {
          this.snackbar.open('El DNI ya existe en el sistema', 'Aceptar', {
            duration: 4000
          });
        }

        this.dniLoading.next(false);

        return !!find.length;
      })
    )

    this.ruc$ = combineLatest(
      this.dbs.customers$,
      this.dataFormGroup.get('ruc').valueChanges.pipe(tap(() => { this.rucLoading.next(true) }), debounceTime(300))
    ).pipe(
      map(([customers, ruc]) => {
        const find = customers.filter(option => option.ruc === ruc);

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
      type: [this.data.customer.type, [Validators.required]],
      dni: this.data.customer.dni,
      name: this.data.customer.name,
      phone: this.data.customer.phone,
      mail: this.data.customer.mail,
      ruc: this.data.customer.ruc,
      businessName: this.data.customer.businessName,
      businessPhone: this.data.customer.businessPhone,
      businessAddress: this.data.customer.businessAddress,
      contacts: this.data.customer.contacts,
      contactName: null,
      contactPhone: null,
      contactMail: null
    });

    this.contactsList = this.data.customer.contacts;
  }

  addContact(): void {
    if (this.dataFormGroup.value['contactName']) {
      const contact = {
        index: this.contactsList.length,
        contactName: this.dataFormGroup.value['contactName'],
        contactPhone: this.dataFormGroup.value['contactPhone'],
        contactMail: this.dataFormGroup.value['contactMail'],
      };

      this.contactsList.push(contact);

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
    this.contactsList.splice(index, 1);

    this.contactsList.forEach((element, index) => {
      element['index'] = index;
    });
  }

  save(): void {
    if (this.dataFormGroup.valid) {
      this.savingCustomer.next(true);

      const batch = this.af.firestore.batch();

      const customerRef = this.af.firestore.doc(this.dbs.customersCollection.ref.path + `/${this.data.customer.id}`);

      let data;

      this.auth.user$
        .pipe(
          take(1)
        )
        .subscribe(user => {
          if (this.dataFormGroup.value['type'] === 'NATURAL') {
            data = {
              type: this.dataFormGroup.value['type'],
              name: this.dataFormGroup.value['name'],
              dni: this.dataFormGroup.value['dni'],
              phone: this.dataFormGroup.value['phone'],
              mail: this.dataFormGroup.value['mail'],
              editedAt: new Date(),
              editedBy: user,
            }
          } else {
            data = {
              type: this.dataFormGroup.value['type'],
              businessName: this.dataFormGroup.value['businessName'],
              businessAddress: this.dataFormGroup.value['businessAddress'],
              ruc: this.dataFormGroup.value['ruc'],
              businessPhone: this.dataFormGroup.value['businessPhone'],
              contacts: this.contactsList,
              editedAt: new Date(),
              editedBy: user,

            }
          }

          console.log(data);
          batch.update(customerRef, data);

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
