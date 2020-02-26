import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { Component, OnInit, Inject } from '@angular/core';

@Component({
  selector: 'app-edit-import',
  templateUrl: './edit-import.component.html',
  styleUrls: ['./edit-import.component.css']
})
export class EditImportComponent implements OnInit {

  edit = new FormControl('')

  constructor(
    private af: AngularFirestore,
    private dialog: MatDialogRef<EditImportComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) { }

  ngOnInit() {
  }

  save() {
    let batch = this.af.firestore.batch();
    let inputRef: DocumentReference = this.af.firestore.collection(`/db/deliciasTete/cashRegisters/${this.data['id']}/openings`).doc(this.data['currentOpeningId']);
    batch.update(inputRef, {
      openingBalance: this.edit.value
    })

    batch.commit().then(()=>{
      this.dialog.close()
    })
  }
}
