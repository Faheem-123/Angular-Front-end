import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'camera-capture-popup',
  templateUrl: './camera-capture-popup.component.html',
  styleUrls: ['./camera-capture-popup.component.css']
})
export class CameraCapturePopupComponent implements OnInit {

  @ViewChild("video")
  public video: ElementRef;

  @ViewChild("canvas")
  public canvas: ElementRef;
  public current_url="";
  pic_url: SafeUrl;
  public isOnlyView: boolean = false;
  isCameraNotFound: boolean = false;
  errorMsg: string = "";
  //public captures: Array<any>;
  capturedPic: any;
  title="Capture Photo";

  public constructor(public activeModal: NgbActiveModal,private domSanitizer: DomSanitizer) {
    //this.captures = [];
    this.capturedPic = null;
  }

  public ngOnInit() {
    // if(this.isOnlyView)
    //   this.pic_url = this.domSanitizer.bypassSecurityTrustResourceUrl(this.current_url)
   }

  public ngAfterViewInit() {

    if(this.isOnlyView)
      return;
    let error: string = "";
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
        this.video.nativeElement.srcObject = stream;
        this.video.nativeElement.play();

      },
        error => {
          if (error.name == 'NotFoundError') {
            this.isCameraNotFound = true;
          }
          this.errorMsg = error.message;
          console.log(error.name + ": " + error.message);
        }
      );

      /*.catch(function (err) { 
        debugger;        
        console.log(err.name + ": " + err.message); 
      }); // always check for errors at the end.
      */
    }

    this.errorMsg = "";
  }

  public capture() {

    debugger;

    //this.canvas.nativeElement.height =this.video.nativeElement.height; 
    //this.canvas.nativeElement.width =this.video.nativeElement.width;
    var context = this.canvas.nativeElement.getContext("2d");
    context.drawImage(this.video.nativeElement, 0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    this.capturedPic = this.canvas.nativeElement.toDataURL("image/png");
    //this.captures.push(this.capturedPic);
    //this.video.nativeElement.stop();    
    this.activeModal.close(this.capturedPic);
  }
}
