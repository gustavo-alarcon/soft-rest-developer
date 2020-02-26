import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatTableDataSource, MatPaginator, MAT_DIALOG_DATA } from '@angular/material';
import { Customer } from 'src/app/core/models/third-parties/customer.model';

@Component({
  selector: 'app-contacts-dialog',
  templateUrl: './contacts-dialog.component.html',
  styles: []
})
export class ContactsDialogComponent implements OnInit {

  displayedColumns: string[] = ['index', 'name', 'phone', 'mail'];
  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { customer: Customer }
  ) { }

  ngOnInit() {
    this.dataSource.data = this.data.customer.contacts;
    this.dataSource.paginator = this.paginator;
  }

}
