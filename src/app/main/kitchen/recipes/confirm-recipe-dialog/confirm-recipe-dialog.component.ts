import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormControl } from '@angular/forms';
@Component({
  selector: 'app-confirm-recipe-dialog',
  templateUrl: './confirm-recipe-dialog.component.html',
  styleUrls: ['./confirm-recipe-dialog.component.css']
})
export class ConfirmRecipeDialogComponent implements OnInit {
  lastObservation: FormControl;


  constructor(
    public dialogRef: MatDialogRef<ConfirmRecipeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      warning: string, 
      content: string,
      title: string,
      titleIcon: string}
  ) { }

  ngOnInit() {
    //Observation
    //this.lastObservation = new FormControl(this.data.observation);
  }


  action(action: string){
    this.dialogRef.close({
      action: action,
    });
  }


}