import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { DatabaseService } from 'src/app/core/database.service';
import { AuthService } from 'src/app/core/auth.service';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { filter, startWith, map, tap, debounceTime, distinctUntilChanged, take } from 'rxjs/operators';
import { User } from 'src/app/core/models/general/user.model';
import { AngularFirestore } from '@angular/fire/firestore';
import { Cash } from 'src/app/core/models/sales/cash/cash.model';

@Component({
  selector: 'app-manage-cash-create-dialog',
  templateUrl: './manage-cash-create-dialog.component.html',
  styles: []
})
export class ManageCashCreateDialogComponent implements OnInit {

  dataFormGroup: FormGroup;

  nameLoading = new BehaviorSubject<boolean>(false);
  nameLoading$ = this.nameLoading.asObservable();

  savingCash = new BehaviorSubject<boolean>(false);
  savingCash$ = this.savingCash.asObservable();

  users$: Observable<User[]>;

  hide: boolean = true;

  constructor(
    private fb: FormBuilder,
    public dbs: DatabaseService,
    public auth: AuthService,
    private af: AngularFirestore,
    private dialogRef: MatDialogRef<ManageCashCreateDialogComponent>,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit() {
    this.createForm();

    this.users$ = combineLatest(
      this.dbs.getUsers(),
      this.dataFormGroup.get('supervisor').valueChanges.pipe(
        filter(input => input !== null),
        startWith<any>(''),
        map(value => typeof value === 'string' ? value.toLowerCase() : value.name.toLowerCase()))
    ).pipe(
      map(([users, name]) => {
        return name ? users.filter(option => option['displayName'].toLowerCase().includes(name)) : users;
      })
    );

    const name$ = combineLatest(
      this.dbs.cashes$,
      this.dataFormGroup.get('name').valueChanges.pipe(startWith<any>(''), tap(() => { this.nameLoading.next(true) }), debounceTime(300), distinctUntilChanged())
    ).pipe(
      map(([cashes, name]) => {
        const find = cashes.filter(option => option.name.toLocaleLowerCase() === name);

        if (find.length > 0) {
          this.snackbar.open('El nombre ya existe en el sitema', 'Aceptar', {
            duration: 4000
          });
        }

        this.nameLoading.next(false);

        return !!find.length;
      })
    );

  }

  createForm(): void {
    this.dataFormGroup = this.fb.group({
      name: [null, [Validators.required]],
      supervisor: [null, [Validators.required]],
      password: [null, [Validators.required]]
    })
  }

  showUser(user: User): string | null {
    return user ? user.displayName : null;
  }

  create(): void {
    if (this.dataFormGroup.valid) {

      this.savingCash.next(true);

      const batch = this.af.firestore.batch();

      const cashRef = this.af.firestore.collection(this.dbs.cashesCollection.ref.path).doc();

      this.auth.user$
        .pipe(
          take(1)
        ).subscribe(user => {

          const data: Cash = {
            id: cashRef.id,
            name: this.dataFormGroup.value['name'].trim(),
            supervisor: this.dataFormGroup.value['supervisor'],
            password: this.dataFormGroup.value['password'].trim(),
            lastOpening: null,
            lastClosure: null,
            currentOwnerName: null,
            currentOwnerId: null,
            currentOpeningId: null,
            open: false,
            createdBy: user,
            createdAt: new Date(),
            editedAt: null,
            editedBy: null,
          }

          batch.set(cashRef, data);

          batch.commit()
            .then(() => {
              this.savingCash.next(false);
              this.snackbar.open('Nueva caja creada!', 'Aceptar', {
                duration: 6000
              });
              this.dialogRef.close(true);
            })
            .catch(err => {
              this.savingCash.next(false);
              this.snackbar.open('Parece que hubo un error conectandonos a la base de datos', 'Cerrar', {
                duration: 6000
              });
              console.log(err);
            })
        })
    }
  }

}
