import { Component, ViewChild, ChangeDetectorRef, OnDestroy, ApplicationRef, ElementRef } from '@angular/core';
import { IonicPage, NavController, PopoverController, Content, LoadingController} from 'ionic-angular';
import { Api, ConfigService, UtilService, AuthService, MsgService, VoteHandlerService } from '../../providers/providers';
import { TranslateService } from '@ngx-translate/core';
import { TrendItem, Vote, Session } from '../../models/datamodel';

@IonicPage()

@Component({
  selector: 'page-fitting-stream',
  templateUrl: 'fitting-stream.html'
})


export class FittingStreamPage {

  @ViewChild(Content)
  content : Content;

  @ViewChild("loaderContainer")
  loader : ElementRef;

  streamOptions = {
    limit : 3, 
    skip : 0
  }

  visibleIndex : number = 0;
  programScrolling : boolean = false;

  isLoading : boolean = false;


  touches = {
		"touchstart": {"x":-1, "y":-1, "target" : ""}, 
    "touchmove" : {"x":-1, "y":-1}, 
    "touchend" : {"x":-1, "y":-1, "isEnd" : false}, 
    "directionX" : "undetermined",
    "directionY" : "undetermined"
  }
  
  constructor(
    private translate: TranslateService, 
    public navCtrl: NavController, 
    public api: Api, 
    public config: ConfigService, 
    public util : UtilService, 
    private popoverCtrl: PopoverController, 
    private auth : AuthService, 
    private voteHdl : VoteHandlerService, 
    public loadingCtrl : LoadingController,
    public msg: MsgService) {

    
  }

  ngAfterViewInit(){

    this.getTrendStream(null, true);

  }

  swipeUp(events){
    this.handleScrollEnd(true)
  }

  swipeDown(events){
    this.handleScrollEnd(false)
  }



  
  resetStreamOptions(){
    this.streamOptions = {
      limit : 3, 
      skip : 0
    };
  }

  toggleLoad(){
    const container = this.loader.nativeElement;
    container.classList.toggle("active");
  }


  getTrendStream (refresher? : any, reloadBeginning = false){

    let comp = this;

    if (reloadBeginning){
      comp.toggleLoad();
    }
    

    console.log("calling the api with the following options:")
    console.log(this.streamOptions);

    this.api.getTrendStream(this.streamOptions).subscribe(
      (trendStream : Array<TrendItem>) => {

          if (reloadBeginning){

            comp.api.streamItems.length = 0;

            trendStream.map(element => {
              
              let item = new TrendItem(element);
              comp.api.streamItems.push(item)

            });

            comp.toggleLoad();

          }else{
            comp.api.streamItems = comp.api.streamItems.concat(trendStream.map(element => new TrendItem(element)));
          }
          
          if (refresher){
            refresher.complete();
          }
          
      },
      error => {
        console.log("error");
        console.log(error)
      }
    );
  }

  infiniteScroll(scroller){

    this.streamOptions.skip += 3;

    this.getTrendStream(scroller);

  }

  setVisibleItem(index){
    this.visibleIndex = index;
  }

  onVoteClick(voteType: number, session: Session){
      this.voteHdl.handleVoteClicked(voteType, session);
  }

  showReactions(ev: any, trendItem : TrendItem){

    this.voteHdl.showReactions(ev, trendItem);

  }

  checkIfVisible(bounding){
    if ( bounding.top >= 0 && bounding.left >= 0 && bounding.right <= (window.innerWidth || document.documentElement.clientWidth) && 
    bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight)){

      return true;
    }else{
      return false;
    }
  }

  handleScrollEnd(isUp = true){

      if (isUp){
      
        if (this.visibleIndex < this.api.streamItems.length){

          if (this.visibleIndex + 4 > this.api.streamItems.length){
            this.infiniteScroll(null);
          }

          this.visibleIndex++;
        }
      
      }else{

          if (this.visibleIndex > 0){
            this.visibleIndex--;
          }else{
            this.resetStreamOptions();
            this.getTrendStream(null, true);
          }

        }
  }


  getTitleMessage(item){

    let msg; 

    switch(item.itemType) {
      case 1:
          msg = this.translate.instant('HAS_VOTED');
          break;
      case 2:
          msg = this.translate.instant('HAS_REACTED_TO');
          break;
      default:
        msg = this.translate.instant('HAS_REACTED_TO');
    }

    return msg;

  }

  goToItemCreator(item: TrendItem){
    this.navCtrl.push('MyRoomPage', {
      userId : item.getItemCreatorId()
    });
  }

  goToColOwner(item: TrendItem){
    this.navCtrl.push('MyRoomPage', {
      userId : item.getItemOwnerId()
    });
  }

  goToImgCollection(item: TrendItem){
    this.navCtrl.push('ImgCollectionPage', {
      collectionId : item.getCollectionId()
    });
  }

  goToSessionCompare(item: TrendItem){
    this.navCtrl.push('ContentPage', {
      collectionId : item.getCollectionId(),
      compareSessionIds: [item.getSessionId()]
    });

  }

}
