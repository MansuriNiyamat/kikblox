import {Component, Inject, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {MatDialog, MatDialogRef, MatDialogConfig, MAT_DIALOG_DATA} from '@angular/material/dialog';


@Component({
    selector: 'app-dialog-content-example-dialog',
    templateUrl: 'outerProfiledialog.component.html',
    styleUrls: ['outerProfiledialog.component.css'],
  })
  export class OuterProfiledialogComponent implements OnInit {

    top;
    side;
    back;

    selectedOptions =  {option: '', top: '', side:'', back:'' };
    displayedColumns: string[] = [ 'option', 'depth', 'busbar', 'total', 'select'];
    dataSource = [
      {option: 'OP 1', depth: 200, busbar: 200, total: 400},
      {option: 'OP 2', depth: 300, busbar: 300, total: 600},
      {option: 'OP 3', depth: 400, busbar: 0, total: 400},
      {option: 'OP 4', depth: 400, busbar: 200, total: 600},
      {option: 'OP 5', depth: 400, busbar: 400, total: 800},
      {option: 'OP 6', depth: 400, busbar: 600, total: 1000},
      {option: 'OP 7', depth: 400, busbar: 600, total: 1000},
      {option: 'OP 8', depth: 600, busbar: 0, total: 600},
      {option: 'OP 9', depth: 600, busbar: 200, total: 800},
      {option: 'OP 10', depth: 600, busbar: 400, total: 1000},
      {option: 'OP 11', depth: 600, busbar: 600, total: 1200},
      {option: 'OP 12', depth: 800, busbar: 0, total: 800},
      {option: 'OP 13', depth: 1000, busbar: 0, total: 1000},
    ];
    filteredStates: Observable<any>;
    states: any[] = [];
    flag = false;
    newDeviceName = '';
    constructor( public dialogRef: MatDialogRef<OuterProfiledialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        const dialogConfig = new MatDialogConfig();
        this.dialogRef.disableClose = true;
        console.log(this.data);  
        // this.dataSource = this.data;
    }

    ngOnInit() {
    }

    depthSelect(element) {
      this.selectedOptions.option = element;
    }
    topChange(event) {
      this.selectedOptions.top = event.value;
    }
    sideChange(event) {
      this.selectedOptions.side = event.value;
    }
    backChange(event) {
      this.selectedOptions.back = event.value;
    }
    apply() {
      this.selectedOptions.top = this.top;
      this.selectedOptions.side = this.side;
      this.selectedOptions.back = this.back;
    }

      cancel() {
        this.dialogRef.close();
    }
  }
