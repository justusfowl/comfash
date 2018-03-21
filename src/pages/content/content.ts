import { Component, Sanitizer, AfterViewInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, PopoverController } from 'ionic-angular';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { Collection, Session, Comment, Vote } from '../../models/datamodel';
import { Api, AuthService, ConfigService, UtilService } from '../../providers/providers';
import * as $ from 'jquery';

window['$'] = window['jQuery'] = $;

@IonicPage({
  segment: "content/:collectionId/:compareSessionIds", 
  defaultHistory : [ "MyRoomPage" ]
})
@Component({
  selector: 'page-content',
  templateUrl: 'content.html', 
  providers: [
    ScreenOrientation
  ]
})
export class ContentPage implements AfterViewInit {

  compareItems : Session[] = [];
  footerHangers = [];
  prcSessionItem = 10; 
  
  comments = [];

  lastPressedX : any; 
  lastPressedY: any; 

  selectedCommentId : number = 0;
  enableCommentList : boolean = false;

  selectedIndex : number = -1; 
  collection : Collection;

  constructor(
    public navCtrl: NavController, 
    private popoverCtrl: PopoverController, 
    navParams: NavParams, 
    private screenOrientation: ScreenOrientation, 
    public modalCtrl: ModalController, 
    private api : Api, 
    public sanitizer : Sanitizer, 
    private auth : AuthService, 
    public config : ConfigService, 
    public util : UtilService) {

        this.compareItems.length = 0; 

        // screen orientation not available on ionicDev
        //this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);

        // get compare sessions muss auch über die URL möglich se

        let collectionId = navParams.get('collectionId');
        let compareSessionIds = [];

        if (typeof(navParams.get('compareSessionIds')) == "string"){
          for (const id of navParams.get('compareSessionIds').split(",")){
              compareSessionIds.push(parseInt(id));
          }
        }else{
          compareSessionIds = navParams.get('compareSessionIds');
        }

        console.info("so far only deep links for sessions of the same collections are possible");

        let loadCollection : any = this.api.loadCollection(collectionId);
        let comp = this;

        loadCollection.observable.subscribe(
          (data) => {

            // only if the query has been made to the API, load data into the api object, otherwise take existing one
            if (loadCollection.isQry){

              comp.api.handleLoadCollection(data);
              
              comp.api.compareSessionIds = compareSessionIds;
              comp.api.compareSessions = comp.api.selectedCollection.getSessionsById(compareSessionIds);
              
            }
            
            // hangers must be calculated everytime
            comp.calculateFooterHangers();
          },
          error => {
            comp.api.handleAPIError(error);
          }
        )

   }

   ngAfterViewInit(){
    
      /*
      $('#row-compare-items').bind('touchmove', function (evt : any) {
        console.log(evt);
        var currentY = evt.originalEvent.touches[0].clientY;
      });
      */

      setTimeout(function(){ 
        let videos : any = $('video.video-background');

        for (var i=0; i<videos.length; i++){
          videos[i].pause()
        }
      }, 1500);
   }
   
   pressed(e, session : Session){
     
      // normalize coords to include offset of target element 

      let targetElement = e.target.getBoundingClientRect();
      let currentPrcSessionItem = this.prcSessionItem;

      let coords = {
        "x" : e.center.x - targetElement.x  < 0 ? 0 : e.center.x - targetElement.x ,
        "y" : e.center.y - targetElement.y  < 0 ? 0 : e.center.y - targetElement.y 
      }

      let addModal = this.modalCtrl.create('CommentCreatePage');
      addModal.onDidDismiss(comment => {

        if (comment){
          let tmpItem = new Comment({
                  commentText : comment.commentText, 
                  userId : this.auth.getUserId(),
                  sessionId : session.getId(), 
                  prcSessionItem : currentPrcSessionItem
                });

          let viewPort = document.getElementById('row-compare-items');

          tmpItem.calculateRatioFromCoords(coords,viewPort,session);

          this.api.addCommentToSession(this.api.selectedCollection.getId(), session.getId(), tmpItem, session);  

        }

      });

      addModal.present();
   }

   /*
   getImgFromSession(session: Session){

    let sessionIndex = session.getImgIndexFromPercent(this.prcSessionItem); 
    return null; //session.images[sessionIndex]
   }

   getImgPath(session: Session){

     try{
      return this.getImgFromSession(session).imagePath;
     }catch(err){
       console.log(err); 
       return "";
     }
    
   }
   */

  scaleToFill() {

    try{

        let videoTag : any = $('video.video-background')[0];

        var $video = $(videoTag),
            videoRatio = videoTag.videoWidth / videoTag.videoHeight,
            tagRatio = $video.width() / $video.height(),
            val;

        if (videoRatio < tagRatio) {
            val = tagRatio / videoRatio * 1.02;
        } else if (tagRatio < videoRatio) {
            val = videoRatio / tagRatio * 1.02;
        }

      return 'scale(' + parseFloat(val) + ')';

    }catch(err){
      return 'scale(1)'
    }
}

