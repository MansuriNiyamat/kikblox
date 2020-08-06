import {Component, Inject, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {MatDialog, MatDialogRef, MatDialogConfig, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { FormGroup, FormBuilder, FormControl, Validators, FormArray } from '@angular/forms';


@Component({
    selector: 'app-dialog-content-example-dialog',
    templateUrl: 'dialog.component.html',
  })
  export class JSONDialogComponent implements OnInit {
    stateCtrl = new FormControl();
    jsonForm: FormGroup;

    filteredStates: Observable<any>;
    states: any[] = [];
    flag = false;
    newDeviceName = '';
    returnData = {mode: 'new', device: this.newDeviceName};
    constructor( public dialogRef: MatDialogRef<JSONDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any, private formBuilder: FormBuilder) {
        const dialogConfig = new MatDialogConfig();
        this.dialogRef.disableClose = true;
        this.jsonForm = this.formBuilder.group({
          modelJSON: [null],
        });
        this.jsonForm.get('modelJSON').setValue(this.data);
    }

    ngOnInit() {
    }
  
      cancel() {
        this.dialogRef.close();
    }
  }
