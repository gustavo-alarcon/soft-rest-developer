import { Component, OnInit, Inject } from '@angular/core';
import { Cash } from 'src/app/core/models/sales/cash/cash.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { DatabaseService } from 'src/app/core/database.service';
import { AuthService } from 'src/app/core/auth.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { ManageCashCreateDialogComponent } from '../manage-cash-create-dialog/manage-cash-create-dialog.component';
import { User } from 'src/app/core/models/general/user.model';
import { filter, startWith, map, tap, debounceTime, distinctUntilChanged, take } from 'rxjs/operators';

@Component({
  selector: 'app-manage-cash-edit-dialog',
  templateUrl: './manage-cash-edit-dialog.component.html',
  styles: []
})
export class ManageCashEditDialogComponent implements OnInit {

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
    private snackbar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { cash: Cash }
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
      name: [this.data.cash.name, [Validators.required]],
      supervisor: [this.data.cash.supervisor, [Validators.required]],
      password: [this.data.cash.password, [Validators.required]]
    })
  }

  showUser(user: User): string | null {
    return user ? user.displayName : null;
  }

  save(): void {
    if (this.dataFormGroup.valid) {

      this.savingCash.next(true);

      const batch = this.af.firestore.batch();

      const cashRef = this.af.firestore.doc(this.dbs.cashesCollection.ref.path + `/${this.data.cash.id}`);

      this.auth.user$
        .pipe(
          take(1)
        ).subscribe(user => {

          const data = {
            name: this.dataFormGroup.value['name'].trim(),
            supervisorId: this.dataFormGroup.value['supervisor']['uid'],
            supervisorName: this.dataFormGroup.value['supervisor']['displayName'],
            password: this.dataFormGroup.value['password'].trim(),
            editedAt: new Date(),
            editedBy: user,
          }

          batch.update(cashRef, data);

          batch.commit()
            .then(() => {
              this.savingCash.next(false);
              this.snackbar.open('Caja editada!', 'Aceptar', {
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
