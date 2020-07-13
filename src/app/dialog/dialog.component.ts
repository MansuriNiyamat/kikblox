import {Component, Inject, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {MatDialog, MatDialogRef, MatDialogConfig, MAT_DIALOG_DATA} from '@angular/material/dialog';


@Component({
    selector: 'app-dialog-content-example-dialog',
    templateUrl: 'dialog.component.html',
    styleUrls: ['dialog.component.css'],
  })
  export class DialogComponent implements OnInit {

    displayedColumns: string[] = ['no', 'item', 'x', 'y', 'item1', 'item2', 'item3', 'item4', 'item5'];
    dataSource;
    filteredStates: Observable<any>;
    states: any[] = [];
    flag = false;
    newDeviceName = '';
    constructor( public dialogRef: MatDialogRef<DialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        const dialogConfig = new MatDialogConfig();
        this.dialogRef.disableClose = true;
     
        this.dataSource = this.data;
    }

    ngOnInit() {
    }
  
      cancel() {
        this.dialogRef.close();
    }
  }
