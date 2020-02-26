import { Component, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatDialog } from '@angular/material';
import { Role } from 'src/app/core/models/general/role.model';
import { FormControl } from '@angular/forms';
// import { SidenavService } from 'src/app/core/sidenav.service';
import { DatabaseService } from 'src/app/core/database.service';
import { combineLatest, Observable } from 'rxjs';
import { filter, startWith, map } from 'rxjs/operators';
import { CreateNewPermitComponent } from './create-new-permit/create-new-permit.component';
import { UsersPermitDialogEditComponent } from './users-permit-dialog-edit/users-permit-dialog-edit.component';
import { UsersPermitConfirmDeleteComponent } from './users-permit-confirm-delete/users-permit-confirm-delete.component';
import { SidenavService } from 'src/app/core/sidenav.service';

@Component({
  selector: 'app-config-users-permits',
  templateUrl: './config-users-permits.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigUsersPermitsComponent implements OnInit {

  formControlSearch = new FormControl();

  displayedColumns: string[] = ['index', 'name', 'edit'];
  dataSource = new MatTableDataSource();

  @ViewChild("permitsPaginator", {static: false}) set content(paginator: MatPaginator) {
    this.dataSource.paginator = paginator;
  }

  filteredPermits$: Observable<any[]>;

  constructor(
    private dialog: MatDialog,
    public sidenav: SidenavService,
    public dbs: DatabaseService
  ) { }

  ngOnInit() {
    this.filteredPermits$ = combineLatest(
      this.dbs.permitsList$,
      this.formControlSearch.valueChanges.pipe(
        startWith<any>(''),
        filter(input => input !== null),
        map(value => typeof value === 'string' ? value.toLowerCase() : value.name.toLowerCase()))
    ).pipe(
      map(([permits, name]) => {
        this.dataSource.data = name ? permits.filter(option => option['name'].toLowerCase().includes(name)) : permits;
        return this.dataSource.data;
      })
    );
  }

  toggleSidenav(): void{
    this.sidenav.sidenavUsers();
  }

  createNewPermit():void {
    this.dialog.open(CreateNewPermitComponent);
  }

  editPermit(permit): void{
    this.dialog.open(UsersPermitDialogEditComponent, {
      data: permit
    })
  }

  deletePermit(permit): void{
    this.dialog.open(UsersPermitConfirmDeleteComponent, {
      data: permit
    })
  }

}
