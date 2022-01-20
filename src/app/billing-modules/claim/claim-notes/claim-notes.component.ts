import { Component, OnInit, Input, Inject } from '@angular/core';
import { ClaimService } from 'src/app/services/billing/claim.service';
import { LogMessage } from 'src/app/shared/log-message';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddEditClaimNoteComponent } from './add-edit-claim-note/add-edit-claim-note.component';
import { OpenedClaimInfo } from 'src/app/models/billing/opened-claim-info';
import { CallingFromEnum } from 'src/app/shared/enum-util';

@Component({
  selector: 'claim-notes',
  templateUrl: './claim-notes.component.html',
  styleUrls: ['./claim-notes.component.css']
})
export class ClaimNotesComponent implements OnInit {

  @Input() openedClaimInfo: OpenedClaimInfo;
  //@Input() claimId: number;
  //@Input() isDeletedClaim: boolean;



  lstClaimNotes: Array<any>;

  isLoading: boolean = false;

  popUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  constructor(private claimService: ClaimService,
    private logMessage: LogMessage,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private ngbModal: NgbModal) { }

  ngOnInit() {

    this.getClaimNotes();
  }

  getClaimNotes() {
    this.isLoading = true;
    this.lstClaimNotes = undefined;
    this.claimService.getClaimNotes(this.openedClaimInfo.claimId, this.lookupList.logedInUser.user_name, 'false').subscribe(
      data => {
        this.lstClaimNotes = data as Array<any>;
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        this.getClaimNotesError(error);
      }
    );
  }

  getClaimNotesError(error: any) {
    this.logMessage.log("getClaimNotes Error." + error);
  }


  canEditNote(note: any): boolean {
    let canEdit: boolean = true;

    if (this.openedClaimInfo.deleted) {
      canEdit = false;
    }
    else if (!note.is_auto && note.can_edit_note && note.modified_user.toUpperCase() == this.lookupList.logedInUser.user_name.toUpperCase()) {
      canEdit = true;
    }
    else {
      canEdit = false;
    }
    return canEdit;

  }



  onAddEditClaimNote(objNote: any) {
    const modalRef = this.ngbModal.open(AddEditClaimNoteComponent, this.popUpOptions);
    modalRef.componentInstance.openedClaimInfo = this.openedClaimInfo;
    //modalRef.componentInstance.claimId =this.openedClaimInfo.claimId;
    //modalRef.componentInstance.dos =this.openedClaimInfo.dos;
    modalRef.componentInstance.objNote = objNote;
    modalRef.componentInstance.callingFrom = CallingFromEnum.CALIM_NOTES;

    modalRef.result.then((result) => {
      debugger;
      if (result) {
        this.getClaimNotes();
      }
    }, (reason) => {
      //alert(reason);
    });


  }




}
