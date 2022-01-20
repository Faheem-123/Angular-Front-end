import { Component, OnInit, Inject } from '@angular/core';
import { ListFilterPipe } from 'src/app/shared/list-filter-pipe';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';

@Component({
  selector: 'immunization-setting',
  templateUrl: './immunization-setting.component.html',
  styleUrls: ['./immunization-setting.component.css']
})
export class ImmunizationSettingComponent implements OnInit {

  immRegEnabled: boolean = false;
  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList) { }

  ngOnInit() {

    let lstAppSetting: Array<any> = new ListFilterPipe().transform(this.lookupList.appSettings, "description", "enable_immunization_registry");
    if (lstAppSetting != undefined && lstAppSetting.length > 0) {
      let option: string = lstAppSetting[0].options.toString();
      if (option.toString().toLowerCase() == 'true') {
        this.immRegEnabled = true;
      }
    }


  }

}
