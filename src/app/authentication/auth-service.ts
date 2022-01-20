import { Injectable, Inject } from '@angular/core';
import { AuthenticationCredentials } from './authenticationCredentials';
import { DateTimeUtil } from '../shared/date-time-util';
import { LookupList, LOOKUP_LIST } from '../providers/lookupList.module';
import { HttpClient } from '@angular/common/http';
import { APP_CONFIG, AppConfig } from '../providers/app-config.module';


@Injectable()
export class AuthService {
    constructor(private dateTime: DateTimeUtil,
        @Inject(LOOKUP_LIST) public lookupList: LookupList,
        private http: HttpClient,
        @Inject(APP_CONFIG) private config: AppConfig) { }

    private jwt_token: string = ""; //eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImF1ZCI6IndlYiIsImlhdCI6MTU0MzkxODUwMiwiZXhwIjoxNTc1NDU0NTAyfQ.dRJZyeCMvPEMdFNMA2DhQTacK40k93sMb0PmaS70JEI8XfPc2wOu9crw4U_curditsUyYnTc8X6N0EMHYJow2w
    //public jwt_token_iat;//token intialize at
    //public jwt_token_exp;//token expire

    public userId: number;
    public jwt_token_expiry: any;
    public jwt_token_creation_time: any;

    public setToken(token: string) {
        this.jwt_token = token;
    }
    public getToken(): string {
        return this.jwt_token ;
    }

    public getAuthorizationHeader(): string {

        return "Bearer " + this.jwt_token;
    }
    // public setTokenExpiry(){
    //     debugger;
    //     this.jwt_token_expiry=this.jwt_token_exp-this.jwt_token_iat;
    // }

    public chkIsTokenExpire(currentDate): boolean {
       // debugger;
        let diff = currentDate.getTime() - this.jwt_token_creation_time.getTime();
        if ((diff * .001) < this.jwt_token_expiry)//Miliseonns to seconds
            return true;
        else {
            this.jwt_token = null;
            this.jwt_token_creation_time = null
            this.jwt_token_expiry = null;
            return false;
        }
    }
    public generateToken() {
      //  debugger;
        let auth: AuthenticationCredentials = new AuthenticationCredentials;
        auth.username = this.lookupList.logedInUser.user_name;
        auth.password = this.lookupList.logedInUser.password;
        this.getAuthenticationToken(auth).subscribe(
            data => {//setToken
                debugger;
                let parseToken = this.decodeToken(data['token']);
                this.setToken(data['token'])
                this.jwt_token_expiry = parseToken.exp - parseToken.iat;
                this.userId = Number(parseToken.user_id);
                this.jwt_token_creation_time = this.dateTime.getCurrentDateTimeDate();
            });
    }
    private urlBase64Decode(str: string) {
        let output = str.replace(/-/g, '+').replace(/_/g, '/');
        switch (output.length % 4) {
            case 0:
                break;
            case 2:
                output += '==';
                break;
            case 3:
                output += '=';
                break;
            default:
                // tslint:disable-next-line:no-string-throw
                throw 'Illegal base64url string!';
        }
        return decodeURIComponent((<any>window).escape(window.atob(output)));
    }

    public decodeToken(token: string = '') {
        if (token === null || token === '') { return { 'upn': '' }; }
       // debugger;
        const parts = token.split('.');
        if (parts.length !== 3) {

            throw new Error('JWT must have 3 parts');
        }
        const decoded = this.urlBase64Decode(parts[1]);
        if (!decoded) {
            throw new Error('Cannot decode the token');
        }
        return JSON.parse(decoded);
    }

    getAuthenticationToken(auth: AuthenticationCredentials) {
        return this.http
            .post(this.config.apiEndpoint + 'auth/token', auth);
    }

}