import { NgModule, InjectionToken } from '@angular/core';
import { environment } from 'src/environments/environment';

export let APP_CONFIG = new InjectionToken<AppConfig>('app.config');

export class AppConfig {
  apiEndpoint: string;
  flexApplink:string; 

}

export const APP_DI_CONFIG: AppConfig = {
  
      apiEndpoint : environment.APIEndpoint,
      flexApplink:'https://instanthealthcare.net/ihc-mu/Main.html?'

};

@NgModule({
  providers: [{
    provide: APP_CONFIG,
    useValue: APP_DI_CONFIG
  }]
})
export class AppConfigModule { }