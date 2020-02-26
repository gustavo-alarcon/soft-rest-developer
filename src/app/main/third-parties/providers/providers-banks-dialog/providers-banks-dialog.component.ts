import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatTableDataSource, MatPaginator, MAT_DIALOG_DATA } from '@angular/material';
import { Provider } from 'src/app/core/models/third-parties/provider.model';

@Component({
  selector: 'app-providers-banks-dialog',
  templateUrl: './providers-banks-dialog.component.html',
  styles: []
})
export class ProvidersBanksDialogComponent implements OnInit {

  displayedColumns: string[] = ['index', 'bank', 'type', 'accountNumber'];
  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {provider: Provider}
  ) { }

  ngOnInit() {
    this.dataSource.data = this.data.provider.bankAccounts;
    this.dataSource.paginator = this.paginator;
  }

}
