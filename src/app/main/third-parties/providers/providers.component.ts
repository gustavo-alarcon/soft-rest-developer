import { Component, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { FormControl } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatDialog } from '@angular/material';
import { Provider } from "../../../core/models/third-parties/provider.model";
import { map, startWith, debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { DatabaseService } from 'src/app/core/database.service';
import { AuthService } from 'src/app/core/auth.service';
import { ProvidersBanksDialogComponent } from './providers-banks-dialog/providers-banks-dialog.component';
import { ProvidersContactsDialogComponent } from './providers-contacts-dialog/providers-contacts-dialog.component';
import { ProvidersEditDialogComponent } from './providers-edit-dialog/providers-edit-dialog.component';
import { ProvidersDeleteConfirmComponent } from './providers-delete-confirm/providers-delete-confirm.component';
import { CreateProviderDialogComponent } from './create-provider-dialog/create-provider-dialog.component';

@Component({
  selector: 'app-providers',
  templateUrl: './providers.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProvidersComponent implements OnInit {

  loadingProviders = new BehaviorSubject(false);
  loadingProviders$ = this.loadingProviders.asObservable();

  filterFormControl = new FormControl();

  displayedColumns: string[] = ['index', 'name', 'ruc', 'address', 'phone', 'detractionAccount', 'bankAccounts', 'contact', 'createdBy','editedBy', 'actions'];


  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator, { static: false }) set content(paginator: MatPaginator) {
    this.dataSource.paginator = paginator;
  }

  providers$: Observable<Provider[]>;

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {

    this.providers$ =
      combineLatest(
        this.observeProviders(),
        this.filterFormControl.valueChanges.pipe(startWith<any>(''), debounceTime(300), distinctUntilChanged())
      ).pipe(
        map(([providers, filterKey]) => {
          const list = providers.filter(option => option.ruc.toString().includes(filterKey));

          const filteredList = list;
          this.dataSource.data = filteredList;

          return filteredList;
        })
      )
  }

  observeProviders(): Observable<Provider[]> {
    this.loadingProviders.next(true);

    return this.dbs.getProviders()
      .pipe(
        tap(res => {
          this.loadingProviders.next(false);
        })
      )
  }

  createProvider(): void {
    this.dialog.open(CreateProviderDialogComponent);
  }

  openBankAccounts(provider: Provider): void {
    this.dialog.open(ProvidersBanksDialogComponent, {
      data: {
        provider: provider
      }
    });
  }

  openContactList(provider: Provider): void {
    this.dialog.open(ProvidersContactsDialogComponent, {
      data: {
        provider: provider
      }
    });
  }

  editProvider(provider: Provider): void {
    this.dialog.open(ProvidersEditDialogComponent, {
      data: {
        provider: provider
      }
    });
  }

  deleteProvider(provider: Provider): void {
    this.dialog.open(ProvidersDeleteConfirmComponent, {
      data: {
        provider: provider
      }
    });
  }

}
