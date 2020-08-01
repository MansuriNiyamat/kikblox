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

    displayedColumns: string[] = [];
    dataSource;
    filteredStates: Observable<any>;
    states: any[] = [];
    flag = false;
    newDeviceName = '';
    constructor( public dialogRef: MatDialogRef<DialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        const dialogConfig = new MatDialogConfig();
      //  this.dialogRef.disableClose = true;
        if(this.data.type === 'outerPanel') {
          this.displayedColumns = ['componentName', 'placement', 'width', 'height', 'component', 'busbar', 'total', 'qty'];
          this.dataSource = this.data.data;

        } else if(this.data.type === 'door') {
          this.displayedColumns = ['componentName', 'placement', 'width', 'height', 'total', 'qty'];
          this.dataSource = this.data.data;

        } else if (this.data.type === 'calculation') {
          this.displayedColumns = ['no', 'item', 'x', 'y', 'item1', 'item2', 'item3', 'item4', 'item5'];
           this.dataSource = this.data.data;
        }
    }

    ngOnInit() {
    }
  
      cancel() {
        this.dialogRef.close();
    }
  }
