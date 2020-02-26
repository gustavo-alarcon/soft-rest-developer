import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, combineLatest } from 'rxjs';
import { Role } from 'src/app/core/models/general/role.model';
import { DatabaseService } from 'src/app/core/database.service';
import { HttpClient } from '@angular/common/http';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { filter, startWith, map } from 'rxjs/operators';
import { User } from 'src/app/core/models/general/user.model';

@Component({
  selector: 'app-config-edit-user',
  templateUrl: './config-edit-user.component.html',
  styles: []
})
export class ConfigEditUserComponent implements OnInit {

  loading: boolean = false;
  newUserFormGroup: FormGroup;

  personalDataFormGroup: FormGroup;
  jobDataFormGroup: FormGroup;

  now: Date = new Date();
  httpOptions;
  _data;
  userEmailResults: Array<User> = [];
  coincidence: boolean = false;
  visibility: string = 'password';

  filteredPermits$: Observable<Role[]>;
  filteredUsers$: Observable<User[]>;
  emailExist$: Observable<boolean>;

  constructor(
    private fb: FormBuilder,
    public dbs: DatabaseService,
    private http: HttpClient,
    public dialogRef: MatDialogRef<ConfigEditUserComponent>,
    private snackbar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.createForms();
    
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

  createForms(): void{

    this.personalDataFormGroup = this.fb.group({
      name: [this.data['name'], Validators.required],
      lastname: [this.data['lastname'], Validators.required],
      email: [this.data['email'], Validators.required],
      phone: this.data['phone'],
      dni: this.data['dni'],
      password: [this.data['password'], Validators.required],
    })

    this.jobDataFormGroup = this.fb.group({
      jobTitle: [this.data['jobTitle'], Validators.required],
      permit: [this.data['role'], [Validators.required]]
    })
  }

  showSelectedArea(area): string | undefined {
    return area? area['name'] : undefined;
  }

  showSelectedSupervisor(supervisor): string | undefined {
    return supervisor? supervisor['displayName'] : undefined;
  }

  showSelectedPermit(permit): string | undefined {
    return permit? permit['name'] : undefined;
  }

  toggleVisibility(): void{
    if(this.visibility === 'password'){
      this.visibility = 'text';
    }else if(this.visibility === 'text'){
      this.visibility = 'password';
    }
  }

  edit(): void{
    this.loading = true;
    // this.http.post(`https://us-central1-crclajoya.cloudfunctions.net/msCreateUser/?email=${this.newUserFormGroup.value['email']}&displayName=${this.newUserFormGroup.value['name'].split(" ",1)[0] + ', ' + this.newUserFormGroup.value['lastname'].split(" ",1)[0]}&phoneNumber=${this.newUserFormGroup.value['phone']}&password=${this.newUserFormGroup.value['email'].split("@",1)[0] + this.now.getFullYear()}`
    this.http.post(`https://us-central1-soft-rest-developer.cloudfunctions.net/msUpdateUser/?uid=${this.data['uid']}&email=${this.personalDataFormGroup.value['email']}&displayName=${this.personalDataFormGroup.value['name'].split(" ",1)[0] + ', ' + this.personalDataFormGroup.value['lastname'].split(" ",1)[0]}&password=${this.personalDataFormGroup.value['password']}`
    ,this._data
    ,this.httpOptions)
    .subscribe(res => {
      if(res['result'] === "ERROR"){
        switch (res['code']) {
          case "auth/email-already-exists":
            this.snackbar.open("Error: Este correo ya existe", "Cerrar",{
              duration: 6000
            });
            this.loading = false;
            break;

          case 'auth/phone-number-already-exists':
            this.snackbar.open("Error: El número suminsitrado, ya existe", "Cerrar",{
              duration: 6000
            });
            this.loading = false;
            break;
        
          default:
            break;
        }
      }
      
      if(res['result'] === "OK"){

        let updateData = {
          displayName: this.personalDataFormGroup.value['name'].split(" ",1)[0] + ', ' + this.personalDataFormGroup.value['lastname'].split(" ",1)[0],
          name: this.personalDataFormGroup.get('name').value,
          lastname: this.personalDataFormGroup.get('lastname').value,
          email: this.personalDataFormGroup.get('email').value,
          phone: this.personalDataFormGroup.get('phone').value,
          dni: this.personalDataFormGroup.get('dni').value,
          password: this.personalDataFormGroup.get('password').value,
          jobTitle: this.jobDataFormGroup.get('jobTitle').value,
          role: {name: this.jobDataFormGroup.get('permit').value['name']},
          roleId: this.jobDataFormGroup.get('permit').value['id'],
        }

        this.dbs.usersCollection
        .doc(this.data['uid'])
        .set(updateData, {merge:true})
          .then(() => {
            this.loading = false;
            this.snackbar.open("Listo!","Cerrar",{
              duration: 6000
            });
            this.dialogRef.close(true);
          })
          .catch(err => {
            this.loading = false;
            console.log(err);
            this.snackbar.open("Ups..Parece que hubo un error actualizando la información de usuario","Cerrar",{
              duration: 6000
            });
          })
      }
    })
  }

}
