import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Transaction } from './../../../../core/models/sales/cash/transaction.model';
import { take } from 'rxjs/operators';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { AuthService } from './../../../../core/auth.service';
import { DatabaseService } from 'src/app/core/database.service';
import { Observable } from 'rxjs';
import { Component, OnInit, Inject } from '@angular/core';
import { User } from 'firebase';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.css']
})
export class AddComponent implements OnInit {
  typesIncome = ['VENTA', 'OTRO']
  typesPayment = ['EFECTIVO', 'TRANSFERENCIA']

  confirm: boolean = false

  addForm: FormGroup

  users$:Observable<any>

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    private af: AngularFirestore,
    private dialog: MatDialogRef<AddComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
  }

  ngOnInit() {
    this.createForm()

    this.users$ = this.dbs.getUsers()
  }

  createForm() {
    if(this.data['edit']){
      this.addForm = this.fb.group({
        income: [this.data['transaction']['amount'], Validators.required],
        typeIncome: [this.data['transaction']['ticketType'], Validators.required],
        typePayment: [this.data['transaction']['paymentType'], Validators.required],
        description: [this.data['transaction']['description']],
        user: [this.data['transaction']['createdBy'], Validators.required]
      })
    }else{
      this.addForm = this.fb.group({
        income: ['', Validators.required],
        typeIncome: ['', Validators.required],
        typePayment: ['', Validators.required],
        description: [''],
        user: ['', Validators.required]
      })
    }
    
  }

  save() {
    let batch = this.af.firestore.batch();
    let inputRef: DocumentReference = this.af.firestore.collection(`/db/deliciasTete/cashRegisters/${this.data['id']}/openings/${this.data['currentOpeningId']}/transactions`).doc();
    let inputData: Transaction;


    this.auth.user$.pipe(
      take(1))
      .subscribe(user => {
        inputData = {
          id: inputRef.id,
          type: 'Ingreso',
          description: this.addForm.get('description').value,
          amount: this.addForm.get('income').value,
          status: 'PAGADO',
          ticketType: this.addForm.get('typeIncome').value,
          paymentType: this.addForm.get('typePayment').value,
          editedBy: user,
          editedAt: new Date(),
          createdAt: new Date(),
          createdBy: this.addForm.get('user').value,
        }

        batch.set(inputRef, inputData);

        batch.commit().then(() => {
          console.log('transaction guardada');
          this.dialog.close()
        })
      })
  }

  edit(){
    let batch = this.af.firestore.batch();
    let inputRef: DocumentReference = this.af.firestore.collection(`/db/deliciasTete/cashRegisters/${this.data['cash']['id']}/openings/${this.data['cash']['currentOpeningId']}/transactions`).doc(this.data['transaction']['id']);
    let inputData;


    this.auth.user$.pipe(
      take(1))
      .subscribe(user => {
        inputData = {
          description: this.addForm.get('description').value,
          amount: this.addForm.get('income').value,
          ticketType: this.addForm.get('typeIncome').value,
          paymentType: this.addForm.get('typePayment').value,
          editedBy: user,
          editedAt: new Date()
        }

        batch.update(inputRef, inputData);

        batch.commit().then(() => {
          console.log('transaction editada');
          this.dialog.close()
        })
      })
  }
}
