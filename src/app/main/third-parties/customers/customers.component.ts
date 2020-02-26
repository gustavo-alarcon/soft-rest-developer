import { ReceivableUser } from 'src/app/core/models/admin/receivableUser.model';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog, MatSnackBar } from '@angular/material';
import { Subscription, Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { DatabaseService } from 'src/app/core/database.service';
import { AuthService } from 'src/app/core/auth.service';
import { Customer } from "src/app/core/models/third-parties/customer.model";
import { tap, map, startWith, debounceTime, distinctUntilChanged, take } from 'rxjs/operators';
import { ContactsDialogComponent } from './contacts-dialog/contacts-dialog.component';
import { CreateDialogComponent } from './create-dialog/create-dialog.component';
import { EditDialogComponent } from './edit-dialog/edit-dialog.component';
import { DeleteConfirmComponent } from './delete-confirm/delete-confirm.component';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styles: []
})
export class CustomersComponent implements OnInit {

  loadingCustomers = new BehaviorSubject(false);
  loadingCustomer$ = this.loadingCustomers.asObservable();

  filterFormControl = new FormControl();

  displayedColumns: string[] = ['index', 'name', 'dni', 'phone', 'mail', 'contact', 'createdBy', 'editedBy', 'actions'];


  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator, { static: false }) set content(paginator: MatPaginator) {
    this.dataSource.paginator = paginator;
  }

  customers$: Observable<Customer[]>;

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private af: AngularFirestore
  ) { }

  ngOnInit() {
    this.customers$ =
      combineLatest(
        this.observeCustomer(),
        this.filterFormControl.valueChanges.pipe(startWith<any>(''), debounceTime(300), distinctUntilChanged())
      ).pipe(
        map(([customers, filterKey]) => {
          const list = customers.filter(option => {
            if (option.type === 'NATURAL') {
              return option.dni.toString().includes(filterKey);
            } else {
              return option.ruc.toString().includes(filterKey);
            }
          });

          const filteredList = list;
          this.dataSource.data = filteredList;

          return filteredList;
        })
      )
  }

  observeCustomer(): Observable<Customer[]> {
    this.loadingCustomers.next(true);

    return this.dbs.getCustomers()
      .pipe(
        tap(res => {
          this.loadingCustomers.next(false);
        })
      )
  }

  openContactList(customer: Customer): void {
    this.dialog.open(ContactsDialogComponent, {
      data: {
        customer: customer
      }
    });
  }

  createCustomer(): void {
    this.dialog.open(CreateDialogComponent);
  }

  editCustomer(customer: Customer): void {
    this.dialog.open(EditDialogComponent, {
      data: {
        customer: customer
      }
    });
  }

  deleteCustomer(customer: Customer): void {
    this.dialog.open(DeleteConfirmComponent, {
      data: {
        customer: customer
      }
    });
  }

  onAddReceivableAccount(customer: Customer): void {
    let batch = this.af.firestore.batch();
    let inputRef: DocumentReference = this.af.firestore.collection(`/db/deliciasTete/receivableUsers`).doc();
    let inputData: ReceivableUser;


    let customerRef = this.af.firestore.collection(`/db/deliciasTete/thirdPartiesCustomers`).doc(customer['id']);

    this.auth.user$.pipe(
      take(1))
      .subscribe(user => {
        inputData = {
          id: inputRef.id,
          name: customer['name'] ? customer['name'] : customer['businessName'],
          customerId: customer['id'],
          balance: 0,
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
          this.snackBar.open('Se creo la cuenta por cobrar', 'Aceptar');
        })
          .catch((err) => {
            console.log(err);
            this.snackBar.open('No se pudo crear la cuenta por cobrar. Por favor, vuelva a intentarlo', 'Aceptar');

          })
      })
  }

}
