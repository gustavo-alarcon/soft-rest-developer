import { take } from 'rxjs/operators';
import { Transaction } from './../../../../core/models/sales/cash/transaction.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { AuthService } from 'src/app/core/auth.service';
import { DatabaseService } from 'src/app/core/database.service';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-remove',
  templateUrl: './remove.component.html',
  styleUrls: ['./remove.component.css']
})
export class RemoveComponent implements OnInit {
  typesExpenses = ['GASTO', 'DEVOLUCIONES', 'PAGO PERSONAL', 'OTROS']
  typesPayment = ['EFECTIVO', 'TRANSFERENCIA']
  users = ['user1', 'user2']

  confirm: boolean = false

  removeForm: FormGroup

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    private af: AngularFirestore,
    private dialog: MatDialogRef<RemoveComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data
  ) { 
    this.dbs.getUsers()
  }

  ngOnInit() {
    this.createForm()
  }

  createForm() {
    if(this.data['edit']){
      this.removeForm = this.fb.group({
        expenses: [this.data['transaction']['amount'], Validators.required],
        typeExpenses: [this.data['transaction']['ticketType'], Validators.required],
        typePayment: [this.data['transaction']['paymentType'], Validators.required],
        description: [this.data['transaction']['description']],
        user: [this.data['transaction']['createdBy'], Validators.required]
      })
    }else{
      this.removeForm = this.fb.group({
        expenses: ['', Validators.required],
        typeExpenses: ['', Validators.required],
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
          type: 'Egreso',
          description: this.removeForm.get('description').value,
          amount: this.removeForm.get('expenses').value,
          status: 'PAGADO',
          ticketType: this.removeForm.get('typeExpenses').value,
          paymentType: this.removeForm.get('typePayment').value,
          editedBy: user,
          editedAt: new Date(),
          createdAt: new Date(),
          createdBy: this.removeForm.get('user').value,
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
          description: this.removeForm.get('description').value,
          amount: this.removeForm.get('expenses').value,
          ticketType: this.removeForm.get('typeExpenses').value,
          paymentType: this.removeForm.get('typePayment').value,
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
