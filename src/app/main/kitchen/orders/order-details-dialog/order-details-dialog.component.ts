import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource, MatPaginator } from '@angular/material';
import { Order } from 'src/app/core/models/sales/menu/order.model';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-order-details-dialog',
  templateUrl: './order-details-dialog.component.html',
  styleUrls: ['./order-details-dialog.component.css']
})
export class OrderDetailsDialogComponent implements OnInit {
  //Table
  ordersTableDataSource= new MatTableDataSource();

  ordersTableDisplayedColumns: string[] = [
    'index', 'name', 'amount',
  ]

  //Excel
  headersXlsx: string[] = [
    'Nombre',
    'Cantidad',
  ]

  constructor(
    public dialogRef: MatDialogRef<OrderDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Order
  ) { }

  
  ngOnInit() {
    this.ordersTableDataSource.data = this.data.orderList;
    console.log(this.data);
  }

  downloadXls(): void {
    let table_xlsx: any[] = [];
    table_xlsx.push(this.headersXlsx);

    this.ordersTableDataSource.data.forEach((element: Order) => {


      const temp = [
        element['name'],
        element['amount']

      ];
      table_xlsx.push(temp);
    })

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(table_xlsx);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `orden_Nro_${this.data.orderCorrelative}`);

    const name = `orden_Nro_${this.data.orderCorrelative}.xlsx`;

    XLSX.writeFile(wb, name);
  }

}
