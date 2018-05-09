import { Component, Sanitizer, AfterViewInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { Collection, Session, Comment, Vote } from '../../models/datamodel';
import { Api, 
  AuthService, 
  ConfigService, 
  UtilService, 
  LocalSessionsService, 
  VoteHandlerService,
  SettingHandlerService } from '../../providers/providers';
import * as $ from 'jquery';

window['$'] = window['jQuery'] = $;

@IonicPage({
  segment: "content/:collectionId/:compareSessionIds", 
  defaultHistory : [ "MyRoomPage" ]
})
@Component({
  selector: 'page-content',
  templateUrl: 'content.html'
})
export class ContentPage implements AfterViewInit {

  compareItems  = [];
  footerHangers = [];
  prcSessionItem = 10; 
  
  comments = [];
  showsComments : boolean = false;
  commentText : string;

  height : string = "100";

  selectedSession : any = {};

  tags = [];
  showsTags : boolean = false;

  lastPressedX : any; 
  lastPressedY: any; 




  selectedCommentId : number = 0;
  enableCommentList : boolean = false;

  selectedIndex : number = -1; 
  collection : Collection;

  constructor(
    public navCtrl: NavController, 
    navParams: NavParams, 
    public modalCtrl: ModalController, 
    private api : Api, 
    public sanitizer : Sanitizer, 
    private auth : AuthService, 
    public config : ConfigService, 
    public util : UtilService, 
    private localSession: LocalSessionsService, 
    private voteHdl : VoteHandlerService, 
    public settingsHdl : SettingHandlerService) {

        this.compareItems.length = 0; 

        // screen orientation not available on ionicDev
        //this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);

        // get compare sessions muss auch über die URL möglich se

        let compareSessionIds = [];

        if (typeof(navParams.get('compareSessionIds')) == "string"){
          for (const id of navParams.get('compareSessionIds').split(",")){
              compareSessionIds.push(parseInt(id));
          }
        }else{
          compareSessionIds = navParams.get('compareSessionIds');
        }

        this.api.compareSessionIds = compareSessionIds;

        let onlineSessionIds = compareSessionIds;

        let localSessionIds = this.localSession.compareLocalSessionIds;

        // get local sessions
        let localSessions = this.localSession.loadLocalSessionByIds(localSessionIds);
        

        // load online session
        this.api.getSessions(onlineSessionIds).subscribe(
          (data : Session[]) => {

            this.compareItems = localSessions;

            data.forEach(element => {
              let s = new Session(element);
              s.castTags();

              this.compareItems.push(s);
            });

          },
          error => {
            this.api.handleAPIError(error);
          }
        );

   }

   ionViewWillEnter() {
      this.auth.validateAuth(this.navCtrl);
      this.util.toggleTabBarVisible();
    }

    ionViewWillLeave(){
      this.util.toggleTabBarVisible();
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

   toggleCommentShow(session, forceClose = false){

      if (this.selectedSession["sessionId"] != session.getId() && !forceClose){
        this.showsComments = true;
        this.height = "70";
        return;
      }

      if (this.showsComments || forceClose){
        this.showsComments = false;
        this.height = "100";
      }else{
          this.showsComments = true;
          this.height = "70";
      }

   }

   toggleTagsShow(session, forceClose = false){

    if (this.selectedSession["sessionId"] != session.getId() && !forceClose){
      this.showsTags = true;
      this.height = "70";
      return;
    }

    if (this.showsTags || forceClose){
      this.showsTags = false;
      this.height = "100";
    }else{
        this.showsTags = true;
        this.height = "70";
    }

  }

  goToTagSite(url){
    window.open(url, '_system', 'location=yes')
  }

   onPurchaseTagsClick(session : Session){
     console.log(session.tags);

    this.toggleCommentShow(session, true);
    this.toggleTagsShow(session);

    this.selectedSession = session;

    this.tags = session.tags;

   }

   onSessionRemoveClick(session : Session, index : number){

    console.log("i am in the content.jsremove function");
    console.log(index)
    
    let setNewSession = false;

    if (this.selectedSession["sessionId"] == session.getId()){
      this.toggleCommentShow(session, true);
      this.toggleTagsShow(session), true;
      setNewSession = true;
    }
    this.api.toggleCompareSession(session, true);
    this.compareItems.splice(index, 1);

    if (setNewSession){
      this.selectedSession = this.compareItems[0];
    }


  }

   onVoteClick(voteType: number, session: Session){
      this.voteHdl.handleVoteClicked(voteType, session);
   }

   onCommentClick(session : Session){

    console.log("comment got clicked", session);

    this.toggleTagsShow(session, true);
    this.toggleCommentShow(session);
    
    
    if (this.showsComments){
      this.selectedSession = session;

      this.api.getCommentsForSession(session).subscribe(
        (data : Comment[]) => {

          let resultComments = [];

          data.forEach(element => {
            let s = new Comment(element);
            resultComments.push(s);
          });

          this.comments = resultComments;

          console.log(resultComments);

        },
        error => {
          this.api.handleAPIError(error);
        }
      );
    }

   }

   showSettings(evt, comment, index){
     let options = {
        selectedSession : this.selectedSession,
        comments : this.comments,
        selectedIndex : index
      }

    this.settingsHdl.showSettings(evt, comment, 'comment', options);
   }

   


   
   addComment(){
    let session : Session = this.selectedSession; 

    console.log(this.commentText);

    let tmpItem = new Comment({
          commentText : this.commentText, 
          userId : this.auth.getUserId(),
          sessionId : session.getId(),
          commentUserId : this.auth.getUserId(),
          commentUserName : this.auth.getUsername(), 
          commentUserAvatarPath : this.auth.getUserAvatarPath()
        });

        this.api.addCommentToSession(session.getCollectionId(), session.getId(), tmpItem).subscribe(
          (data : any) => 
          
          {
            tmpItem.commentId = data.commentId;
            this.comments.unshift(tmpItem);
            this.commentText = "";
  
          },
          error => {
            this.api.handleAPIError(error);
          }
        );
        

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

          // this.api.addCommentToSession(this.api.selectedCollection.getId(), session.getId(), tmpItem, session);  

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



