import { DatabaseService } from './../../../../core/database.service';
import { MatTableDataSource, MatPaginator, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Component, OnInit, ViewChild, Inject } from '@angular/core';

@Component({
  selector: 'app-missing-inputs',
  templateUrl: './missing-inputs.component.html',
  styleUrls: ['./missing-inputs.component.css']
})
export class MissingInputsComponent implements OnInit {
  example = [
    {
      supplie: 'palta',
      unit: 'kilos',
      amount: 2
    },
    {
      supplie: 'cebolla',
      unit: 'kilos',
      amount: 0.5
    },
    {
      supplie: 'Wantan',
      unit: 'unidades',
      amount: 5
    },
    {
      supplie: 'tomate',
      unit: 'unidades',
      amount: 3
    }
  ]

  displayedColumns: string[] = ['index', 'supplie', 'unit', 'amount'];
  dataSource = new MatTableDataSource();


  @ViewChild(MatPaginator, { static: false }) set content(paginator: MatPaginator) {
    this.dataSource.paginator = paginator;
  }


  constructor(
    public dbs: DatabaseService,
    private dialog: MatDialogRef<MissingInputsComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) { }

  ngOnInit() {
    this.dataSource.data = this.data
  }

  print() {
    const title = ['Nro', 'Insumo', 'Medida', 'Cantidad']

    let array = this.data.map((el, index) => {
      return [String(index + 1), el['name'], el['unit'], String(el['missing'] * -1)]
    })

    
    this.dbs.printAnything4Column(title, array)
  }

}
