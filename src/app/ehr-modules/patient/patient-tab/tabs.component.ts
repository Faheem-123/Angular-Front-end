/**
 * The main component that renders single TabComponent
 * instances.
 */

import { Component, ContentChildren, QueryList, AfterContentInit, ViewChild, ComponentFactoryResolver, ViewContainerRef, Inject } from '@angular/core';

import { TabComponent } from './tab.component';
import { DynamicTabsDirective } from './dynamic-tabs.directive';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { PromptResponseEnum } from 'src/app/shared/enum-util';

@Component({
  selector: 'my-tabs',
  template: `
    <ul class="nav nav-tabs pat-closable-nav">
      <li class="nav-item pat-home-tab" *ngFor="let tab of tabs" (click)="selectTab(tab)" [class.active]="tab.active">
        <button><i class="fa fa-search" aria-hidden="true"></i> {{tab.title}}</button>       
      </li>

      <!-- dynamic tabs -->
      <li class="nav-item" *ngFor="let tab of dynamicTabs" (click)="selectTab(tab)" [class.active]="tab.active">
      
      {{tab.title}}<button class="tab-close" ><a *ngIf="tab.isCloseable" (click)="closeTab(tab)"><i class="fa fa-times" aria-hidden="true"></i></a></button>

      <!--  <a>{{tab.title}} <span class="tab-close" *ngIf="tab.isCloseable" (click)="closeTab(tab)">x</span></a>-->
      </li>
    </ul>
    
    <div class="tab-content pt-1-px">
      <ng-content></ng-content>
      <ng-template dynamic-tabs #container ></ng-template> 
    </div>
  `,
  styles: [
    `
    .tab-close {
      color: gray;
      text-align: right;
      cursor: pointer;
    }
    `
  ]
})
export class TabsComponent implements AfterContentInit {
  dynamicTabs: TabComponent[] = [];

  @ContentChildren(TabComponent)
  tabs: QueryList<TabComponent>;

  @ViewChild(DynamicTabsDirective)
  dynamicTabPlaceholder: DynamicTabsDirective;

  /*
    Alternative approach of using an anchor directive
    would be to simply get hold of a template variable
    as follows
  */
  // @ViewChild('container', {read: ViewContainerRef}) dynamicTabPlaceholder;

  constructor(private _componentFactoryResolver: ComponentFactoryResolver, private modalService: NgbModal,
    @Inject(LOOKUP_LIST) public lookupList: LookupList) { }

  // contentChildren are set
  ngAfterContentInit() {
    // get all active tabs
    let activeTabs = this.tabs.filter((tab) => tab.active);

    // if there is no active tab set, activate the first
    if (activeTabs.length === 0) {
      this.selectTab(this.tabs.first);
    }
  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
    // centered: true
  };

  openTab(title: string, template, data, isCloseable = false) {

    if (this.dynamicTabs.length == 3) {
      debugger;
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = 'Patient Open Limit'
      modalRef.componentInstance.promptMessage = 'You have reached the maximum limit of opened patients.<br> First Patient will be closed.';
      modalRef.componentInstance.alertType = 'warning';

      modalRef.result.then((result) => {
        debugger;
        if (result === PromptResponseEnum.OK) {
          this.closeTab(this.dynamicTabs[0]);

          this.addTab(title, template, data,true)

        }
      }
        , (reason) => {
          return;
        });


      //if (this.lookupList.logedInUser.userType.toUpperCase() == "BILLING") {
      //GeneralOperation.showAlertPopUp(this.modalService, 'Patient Open Limit',
      //  'You have reached the maximum limit of opened patients.<br> First Patient will be closed.', 'warning');

      //this.dynamicTabs.splice(0,1);        
      //this.closeTab(this.tabs.first);

      //}
      //else {
      //  GeneralOperation.showAlertPopUp(this.modalService, 'Patient Open Limit', 'You have reached the maximum limit of opened patients.\nPlease Close Previous Patients First.', 'warning');
      // return;
      // }

    }
    else {
      this.addTab(title, template, data,true)
    }

  }

  addTab(title: string, template, data, isCloseable) {
    if (this.dynamicTabs.length > 0) {
      let counter: number = 1;
      for (let t of this.dynamicTabs) {
        if (t.dataContext.patient_id == data.patient_id) {
          this.selectTab(this.dynamicTabs[counter - 1]);
          return;
        }
        counter++;
      }
    }

    // get a component factory for our TabComponent
    let componentFactory = this._componentFactoryResolver.resolveComponentFactory(TabComponent);

    // fetch the view container reference from our anchor directive
    let viewContainerRef = this.dynamicTabPlaceholder.viewContainer;

    // alternatively...
    // let viewContainerRef = this.dynamicTabPlaceholder;

    // create a component instance
    let componentRef = viewContainerRef.createComponent(componentFactory);

    // set the according properties on our component instance
    let instance: TabComponent = componentRef.instance as TabComponent;
    instance.title = title;
    instance.template = template;
    instance.dataContext = data;
    instance.isCloseable = isCloseable;
    // remember the dynamic component for rendering the
    // tab navigation headers
    this.dynamicTabs.push(componentRef.instance as TabComponent);

    // set it active
    this.selectTab(this.dynamicTabs[this.dynamicTabs.length - 1]);
  }

  selectTab(tab: TabComponent) {
    // deactivate all tabs
    this.tabs.toArray().forEach(tab => tab.active = false);
    this.dynamicTabs.forEach(tab => tab.active = false);

    // activate the tab the user has clicked on.
    tab.active = true;
  }

  closeTab(tab: TabComponent) {
    debugger;
    for (let i = 0; i < this.dynamicTabs.length; i++) {
      if (this.dynamicTabs[i] === tab) {
        // remove the tab from our array
        this.dynamicTabs.splice(i, 1);

        // destroy our dynamically created component again
        let viewContainerRef = this.dynamicTabPlaceholder.viewContainer;
        // let viewContainerRef = this.dynamicTabPlaceholder;
        viewContainerRef.remove(i);

        // set tab index to 1st one
        this.selectTab(this.tabs.first);
        break;
      }
    }
  }

  closeActiveTab() {
    let activeTabs = this.dynamicTabs.filter((tab) => tab.active);
    if (activeTabs.length > 0) {
      // close the 1st active tab (should only be one at a time)
      this.closeTab(activeTabs[0]);
    }
  }

}
