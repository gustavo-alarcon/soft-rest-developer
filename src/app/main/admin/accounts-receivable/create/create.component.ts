import { ReceivableUser } from 'src/app/core/models/admin/receivableUser.model';
import { filter, startWith, map, take } from 'rxjs/operators';
import { Observable, combineLatest } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { AuthService } from './../../../../core/auth.service';
import { DatabaseService } from './../../../../core/database.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit {

  createForm: FormGroup
  filteredCustomers$: Observable<any>

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    private af: AngularFirestore,
    private dialog: MatDialogRef<CreateComponent>,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.createForm = this.fb.group({
      user: ['', Validators.required],
      balance: ['']
    })

    this.filteredCustomers$ = combineLatest(
      this.dbs.getCustomers(),
      this.createForm.get('user').valueChanges.pipe(
        filter(input => input !== null),
        startWith<any>(''),
        map(value => typeof value === 'string' ? value.toLowerCase() : value.name.toLowerCase())),
    ).pipe(
      map(([users, name]) => {
        return name ? users.filter(option => option['name'] ? option['name'].toLowerCase().includes(name.toLowerCase()) : option['businessName'].toLowerCase().includes(name.toLowerCase())) : users
      })
    );
  }

  showCustomer(user): string | undefined {
    return user ? user['name'] ? user['name'] : user['businessName'] : undefined;
  }

  save() {
    let customer = this.createForm.get('user').value

    let batch = this.af.firestore.batch();
    
    let inputRef: DocumentReference = this.af.firestore.collection(`/db/deliciasTete/receivableUsers`).doc(customer['id']);
    let inputData: ReceivableUser;

    let customerRef = this.af.firestore.collection(`/db/deliciasTete/thirdPartiesCustomers`).doc(customer['id']);

    this.auth.user$.pipe(
      take(1))
      .subscribe(user => {
        inputData = {
          id: customer['id'],
          name: customer['name'] ? customer['name'] : customer['businessName'],
          customerId: customer['id'],
          balance: this.createForm.get('balance').value ? this.createForm.get('balance').value : 0,
          debt: 0,
          paidAmount: 0,
          indebtAmount: 0,
          createdBy: user,
          createdAt: new Date(),
          editedBy: user,
          editedAt: new Date()
        }

        batch.set(inputRef, inputData);

        batch.update(customerRef, {
          receivableAccount: inputRef.id
        })

        batch.commit().then(() => {
          console.log('cuenta creada');
          this.dialog.close()
        })
      })
  }

}
