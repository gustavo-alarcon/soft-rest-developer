import { map, tap } from 'rxjs/operators';
import { Observable, combineLatest } from 'rxjs';
import { DatabaseService } from 'src/app/core/database.service';
import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-totals',
  templateUrl: './totals.component.html',
  styleUrls: ['./totals.component.css']
})
export class TotalsComponent implements OnInit {

  displayedColumns: string[] = ['fuente', 'import'];

  cash: Array<any>
  income: Array<any>
  expenses: Array<any>


  openingCash$: Observable<any>

  constructor(
    public dbs: DatabaseService,
    @Inject(MAT_DIALOG_DATA) public data
  ) { }

  ngOnInit() {

    this.openingCash$ =
      combineLatest(
        this.dbs.getOpenCash(this.data['id']),
        this.dbs.getTransactions(this.data['id'], this.data['currentOpeningId'])
      ).pipe(
        map(([cashes, transaction]) => {
          let cash = cashes.filter(el => el['id'] == this.data['currentOpeningId'])[0]
          let income = transaction.filter(el => el['type'] == 'Ingreso').filter(el => el['status'] == "PAGADO")
          let expence = transaction.filter(el => el['type'] == 'Egreso').filter(el => el['status'] == "PAGADO")
          this.expenses = [
            {
              item: 'Transferencia',
              amount: expence.filter(el => el['paymentType'] == 'TRANSFERENCIA').map(el => Number(el['amount'])).reduce((a, b) => a + b, 0),
              value: 1
            },
            {
              item: 'Egresos',
              amount: expence.filter(el => el['paymentType'] == 'EFECTIVO').map(el => Number(el['amount'])).reduce((a, b) => a + b, 0),
              value: 1
            }
          ]
          this.income = [
            {
              item: 'Ingreso efectivo',
              amount: income.filter(el => el['paymentType'] == 'EFECTIVO').map(el => Number(el['amount'])).reduce((a, b) => a + b, 0),
              value: 1
            },
            {
              item: 'Tarjeta Visa',
              amount: income.filter(el => el['paymentType'] == 'VISA').map(el => Number(el['amount'])).reduce((a, b) => a + b, 0),
              value: 1
            },
            {
              item: 'Tarjeta Mastercard',
              amount: income.filter(el => el['paymentType'] == 'MASTERCARD').map(el => Number(el['amount'])).reduce((a, b) => a + b, 0),
              value: 1
            }

          ]
          this.cash = [
            {
              item: 'Importe Inicial',
              amount: cash['openingBalance'],
              value: 1
            },
            {
              item: 'Total ingresos',
              amount: income.map(el => Number(el['amount'])).reduce((a, b) => a + b, 0),
              value: 1
            },
            {
              item: 'Egresos',
              amount: expence.map(el => Number(el['amount'])).reduce((a, b) => a + b, 0),
              value: -1
            }

          ]
          return cash
        })
      )

  }

  getTotal(array) {
    return array.map(t => t.amount * t.value).reduce((acc, value) => acc + value, 0);
  }

  onPrintPDF(){
    console.log(this.expenses);
    console.log(this.income);
    console.log(this.cash);

    this.dbs.printCash(this.cash, this.income, this.expenses);
  }

}
