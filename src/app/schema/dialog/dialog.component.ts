import {Component, Inject, OnInit, ElementRef, ViewChild} from '@angular/core';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {MatDialog, MatDialogRef, MatDialogConfig, MAT_DIALOG_DATA} from '@angular/material/dialog';
import * as XLSX from 'xlsx';

@Component({
    selector: 'app-dialog-content-example-dialog',
    templateUrl: 'dialog.component.html',
    styleUrls: ['dialog.component.css'],
  })
  export class DialogComponent implements OnInit {

    @ViewChild('TABLE',{ read: ElementRef }) table: ElementRef;

    title = 'Calculation';
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
          this.title = 'Calculation';
          this.displayedColumns = ['componentName', 'placement', 'width', 'height', 'component', 'busbar', 'total', 'qty'];
          this.dataSource = this.data.data;

        } else if(this.data.type === 'door') {
          this.title = 'Inner Panel (Door) Calculation';

          this.displayedColumns = ['componentName', 'placement', 'width', 'height', 'total', 'qty'];
          this.dataSource = this.data.data;

        } else if (this.data.type === 'calculation') {
          this.displayedColumns = ['no', 'item', 'x', 'y', 'item1', 'item2', 'item3', 'item4', 'item5'];
           this.dataSource = this.data.data;
        }
    }

    ExportTOExcel()
  {
    console.log('export');
    // this.table.nativeElement.style.background = 'red';
    const ws: XLSX.WorkSheet=XLSX.utils.json_to_sheet(this.dataSource);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb,'calculation.xlsx');
    // console.log('exported');
  }

    ngOnInit() {
    }
  
      cancel() {
        this.dialogRef.close();
    }
  }
