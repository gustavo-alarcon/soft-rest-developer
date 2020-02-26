import { Component, OnInit, Inject } from '@angular/core';
import { BehaviorSubject, Observable, of, combineLatest } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatabaseService } from 'src/app/core/database.service';
import { AuthService } from 'src/app/core/auth.service';
import { MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Ng2ImgMaxService } from 'ng2-img-max';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { startWith, switchMap, distinctUntilChanged, map, tap, debounceTime, take, finalize } from 'rxjs/operators';
import { CostTrend } from 'src/app/core/models/warehouse/costTrend.model';
import { CreateInputDialogComponent } from 'src/app/main/create-input-dialog/create-input-dialog.component';

@Component({
  selector: 'app-stocktaking-edit-dialog',
  templateUrl: './stocktaking-edit-dialog.component.html',
  styles: []
})
export class StocktakingEditDialogComponent implements OnInit {

  savingItem = new BehaviorSubject<boolean>(false);
  savingItem$ = this.savingItem.asObservable();

  nameLoading = new BehaviorSubject<boolean>(false);
  nameLoading$ = this.nameLoading.asObservable();

  nameExist$: Observable<number> = of(0); // 0 -> init, 1 -> exist, 2 -> !exist

  skuLoading = new BehaviorSubject<boolean>(false);
  skuLoading$ = this.skuLoading.asObservable();

  skuExist$: Observable<number> = of(0); // 0 -> init, 1 -> exist, 2 -> !exist

  uploadingImage = new BehaviorSubject<boolean>(false);
  uploadingImage$ = this.uploadingImage.asObservable();

  validUnit$: Observable<boolean>;
  validStock$: Observable<boolean>;
  validEmergencyStock$: Observable<boolean>;
  validCost$: Observable<boolean>;
  validPrice$: Observable<boolean>;
  validData$: Observable<boolean>;

  units$: Observable<{ id: string, unit: string }[]>;
  inputs$: Observable<any>;

  selectedFile = null;
  imageSrc: string | ArrayBuffer;
  resizingImage = new BehaviorSubject<boolean>(false);
  resizingImage$ = this.resizingImage.asObservable();

  uploadPercent: Observable<number>;

  typesList: String[] = ['INSUMOS', 'INVENTARIO', 'POSTRES', 'OTROS'];

  unitAux: { id: string, unit: string };

  inputFormGroup: FormGroup;


  constructor(
    private fb: FormBuilder,
    public dbs: DatabaseService,
    public auth: AuthService,
    private snackbar: MatSnackBar,
    private dialogRef: MatDialogRef<CreateInputDialogComponent>,
    private ng2ImgMax: Ng2ImgMaxService,
    private storage: AngularFireStorage,
    public af: AngularFirestore,
    @Inject(MAT_DIALOG_DATA) public data: { item: any, type: string }
  ) { }

