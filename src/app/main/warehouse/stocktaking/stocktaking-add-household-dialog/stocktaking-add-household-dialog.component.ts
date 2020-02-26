import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator } from '@angular/material';
import { Observable, combineLatest } from 'rxjs';
import { Household } from 'src/app/core/models/warehouse/household.model';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { DatabaseService } from 'src/app/core/database.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-stocktaking-add-household-dialog',
  templateUrl: './stocktaking-add-household-dialog.component.html',
  styles: []
})
export class StocktakingAddHouseholdDialogComponent implements OnInit {

  dataFormGroup: FormGroup;

  displayedColumns: string[] = ['index', 'item', 'unit', 'stock', 'quantity', 'obsrvations', 'actions'];

  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator, { static: false }) set content(paginator: MatPaginator) {
    this.dataSource.paginator = paginator;
  }

  households$: Observable<Household[]>;

  itemsList: Array<{
    name: string;
    unit: string;
    stock: number;
    quantity: number;
    observations: string;
  }> = [];

  constructor(
    public dbs: DatabaseService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.createForm();

    this.households$ = combineLatest(
      this.dbs.getItems('MENAJES'),
      this.dataFormGroup.get('household').valueChanges.pipe(
        map(household => typeof household === 'string' ? household.toLowerCase() : household.name.toLowerCase())
      )
    ).pipe(
      map(([households, name]) => {
        return name ? households.filter(option => option.name.toLowerCase.includes(name)) : households;
      })
    )
  }

  createForm(): void {
    this.dataFormGroup = this.fb.group({
      household: ['', Validators.required],
      quantity: [null, Validators.required],
      obsrvations: ''
    })
  }

  addItem(): void {
    // 
  }

  removeItem(): void {
    // 
  }

}
