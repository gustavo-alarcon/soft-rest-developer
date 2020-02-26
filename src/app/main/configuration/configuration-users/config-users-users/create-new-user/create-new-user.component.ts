import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, combineLatest } from 'rxjs';
import { Role } from 'src/app/core/models/general/role.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DatabaseService } from 'src/app/core/database.service';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { filter, startWith, map, tap, take } from 'rxjs/operators';
import { User } from 'src/app/core/models/general/user.model';

@Component({
  selector: 'app-create-new-user',
  templateUrl: './create-new-user.component.html',
  styles: []
})
export class CreateNewUserComponent implements OnInit {

  loading: boolean = false;
  newUserFormGroup: FormGroup;

  personalDataFormGroup: FormGroup;
  jobDataFormGroup: FormGroup;

  now: Date = new Date();
  httpOptions;
  data;
  userEmailResults: Array<User> = [];
  coincidence: boolean = false;
  visibility: string = 'password';

  filteredPermits$: Observable<Role[]>;
  filteredUsers$: Observable<User[]>;
  emailExist$: Observable<boolean>;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    public dbs: DatabaseService,
    public dialogRef: MatDialogRef<CreateNewUserComponent>,
    private snackbar: MatSnackBar
  ) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/form-data'
      })
    };
  }

  ngOnInit() {
    this.createForms();

    this.emailExist$ = combineLatest(
      this.dbs.users$,
      this.personalDataFormGroup.get('email').valueChanges.pipe(
        startWith<any>(''),
        filter(input => input !== null),
        map(value => typeof value === 'string' ? value.toLowerCase() : value.name.toLowerCase()))
    ).pipe(
      map(([users, email]) => {
        this.userEmailResults = users.filter(option =>
          option['email'] === email);
        if (this.userEmailResults.length > 0) {
          return true
        } else {
          return false;
        }
      })
    );

    this.filteredPermits$ = combineLatest(
      this.dbs.permitsList$,
      this.jobDataFormGroup.get('permit').valueChanges.pipe(
        filter(input => input !== null),
        startWith<any>(''),
        map(value => typeof value === 'string' ? value.toLowerCase() : value.name.toLowerCase()))
    ).pipe(
      map(([permits, name]) => {
        return name ? permits.filter(option => option['name'].toLowerCase().includes(name)) : permits;
      })
    );

  }

  createForms(): void {
    this.personalDataFormGroup = this.fb.group({
      name: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', Validators.required],
      phone: '',
      dni: '',
      password: ['', Validators.required],
    })

    this.jobDataFormGroup = this.fb.group({
      jobTitle: ['', Validators.required],
      permit: ['', [Validators.required]]
    })
  }

  showSelectedArea(area): string | undefined {
    return area ? area['name'] : undefined;
  }

  showSelectedSupervisor(supervisor): string | undefined {
    return supervisor ? supervisor['displayName'] : undefined;
  }

  showSelectedPermit(permit): string | undefined {
    return permit ? permit['name'] : undefined;
  }

  toggleVisibility(): void {
    if (this.visibility === 'password') {
      this.visibility = 'text';
    } else if (this.visibility === 'text') {
      this.visibility = 'password';
    }
  }



  create(): void {
    this.loading = true;
    // this.http.post(`https://us-central1-crclajoya.cloudfunctions.net/msCreateUser/?email=${this.newUserFormGroup.value['email']}&displayName=${this.newUserFormGroup.value['name'].split(" ",1)[0] + ', ' + this.newUserFormGroup.value['lastname'].split(" ",1)[0]}&phoneNumber=${this.newUserFormGroup.value['phone']}&password=${this.newUserFormGroup.value['email'].split("@",1)[0] + this.now.getFullYear()}`
    this.http.post(`https://us-central1-soft-rest-developer.cloudfunctions.net/msCreateUser/?email=${this.personalDataFormGroup.value['email']}&displayName=${this.personalDataFormGroup.value['name'].split(" ", 1)[0] + ', ' + this.personalDataFormGroup.value['lastname'].split(" ", 1)[0]}&password=${this.personalDataFormGroup.value['password']}`
      , this.data
      , this.httpOptions)
      .pipe(
        take(1)
      )
      .subscribe(res => {
        if (res['result'] === "ERROR") {
          switch (res['code']) {
            case "auth/email-already-exists":
              this.snackbar.open("Error: Este correo ya existe", "Cerrar", {
                duration: 6000
              });
              this.loading = false;
              break;

            default:
              break;
          }
        }

        if (res['result'] === "OK") {

          let updateData = {
            displayName: this.personalDataFormGroup.value['name'].split(" ", 1)[0] + ', ' + this.personalDataFormGroup.value['lastname'].split(" ", 1)[0],
            name: this.personalDataFormGroup.get('name').value,
            lastname: this.personalDataFormGroup.get('lastname').value,
            email: this.personalDataFormGroup.get('email').value,
            phone: this.personalDataFormGroup.get('phone').value,
            dni: this.personalDataFormGroup.get('dni').value,
            password: this.personalDataFormGroup.get('password').value,
            jobTitle: this.jobDataFormGroup.get('jobTitle').value,
            role: {name: this.jobDataFormGroup.get('permit').value['name']},
            roleId: this.jobDataFormGroup.get('permit').value['id'],
            uid: res['uid'],
            regDate: Date.now(),
            createdAt: new Date(),
          }

          this.dbs.addUser(updateData)
            .then(() => {
              this.loading = false;
              this.dialogRef.close();
              this.snackbar.open("Usuario creado!", "Cerrar");
            })
            .catch(err => {
              console.log(err);
              this.snackbar.open("Ups! parece que hubo un error ...", "Cerrar");
            })
        }

      })
  }

}
