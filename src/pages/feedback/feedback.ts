import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Camera } from '@ionic-native/camera';
import { Api, MsgService } from '../../providers/providers';

/**
 * Generated class for the FeedbackPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-feedback',
  templateUrl: 'feedback.html',
})
export class FeedbackPage {

  @ViewChild("loaderContainer") loader : ElementRef;


  public screenshotData: any = "";
  public screenshotPreview : any = "";

  public feedbackText : any = "";

  public isPreview : boolean = false;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private camera : Camera, 
    private api: Api, 
    private msg : MsgService) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FeedbackPage');
  }

  getScreenshot(){

    this.toggleLoad();


    this.camera.getPicture({
        sourceType : this.camera.PictureSourceType.PHOTOLIBRARY,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        correctOrientation: true,
        targetWidth: window.outerWidth,
        targetHeight:window.outerHeight
    }).then((data) => {

      this.screenshotPreview = 'data:image/jpeg;base64,' + data;
      this.screenshotData = data;

      this.isPreview = true;

      this.toggleLoad();

    }, (err) => {
      console.log(err);
      console.log('Aborted to take photo');

      this.toggleLoad();
    })
    
  }

  toggleLoad(){
    const container = this.loader.nativeElement;
    container.classList.toggle("active");
  }


  getSubmitDisabled(){
    if (this.feedbackText.length > 0 || this.screenshotData.length > 0){
      return false;
    }else {
      return true;
    }
  }

  removeScreenshot(){
    this.isPreview = false;
    this.screenshotData = "";
    this.screenshotPreview = "";
  }

  resetFeedback(){
    this.removeScreenshot();
    this.feedbackText = "";
  }

  submitFeedback(){

    this.toggleLoad();

    let feedbackObj = {
      screenShotData : this.screenshotData,
      feedbackText : this.feedbackText
    }

    this.api.postFeedback(feedbackObj).subscribe(
      (data) => {

          this.msg.toast("FEEDBACK_RECEIVED", 2000);

        this.resetFeedback();
        this.toggleLoad();

      },
      error => {
        this.api.handleAPIError(error);
        this.toggleLoad();
      }
    )

  }

}