  ngOnInit() {
    this.initForm();

    this.inputs$ =
      this.inputFormGroup.get('type').valueChanges
        .pipe(
          startWith<any>(this.data.type),
          switchMap(type => {
            return this.dbs.getItems(type);
          })
        );

    // name loading, formatting and checking
    this.nameExist$ = combineLatest(
      this.dbs.getItems(this.inputFormGroup.get('type').value),
      this.inputFormGroup.get('name').valueChanges
        .pipe(
          startWith<string>(this.data.item['name']),
          distinctUntilChanged(),
          map(res => {
            return res.trim().replace(/\s+/g, " ");
          }),
          tap(() => {
            this.nameLoading.next(true);
          }),
          debounceTime(500),
        )
    ).pipe(
      map(([inputs, name]) => {
        const exist = inputs.filter(option => option['name'].toLowerCase() === name.toLowerCase());

        this.inputFormGroup.get('name').setValue(name);
        this.nameLoading.next(false);

        let result;

        if (name === '') {
          result = 0;
        } else if (name === this.data.item['name']) {
          result = 2;
        } else {
          result = !!exist.length ? 1 : 2; // exist or not exist
        }

        return result;
      })
    )

    // sku loading, formating and checking
    this.skuExist$ = combineLatest(
      this.inputs$,
      this.inputFormGroup.get('sku').valueChanges
        .pipe(
          startWith<string>(this.data.item['sku']),
          distinctUntilChanged(),
          map(res => {
            return res.trim().replace(/\s/g, "");
          }),
          tap(() => {
            this.skuLoading.next(true);
          }),
          debounceTime(300),
        )
    ).pipe(
      map(([inputs, sku]) => {
        const exist = inputs.filter(option => option['sku'].toLowerCase() === sku.toLowerCase());

        this.inputFormGroup.get('sku').setValue(sku);
        this.skuLoading.next(false);

        let result;

        if (sku === '') {
          result = 0;
        } else if (sku === this.data.item['sku']) {
          result = 2;
        } else {
          result = !!exist.length ? 1 : 2; // exist or not exist
        }

        return result;
      })
    )

    this.units$ = combineLatest(
      this.dbs.onGetUnits(),
      this.inputFormGroup.get('unit').valueChanges
        .pipe(
          startWith<any>(this.data.item['unit']),
          debounceTime(200),
          map(res => {
            return res.trim().replace(/\s+/g, " ");
          })
        )
    ).pipe(
      map(([units, filterKey]) => {
        const key = typeof filterKey === 'string' ? filterKey.toLowerCase() : filterKey.unit.toLowerCase();

        const list = units.filter(option => option.unit.toLowerCase().includes(key));
        this.unitAux = list.length ? list[0] : undefined;

        return key === '' ? units : list;
      })
    )

    this.validUnit$ =
      this.inputFormGroup.get('unit').valueChanges
        .pipe(
          startWith<any>(this.data.item['unit']),
          debounceTime(200),
          distinctUntilChanged(),
          map(res => {
            return res === '' ? false : true;
          })
        )

    this.validStock$ =
      this.inputFormGroup.get('stock').valueChanges
        .pipe(
          startWith<any>(this.data.item['stock']),
          debounceTime(200),
          distinctUntilChanged(),
          map(res => {
            if (res < 0) {
              this.inputFormGroup.get('stock').setValue(0);
            }
            return res < 0 ? false : true;
          })
        )

    this.validEmergencyStock$ =
      this.inputFormGroup.get('emergencyStock').valueChanges
        .pipe(
          startWith<any>(this.data.item['emergencyStock']),
          debounceTime(200),
          distinctUntilChanged(),
          map(res => {
            if (res < 0) {
              this.inputFormGroup.get('emergencyStock').setValue(0);
            }
            return res < 0 ? false : true;
          })
        )

    this.validCost$ =
      this.inputFormGroup.get('cost').valueChanges
        .pipe(
          startWith<any>(this.data.item['averageCost'] ? this.data.item['averageCost'] : this.data.item['cost'], Validators.required),
          debounceTime(200),
          distinctUntilChanged(),
          map(res => {
            if (res < 0) {
              this.inputFormGroup.get('cost').setValue(0);
            }
            return res < 0 ? false : true;
          })
        )

    this.validPrice$ =
      this.inputFormGroup.get('price').valueChanges
        .pipe(
          startWith<any>(this.data.item['price'] ? this.data.item['price'] : 0),
          debounceTime(200),
          distinctUntilChanged(),
          map(res => {
            if (res < 0) {
              this.inputFormGroup.get('price').setValue(0);
            }
            return res < 0 ? false : true;
          })
        )

    this.validData$ = combineLatest(
      this.nameExist$,
      this.skuExist$,
      this.validUnit$,
      // this.validStock$,
      this.validEmergencyStock$,
      this.validCost$,
      this.validPrice$
    ).pipe(
      map(([name, sku, unit, emergencystock, cost, price]) => {
        return ((name === 2) && (sku === 2) && unit && emergencystock && cost && price);
      })
    );

  }

  initForm() {
    console.log(this.data);
    this.inputFormGroup = this.fb.group({
      type: [{ value: this.data.type, disabled: true }, Validators.required],
      name: [this.data.item['name'], Validators.required],
      sku: [this.data.item['sku'], Validators.required],
      unit: [this.data.item['unit'], Validators.required],
      description: this.data.item['description'],
      stock: [{ value: this.data.item['stock'], disabled: true }, Validators.required],
      emergencyStock: [this.data.item['emergencyStock'], Validators.required],
      cost: [this.data.item['averageCost'] ? this.data.item['averageCost'] : this.data.item['cost'], Validators.required], //just for caution
      price: [this.data.item['price'] ? this.data.item['price'] : 0, Validators.required]
    });

    this.imageSrc = this.data.item['picture'];

  }

  onFileSelected(event): void {
    if (event.target.files[0].type === 'image/png' || event.target.files[0].type === 'image/jpeg') {
      this.selectedFile = event.target.files[0];

      if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];

        const reader = new FileReader();
        reader.onload = e => this.imageSrc = reader.result;

        reader.readAsDataURL(file);
      }

