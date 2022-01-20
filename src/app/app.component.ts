import { Component, Inject, OnInit} from '@angular/core';
import { LookupList, LOOKUP_LIST } from './providers/lookupList.module';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'app';

  constructor(
    @Inject(LOOKUP_LIST) public lookupList: LookupList
  ) {

  }

  ngOnInit() {
  }
  /*
  @ViewChild('ehr_main') ehr_main;
  
  StatusMessage = "Verifying Login Information. Please wait....";
  loginStatus: string = "";

  curFeature = 1;
  totalNum = 7;

  source = timer(8000, 8000);
  subscribe = this.source.subscribe(val => this.curFeature == this.totalNum ? this.curFeature = 1 : this.curFeature++);

  loginForm: FormGroup;
  formPracticeSelection: FormGroup;

  clientIp: string = "1.1.1.1";

  //private httpOptions = {
  //  headers: new HttpHeaders({ 'Content-Type': 'application/json' })

  //};

  preLoadCount: number = 0;

  constructor(private formBuilder: FormBuilder, private logMessage: LogMessage,
    private generalService: GeneralService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private authService: AuthService, private loadStartup: LoadStartupService,
    private dateTimeUtil: DateTimeUtil,
    private http: HttpClient, private route: ActivatedRoute
  ) {

    this.getClientIP();
    debugger;
    this.getQueryStringParam();

  }
  switchPractice_id = ''
  getQueryStringParam() {
    this.route.queryParams.subscribe((params) => {
      if (params != undefined && params != null) {
        //console.log('uid='+params.uid);
        // console.log('id='+params.id);
        // console.log('key='+params.key);
        this.switchPractice(params)
      }
    });
  }
  switchPractice(params) {
    debugger;
    if (params == undefined || params.id == undefined)
      return;
    this.switchPractice_id = params.id;
    let parseToken = this.authService.decodeToken(params.key);
    this.authService.userId = Number(parseToken.user_id);
    this.authService.setToken(params.key)
    this.authService.jwt_token_expiry = parseToken.exp - parseToken.iat;
    this.authService.jwt_token_creation_time = this.dateTimeUtil.getCurrentDateTimeDate();
    //this.startTokenTick(this.token.jwt_token_expiry);        
    this.loginStatusMessage = "Loading EHR Data, Please wait....";
    this.loginStatus = "loading_data";

    if (this.lookupList.isEhrDataLoad == false) {
      this.getLogedInUserDetail(this.authService.userId);
    }
    window.history.pushState(null, null, window.location.href.split('?')[0]);
  }
  getClientIP() {
    this.generalService.GetClientIP()
      .subscribe(
        data => {
          this.clientIp = data;
        },
        error => {
          this.logMessage.log("Client IP:" + error.message)
        },
        () => {
          this.logMessage.log("GetIP Successfull.")
        }
      );
  }
  startTokenTick(seconds: number) {
    var counter = seconds;
    var interval = setInterval(() => {
      console.log(counter);
      if (this.authService.jwt_token_creation_time != undefined) {
        if (this.authService.chkIsTokenExpire(new Date()) == false) {
          this.generateToken("");
        }
      }
      counter--;
      if (counter < 0) {
        clearInterval(interval);
        if (this.authService.jwt_token_creation_time != undefined) {
          if (this.authService.chkIsTokenExpire(new Date()) == false) {
            this.generateToken("");
          }
        }
      } NumberFormatStyle
    }, (1000 * this.authService.jwt_token_expiry));
  }
  ngOnInit() {

    this.lookupList.isEhrDataLoad = false;
    this.buildForm();
  }

  buildForm() {
    this.loginForm = this.formBuilder.group({
      txtuser: this.formBuilder.control("", Validators.required),
      txtpassword: this.formBuilder.control("", Validators.required)
    })
    debugger;
    if (window.location.href == "https://ihcare-04:4200/") {
      (this.loginForm.get("txtuser") as FormControl).setValue("admin@mchc");
      (this.loginForm.get("txtpassword") as FormControl).setValue("123");

      //   //  (this.loginForm.get("txtuser") as FormControl).setValue("waqar@tmc");
      //   //  (this.loginForm.get("txtpassword") as FormControl).setValue("123");

      this.onSubmit(this.loginForm.value);
    }
  }
  buildPracticeForm() {
    this.formPracticeSelection = this.formBuilder.group({
      drpPracticeSelection: this.formBuilder.control("", Validators.required)
    })
  }
  onSubmit(formData) {

    debugger;

    if (formData.txtuser == undefined || formData.txtuser == "" || formData.txtpassword == undefined || formData.txtpassword == "") {
      this.loginStatus = "login_required";
      this.loginStatusMessage = "Please enter User Name and/or Password.";
    }
    else {

      this.loginForm.get("txtuser").disable();
      this.loginForm.get("txtpassword").disable();

      this.loginStatus = "verify_login";
      this.loginStatusMessage = "Verifying login info ...."
      //this.messageStatus='loading';
      this.generateToken(formData);
      //this.validateuser(formData);   
    }
  }
  public generateToken(formData) {
    let auth: AuthenticationCredentials = new AuthenticationCredentials;
    if (this.lookupList.isEhrDataLoad == false) {
      auth.username = formData.txtuser;
      auth.password = Md5.hashStr(formData.txtpassword).toString();
    }
    else {
      auth.username = this.lookupList.logedInUser.user_name;
      auth.password = this.lookupList.logedInUser.password;
    }
    this.authService.getAuthenticationToken(auth).subscribe(
      data => {//setToken
        debugger;
        let parseToken = this.authService.decodeToken(data['token']);
        this.authService.userId = Number(parseToken.user_id);
        this.authService.setToken(data['token'])
        this.authService.jwt_token_expiry = parseToken.exp - parseToken.iat;
        this.authService.jwt_token_creation_time = this.dateTimeUtil.getCurrentDateTimeDate();
        //this.startTokenTick(this.token.jwt_token_expiry);        
        this.loginStatusMessage = "Loading EHR Data, Please wait....";
        this.loginStatus = "loading_data";

        if (this.lookupList.isEhrDataLoad == false) {
          this.getLogedInUserDetail(this.authService.userId);
        }
      }, error => {
        if (error.status == 401) {
          this.loginForm.get("txtuser").enable()
          this.loginForm.get("txtpassword").enable();

          this.loginStatus = "login_failed";
          this.logMessage.log("User Name or Password is Invalid. ")
          this.loginStatusMessage = "User Name and/or Password is Invalid.";
          //Login Log
          this.createLoginUserLog(this.loginForm.get("txtuser").value, "", true);
        }
      }
    );
  }

  //validate user and generate token

  createLoginUserLog(user_name, practice_id, flag) {
    let objLogin: ORMLoginUserLog = new ORMLoginUserLog;
    objLogin.logid = "";
    objLogin.practice_id = practice_id;
    objLogin.user_id = user_name;
    objLogin.logintime = this.dateTimeUtil.getCurrentDateTimeString();
    objLogin.loginfail = flag;
    objLogin.system_ip = this.clientIp;
    this.generalService.loginUserLog(objLogin).subscribe(
      data => {
        if (!flag) {
          this.lookupList.logedInUser.loginLog_id = data['result'];
          //this.loginStatusMessage = "Verifying Login Information. Please wait....";
          // this.loginStatus = "";
        }
      });
  }
  getPracticeInfo(practiceId: number) {
    debugger;
    this.generalService.getPracticeInfo(practiceId).subscribe(
      data => {
        this.lookupList.practiceInfo.practiceId = Number(practiceId);
        this.lookupList.practiceInfo.practiceName = data['practice_name'];
        this.lookupList.practiceInfo.address1 = data['address1'];
        this.lookupList.practiceInfo.address2 = data['address2'];
        this.lookupList.practiceInfo.city = data['city'];
        this.lookupList.practiceInfo.zip = data['zip'];
        this.lookupList.practiceInfo.state = data['state'];
        this.lookupList.practiceInfo.phone = data['phone'];
        this.lookupList.practiceInfo.fax = data['fax'];
        this.lookupList.practiceInfo.domain = data['domain_name'];
        this.lookupList.practiceInfo.statement_phone = data['statement_phone'];

        this.loadStartup.loadAppData();

        this.loginStatusMessage = "";
        this.loginStatus = "";
        this.loginForm.get("txtuser").enable();
        this.loginForm.get("txtpassword").enable();
        this.loginForm.get("txtpassword").setValue(null);
      },
      error => {
        this.logMessage.log("getPracticeInfo: " + error);
      }
    );
  }
  lstPracticeSelection;
  showPracticeSelection = false;
  getLogedInUserDetail(userId: number) {
    this.generalService.getLogedInUserDetail(userId).subscribe(
      data => {
        if (data != null && data != undefined) {
          this.lookupList.logedInUser.userId = data['user_id'];
          this.lookupList.logedInUser.user_name = data['user_name'];
          this.lookupList.logedInUser.password = data['password'];
          this.lookupList.logedInUser.userFName = data['first_name'];
          this.lookupList.logedInUser.userLName = data['last_name'];
          this.lookupList.logedInUser.userMname = data['mname'];
          this.lookupList.logedInUser.userRole = data['default_role'];
          this.lookupList.logedInUser.defaultLocation = data['default_location'];
          this.lookupList.logedInUser.defaultProvider = data['default_physician'];
          this.lookupList.logedInUser.defaultBillingProvider = data['default_billing_phy'];
          this.lookupList.logedInUser.systemIp = this.clientIp;//"255.255.255.255";
          this.lookupList.logedInUser.defaultChartSetting = data['default_chart_setting'];
          this.lookupList.logedInUser.userType = data['user_type'];
          this.lookupList.logedInUser.loginProviderId = data['login_provider_id'];
          this.lookupList.logedInUser.loginProviderName = data['login_provider_name'];
          this.lookupList.logedInUser.userPracticeId = data['practice_id'];
          this.lookupList.logedInUser.userDefaultPrescriptionRole = data['default_prescription_role'];
          this.lookupList.logedInUser.defaultSuperBill = data['default_bill'];

          if (data['practice_id'] == 499)//Billing User
          {
            debugger;
            this.generalService.getBillingPractices(data['user_id']).subscribe(
              data => {
                debugger;
                this.lstPracticeSelection = data;
                this.lookupList.lstPracticeSelection = this.lstPracticeSelection;
                if (this.switchPractice_id != '') {
                  this.getPracticeInfo(Number(this.switchPractice_id));
                  this.createLoginUserLog(this.lookupList.logedInUser.user_name, this.switchPractice_id, false); //Login Log
                  this.switchPractice_id = '';
                  this.loginStatusMessage = "Loading EHR Data, Please wait....";
                  this.loginStatus = "loading_data";
                  return;
                }
                this.loginStatus = 'practice_selection';
                this.showPracticeSelection = true;

                this.buildPracticeForm();
                // if(this.lstPracticeSelection.length>0)
                // {
                //   (this.formPracticeSelection.get("drpPracticeSelection") as FormControl).setValue(this.lstPracticeSelection[0].col1);
                // }
              },
              error => {
                this.logMessage.log("getAllPractices: " + error);
              });
          }
          else {
            this.loginStatusMessage = "Loading EHR Data, Please wait....";
            this.loginStatus = "loading_data";
            this.getPracticeInfo(data['practice_id']);
            //Login Log
            this.createLoginUserLog(data['user_name'], data['practice_id'], false);
          }
          // //Login Log
          // this.createLoginUserLog(data['user_name'], data['practice_id'], false);
        }
      },
      error => {
        this.logMessage.log("getLogedInUserDetail: " + error);
      }
    );
  }
  onUnlock() {
    this.lookupList.isEhrLocked = false;
  }
  onPracticeSelectionSubmit(frm) {
    this.loginStatus = "loading_data";
    this.formPracticeSelection.disable();
    this.getPracticeInfo(frm.drpPracticeSelection);
    this.showPracticeSelection = false;
    //Login Log
    this.createLoginUserLog(this.lookupList.logedInUser.user_name, frm.drpPracticeSelection, false);
  }
  practiceSwitch(value) {
    debugger;
    let queryString = 'id=' + value + '&key=' + this.authService.getToken();
    window.location.href = window.location.pathname + "?" + queryString;
  }
  */
}


