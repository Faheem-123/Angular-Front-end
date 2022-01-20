import { Injectable,Inject } from '@angular/core';
import { HttpClient,HttpHeaders, HttpParams } from '@angular/common/http';
import { APP_CONFIG, AppConfig } from '../../providers/app-config.module';
import { Observable } from 'rxjs';
import { map ,  filter } from 'rxjs/operators';


@Injectable()
export class CommunicationService {
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  constructor(private http:HttpClient,
    @Inject(APP_CONFIG) private config: AppConfig) {    
   }




}
