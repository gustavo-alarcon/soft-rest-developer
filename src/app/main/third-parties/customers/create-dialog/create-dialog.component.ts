import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription, combineLatest, BehaviorSubject, Observable } from 'rxjs';
import { DatabaseService } from 'src/app/core/database.service';
import { AuthService } from 'src/app/core/auth.service';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { debounceTime, tap, map, filter, take } from 'rxjs/operators';
import { Customer } from 'src/app/core/models/third-parties/customer.model';
import { Contact } from 'src/app/core/models/third-parties/contact.model';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-create-dialog',
  templateUrl: './create-dialog.component.html'
})
export class CreateDialogComponent implements OnInit {

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
    private dialogRef: MatDialogRef<CreateDialogComponent>,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit() {
    this.createForm();

    this.type$ =
      this.dataFormGroup.get('type').valueChanges
        .pipe(
          debounceTime(500),
          map(res => {
            if (res === 'NATURAL') {
              this.dataFormGroup.get('dni').setValidators([Validators.required]);
              this.dataFormGroup.get('name').setValidators([Validators.required]);

              this.dataFormGroup.get('ruc').setValidators([]);
              this.dataFormGroup.get('businessName').setValidators([]);
              this.dataFormGroup.get('businessAddress').setValidators([]);

              this.dataFormGroup.get('dni').reset();
              this.dataFormGroup.get('name').reset();
              this.dataFormGroup.get('ruc').reset();
              this.dataFormGroup.get('businessName').reset();
              this.dataFormGroup.get('businessAddress').reset();

            } else {
              this.dataFormGroup.get('dni').setValidators([]);
              this.dataFormGroup.get('name').setValidators([]);

              this.dataFormGroup.get('ruc').setValidators([Validators.required]);
              this.dataFormGroup.get('businessName').setValidators([Validators.required]);
              this.dataFormGroup.get('businessAddress').setValidators([Validators.required]);

              this.dataFormGroup.get('dni').reset();
              this.dataFormGroup.get('name').reset();
              this.dataFormGroup.get('ruc').reset();
              this.dataFormGroup.get('businessName').reset();
              this.dataFormGroup.get('businessAddress').reset();

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
      type: [null, [Validators.required]],
      dni: null,
      name: null,
      phone: null,
      mail: null,
      ruc: null,
      businessName: null,
      businessPhone: null,
      businessAddress: null,
      contacts: null,
      contactName: null,
      contactPhone: null,
      contactMail: null
    });
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

      const customerRef = this.af.firestore.collection(this.dbs.customersCollection.ref.path).doc();

      let data;

      this.auth.user$
        .pipe(
          take(1)
        )
        .subscribe(user => {
          if (this.dataFormGroup.value['type'] === 'NATURAL') {
            data = {
              id: customerRef.id,
              type: this.dataFormGroup.value['type'],
              name: this.dataFormGroup.value['name'],
              dni: this.dataFormGroup.value['dni'],
              phone: this.dataFormGroup.value['phone'],
              mail: this.dataFormGroup.value['mail'],
              createdAt: new Date(),
              createdBy: user,
              editedBy: null,
              editedDate: null
            }
          } else {
            data = {
              id: customerRef.id,
              type: this.dataFormGroup.value['type'],
              businessName: this.dataFormGroup.value['businessName'],
              businessAddress: this.dataFormGroup.value['businessAddress'],
              ruc: this.dataFormGroup.value['ruc'],
              businessPhone: this.dataFormGroup.value['businessPhone'],
              contacts: this.contactsList,
              createdAt: new Date(),
              createdBy: user,
              editedBy: null,
              editedDate: null
            }
          }

          batch.set(customerRef, data);

          batch.commit()
            .then(() => {
              this.snackbar.open('Cliente creado!', 'Cerrar', {
                duration: 6000
              });
              this.dialogRef.close(true);
            })
            .catch(err => {
              console.log(err);
              this.snackbar.open('Parece que hubo un error creando el nuevo cliente!', 'Cerrar', {
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
