import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatDialog } from '@angular/material';
import { Observable, combineLatest } from 'rxjs';
import { SidenavService } from 'src/app/core/sidenav.service';
import { DatabaseService } from 'src/app/core/database.service';
import { filter, startWith, map, tap } from 'rxjs/operators';
import { CreateNewUserComponent } from './create-new-user/create-new-user.component';
import { ConfigEditUserComponent } from './config-edit-user/config-edit-user.component';
import { ConfigDeleteUserComponent } from './config-delete-user/config-delete-user.component';
import { AuthService } from 'src/app/core/auth.service';
import * as XLSX from 'xlsx';
import { User } from 'src/app/core/models/general/user.model';

@Component({
  selector: 'app-config-users-users',
  templateUrl: './config-users-users.component.html',
  styles: []
})
export class ConfigUsersUsersComponent implements OnInit {

  formControlSearch = new FormControl();

  displayedColumns: string[] = ['index', 'displayName', 'email', 'phone', 'permit', 'jobTitle', 'edit'];
  dataSource = new MatTableDataSource();

  @ViewChild("paginatorUsers", { static: false }) set content(paginator: MatPaginator) {
    this.dataSource.paginator = paginator;
  }

  filteredUsers$: Observable<any[]>;

    //Variables para la creacion de documento de Excel
    headersXlsx: string[] = [
      'N°',
      'Usuario',
      'Correo',
      'Celular',
      'Nivel',
    ]
    data_xls: any[] = [];           //Almacena datos para xls de tabla de rutas
    selected: any;                  //Variable auxiliar usada para almacenar datos JSON de xls

  constructor(
    public sidenav: SidenavService,
    public dbs: DatabaseService,
    public auth: AuthService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.filteredUsers$ = combineLatest(
      this.dbs.users$,
      this.formControlSearch.valueChanges.pipe(
        filter(input => input !== null),
        startWith<any>(''),
        map(value => typeof value === 'string' ? value.toLowerCase() : value.name.toLowerCase()))
    ).pipe(
      map(([users, name]) => {
        this.dataSource.data = name ? users.filter(option => option['displayName'].toLowerCase().includes(name)) : users;
        return this.dataSource.data;
      })
    );
  }

  toggleSidenav(): void {
    this.sidenav.sidenavUsers();
  }

  createNewUser(): void {
    this.dialog.open(CreateNewUserComponent);
  }


  editUser(user): void {
    this.dialog.open(ConfigEditUserComponent, {
      data: user
    })
  }

  deleteUser(user): void {
    this.dialog.open(ConfigDeleteUserComponent, {
      data: user
    })
  }

  downloadXlsUsers(): void {
    let table_xlsx: any[] = [];

    table_xlsx.push(this.headersXlsx);

    this.dataSource.data.forEach((element, index) => {
      const temp = [
        index+1,  
        element['displayName'],
        element['email'],
        element['phone'],
        element['role']['name'],
      ];

      table_xlsx.push(temp);
    })

    /* generate worksheet */
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(table_xlsx);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Destinos');

    /* save to file */
    const name = 'Lista_usuarios' + '.xlsx';
    XLSX.writeFile(wb, name);
  }

}