      this.resizingImage.next(true);
      this.ng2ImgMax.resizeImage(event.target.files[0], 10000, 426)
        .pipe(
          take(1)
        )
        .subscribe(
          result => {
            this.selectedFile = new File([result], result.name);
            this.resizingImage.next(false);
            // console.log('Oh si!', this.resizingImage);
          },
          error => {
            console.log('😢 Oh no!', error);
            this.resizingImage.next(false);
          }
        );

    } else {
      this.snackbar.open("Seleccione una imagen en formato png o jpeg", "Cerrar", {
        duration: 6000
      })
    }
  }

  edit() {
    this.savingItem.next(true);

    this.auth.user$
      .pipe(
        take(1),
      ).subscribe(user => {
        let batch = this.af.firestore.batch();

        let inputData: any = {
          // id: null,
          name: this.inputFormGroup.value['name'],
          description: this.inputFormGroup.value['description'],
          sku: this.inputFormGroup.value['sku'],
          unit: this.unitAux === undefined ? this.inputFormGroup.value['unit'] : this.unitAux.unit,
          // stock: this.inputFormGroup.value['stock'],
          emergencyStock: this.inputFormGroup.value['emergencyStock'],
          // picture: '',
          status: 'ACTIVO',
          // createdAt: new Date(),
          // createdBy: user,
          editedAt: new Date(),
          editedBy: user
        }

        let typ;

        switch (this.data.type) {
          case 'INSUMOS':
            typ = 'warehouseInputs';
            inputData['averageCost'] = this.inputFormGroup.value['cost'];
            break;
          case 'MENAJES':
            typ = 'warehouseHousehold';
            inputData['averageCost'] = this.inputFormGroup.value['cost'];
            break;
          case 'OTROS':
            typ = 'warehouseGrocery';
            inputData['averageCost'] = this.inputFormGroup.value['cost'];
            inputData['price'] = this.inputFormGroup.value['price'];
            break;
          case 'POSTRES':
            typ = 'warehouseDesserts';
            inputData['averageCost'] = this.inputFormGroup.value['cost'];
            inputData['price'] = this.inputFormGroup.value['price'];
            break;

        }


        //Input
        let inputRef: DocumentReference = this.af.firestore.collection(`/db/deliciasTete/${typ}/`).doc(this.data.item['id']);


        //KitchenUnits
        let kitchenUnitsRef: DocumentReference = this.af.firestore.collection(`/db/deliciasTete/kitchenUnits/`).doc();
        let kitchenUnitsData = {
          unit: this.inputFormGroup.value['unit'],
          id: kitchenUnitsRef.id
        }

        //CostTrend
        let costTrendRef: DocumentReference = this.af.firestore
          .collection(`/db/deliciasTete/${typ}/${inputRef.id}/costTrend`).doc();
        let costTrendData: CostTrend = {
          cost: this.inputFormGroup.value['cost'],
          createdAt: new Date(),
          id: costTrendRef.id
        }

        batch.set(costTrendRef, costTrendData);

        batch.update(inputRef, inputData);

        //if it doesn't have Id, this unit doesnt exist, so we create it
        if (this.unitAux == undefined) {
          batch.set(kitchenUnitsRef, kitchenUnitsData)
        }

        batch.commit()
          .then(() => {

            if (this.selectedFile) {

              this.uploadingImage.next(true);

              const filePath = `/warehouse/${this.inputFormGroup.get('type').value}/${Date.now()}_${this.selectedFile.name}`;
              const fileRef = this.storage.ref(filePath);
              const task = this.storage.upload(filePath, this.selectedFile);

              this.uploadPercent = task.percentageChanges();

              task.snapshotChanges().pipe(
                finalize(() => {
                  fileRef.getDownloadURL()
                    .subscribe(imageURL => {
                      if (imageURL) {

                        const batch = this.af.firestore.batch();

                        batch.update(inputRef, { picture: imageURL });

                        batch.commit()
                          .then(() => {
                            this.uploadingImage.next(false);
                            this.dialogRef.close(this.inputFormGroup.get('type').value);
                            this.snackbar.open('Se creo el insumo exitosamente', 'Aceptar', { duration: 6000 });
                          })
                          .catch(err => {
                            console.log(err);
                          })

                      }
                    })
                })
              ).subscribe()

            } else {

              this.dialogRef.close(this.inputFormGroup.get('type').value);
              this.snackbar.open('Se creo el insumo exitosamente', 'Aceptar', { duration: 6000 });
            }
          })
          .catch(err => {
            console.log(err);
          })


      })
  }

}
