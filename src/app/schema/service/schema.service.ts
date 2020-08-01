import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { BaseService} from '../../shared/services/base.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {environment} from '../../../environments/environment';



@Injectable()
export class SchemaService extends BaseService {

  apiURL = '';// environment.apiUrl + 'schema';

 httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
    'Access-Control-Allow-Origin': 'http://localhost:4200',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
  })
};
  constructor(public http: HttpClient, matSnack: MatSnackBar) {
   super(matSnack);
   }

  getAllSchema(): Observable<any> {
    return this.http.get(this.apiURL, this.httpOptions);
  }

  countSchema(): Observable<number> {
    return this.http.get<number>(`${this.apiURL}/count`);
  }

  addSchema(schema): Observable<any> {
    return this.http.post<any>(this.apiURL, schema);
  }

  getSchema(id): Observable<any> {
    return this.http.get<any>( `${this.apiURL}/${id}`);
  }

  editSchema(schema): Observable<any> {
    return this.http.post(`${this.apiURL}/${schema.id}`, schema, { responseType: 'text' });
  }

  deleteSchema(schema): Observable<any> {
    return this.http.delete(`${this.apiURL}/${schema.id}`, { responseType: 'text' });
  }

}
