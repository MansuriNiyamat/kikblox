import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonSharedModule } from '../shared/index';
import { SchemaRoutingModule } from './schema.routing.module';
import { SchemaService } from './service/schema.service';
import { SchemaComponent } from './schema.component';
import {OuterProfiledialogComponent} from './outerProfile/outerProfiledialog.component';
import {DialogComponent} from './dialog/dialog.component';
import {JSONDialogComponent} from './jsondialog/dialog.component';

@NgModule({
  declarations: [
    SchemaComponent,
    OuterProfiledialogComponent,
    DialogComponent,
    JSONDialogComponent
  ],
  imports: [
    CommonSharedModule,
    SchemaRoutingModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  entryComponents: [
    OuterProfiledialogComponent,
    DialogComponent,
    JSONDialogComponent
  ],
  providers: [
    SchemaService
  ]
})
export class SchemaModule { }
