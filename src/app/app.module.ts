import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import {AppRoutingModule} from './app-routing.module';
import { InspectorComponent } from './inspector/inspector.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {CommonSharedModule} from './shared/index';

@NgModule({
  declarations: [
    AppComponent,
    InspectorComponent
    
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonSharedModule,
    AppRoutingModule
  ],
  entryComponents: [
    
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
],
})
export class AppModule { }