  /*
  getImgComment(session: Session){

    try{
      return this.getImgFromSession(session).getComments();
     }catch(err){
       console.log(err); 
       return "";
     }

  }
  */

  calculateFooterHangers(){

    let tmpArray = []; 
    let tmpArrayPrc = []; 
    
    for (var session of this.api.compareSessions){

      session.comments.map(function(comment, index){

          let prc = Math.round((comment.prcSessionItem));

          if (tmpArrayPrc.indexOf(prc) == -1){
            
            tmpArrayPrc.push(prc);
            tmpArray.push({
              index: index, 
              orderPrc : prc > 95 ? 95 : prc < 5 ? 5 : prc
            });
          }
          

        });

      }

    return tmpArray;
  }

  setSelectedIndex(index){
    this.selectedIndex = index;
  }

  enableComments(index){

    let rowElement = document.getElementById('row-compare-items');
    let commentList = document.getElementById('comment-list');

    if (this.enableCommentList){

      this.enableCommentList = false;

      if (this.selectedIndex == index){
        
        this.selectedCommentId = -1;
        this.setSelectedIndex(-1);
        rowElement.classList.remove('comment-list-active');
        commentList.classList.remove('active');

      }else{
        this.setSelectedIndex(index);
      }
    }else{
      this.enableCommentList = true;
      this.setSelectedIndex(index);
      rowElement.classList.add('comment-list-active');
      commentList.classList.add('active');
    }

  }

  selectComment(i, comment){

    this.highlightComment(comment);

    if (!this.enableCommentList){
      this.enableComments(i);
    }else{
      this.setSelectedIndex(i);
    }
    
    this.highlightCommentListItem(comment);
  }

  highlightCommentListItem(comment : Comment){
    
    // give some time for the view to render the new comment list

    setTimeout(function(){ 
      
      try {
        let el = document.getElementById('comment-list_' + comment.getId());
        el.scrollIntoView();
        el.classList.add('item-selected');
      }catch(err){
        console.log(err)
      }
      
    }, 230);

    setTimeout(function(){ 

      try {
        let el = document.getElementById('comment-list_' + comment.getId());
        el.classList.remove('item-selected');
      }catch(err){
        console.log(err)
      }

    }, 3000);
  }


  highlightComment(comment: Comment){

    this.selectedCommentId = comment.getId();

    this.highlightCommentListItem(comment);
  }

  checkCommentActive(comment : Comment){

    if (comment.getId() == this.selectedCommentId){
      return true;
    }else{
      return false;
    }
    
  }

  checkCommentHidden(displayComments){

    if (displayComments.length > 0){
      return false;
    }else{
      return true;
    }
    
  }

  getCommentsForSelectedSession(){

    if (this.api.compareSessions.length > 0 && this.selectedIndex != -1){
      return this.api.compareSessions[this.selectedIndex].comments;
    }else{
      return [];
    }
  }

  voteChange(voteType, session){

    let vote = new Vote({
      sessionId : session.getId(), 
      userId : this.auth.getUserId(), 
      voteType : voteType
    }); 

    session.myVote = vote;

    this.api.upsertVote(this.api.selectedCollection.getId() , session.getId(), vote);

  }

  getMyVoteIcon(session : Session){

    try {
      let myVote : Vote = session.myVote;
      return myVote.getVoteIcon(myVote.voteType);
    }catch(err){
      return 'thumbs-up';
    }
  }

  showReactions(ev: any, session: Session){

    let hasVote = false;
    if (session.myVote){
      hasVote = true;
    }
 
    let reactions = this.popoverCtrl.create('ReactionsPage', {
      "hasVote" : hasVote
    });

    reactions.onDidDismiss((voteType : number) => {
      if (voteType) {

        let vote = new Vote({
          sessionId : session.getId(), 
          voteType : voteType, 
          userId : this.auth.getUserId()
        });

        if (session.myVote){
          session.myVote.voteType = voteType;
        }else{
          session.setMyVote(vote);
        }
        
        this.api.upsertVote(this.api.selectedCollection.getId(), session.getId(), vote)

      }else{
        // unvote = voteType = 0

        this.api.deleteVote(this.api.selectedCollection.getId(), session.getId()).subscribe( data => {
          session.removeMyVote();
        })

        // this.api.unvote();
      }
    })

    reactions.present({
        ev: ev
    });

}


  checkIfMyVoteIsActive(session : Session){

    try { 
      if (session.myVote){
        return true;
      }else{
        return false;
      }
    }catch(err){
      return false;
    }
  }

  slide(event){
    let comp = this;
    const videos : any = document.getElementsByTagName("video");
    for (var i = 0; i<videos.length; i++){
      let element = videos[i];
      element.currentTime = (comp.prcSessionItem / 100) * element.duration;
    }
  }

   navBack(){
      this.navCtrl.pop();
   }

}



