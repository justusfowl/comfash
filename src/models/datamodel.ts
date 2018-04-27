  /**
   * The datamodel for the comfash application
   *
   */
  
  function padStart2(char : string, input: string){
    if (input.length == 2){
      return input;
    }else if (input.length == 1){
      return char + input;
    }else{
      return char + char;
    }


  }
  
  export class Collection {
  
    userId : string; 
    userName : string;
    collectionId: number;
    collectionTitle : string;
    collectionDescription : string;
    collectionCreated: Date;
    sessions: Session[];
    sharedWithUsers : any = [];
    privacyStatus : string;
  
    constructor(fields : any) {
  
      this.userId = fields.userId; 
      this.userName = fields.userName;
      this.collectionId = fields.collectionId || null;
      this.collectionTitle = fields.collectionTitle || '';
      this.collectionDescription = fields.collectionDescription || '';
      this.collectionCreated = new Date(fields.collectionCreated) || new Date();
      this.sessions = fields.sessions || [];
      this.privacyStatus = (fields.privacyStatus || 0).toString();
      
    }

    getDayCreated(){
      return padStart2("0", this.collectionCreated.getDate().toString());
    }

    getMonthCreated(){
      return padStart2("0", (this.collectionCreated.getMonth() + 1).toString());
    }

    getYearCreated(){
      return padStart2("0", (this.collectionCreated.getFullYear() - 2000 ).toString());
    }
  
    getId(){
      return this.collectionId;
    }
  
    getUserId(){
      return this.userId;
    }
  
  
    getThumbnail(){
  
      try{
        return this.sessions[0].getThumbnail()
      }catch(err){
        return '/img/hangersbg.png';
      }
  
    }

    getPrimeColor(){
  
      try{
        return this.sessions[0].getPrimeColor()
      }catch(err){
        return '#8c8c8c';
      }
  
    }
  
    getNoSessions(){
      try{
        return this.sessions.length;
      }catch(err){
        return 0;
      }
    }
  
    getNoComments(){
      try{
        let amtComments = 0;
        this.sessions.map(function(val, index){
          amtComments += val.commentCnt;
        })
        return amtComments;
      }catch(err){
        return 0;
      }
    }

    getNoVotes(){
      try{
        let cntVotes = 0;
        this.sessions.map(function(val, index){
          cntVotes += val.voteCnt;
        })
        return cntVotes;
      }catch(err){
        return 0;
      }
    }
  
    addSession(newSession : Session){
      this.sessions.push(newSession);
    }
  
    removeSession(sessionId : number){

      let index = this.sessions.findIndex(x => x["sessionId"] === sessionId);
  
      this.sessions.splice(index, 1);
  
    }
  
    castSessions(){
  
      this.sessions = this.sessions.map(function(sessionItem){
  
        if (sessionItem.constructor.name != "Session"){
          sessionItem = new Session(sessionItem);
        }
        sessionItem.castComments();
        sessionItem.castVotes();
        sessionItem.castTags();
        return sessionItem;
      });
  
    }
  
    getSessionsById(sessionIds : number[]){
      const outArr = [];
  
      for (var i = 0; i<this.sessions.length; i++){
        if (sessionIds.indexOf(this.sessions[i].getId()) > -1){
          outArr.push(this.sessions[i])
        }
      }
  
      return outArr;
  
    }
  
  }

  export class localSession {
    tmpId : string;
    userId: string;
    collectionId: number;
    itemPath : string;
    fullFilePath : string;
    src : string;
    flagIsTmp : boolean = true;
    sessionItemType : string;
    filterOption : any;

    constructor(fields : any) {
      this.tmpId = 'tmp_' + Date.now(),
      this.userId = fields.userId;
      this.collectionId = fields.collectionId;
      this.fullFilePath = fields.fullFilePath;
      this.itemPath = fields.itemName;
      this.src = fields.src
      this.sessionItemType = fields.sessionItemType; 
      this.filterOption = fields.filterOption
    }

    getId(){
      return this.tmpId;
    }

    getThumbnail(){
      return this.src;
    }

    getFileName(){
      return this.itemPath;
    }

    getFullFilePath(){
      return this.fullFilePath;
    }

    getCollectionId(){
      return this.collectionId;
    }

    getSrc(){
      return this.src;
    }
  }
  
  export class Session {
  
    userId : string;
    userName : string;
    userAvatarPath : string; 

    sessionId: number;
    collectionId: number;
    collectionTitle : string;

    comments : Comment[] = [];
    sessionCreated: Date;
    sessionIsCompared : boolean = false;

    tags : PurchaseTag[] = [];

    votes : Vote[] = [];
    sessionThumbnailPath : string;
    sessionItemPath : string;
    height: number; 
    width: number;
    primeColor: string;
    displayHeight: number; 
    displayWidth: number; 
    displayTop: number; 
    displayLeft: number
    flagIsTmp : boolean = false;
    sessionItemType: string; 
  
    myVote : Vote;
    hasVote : boolean = false;
  
    voteCnt : number; 
    voteAvg : number;
    commentCnt: number; 

  
    constructor(fields : any) {
      this.userId = fields.userId  || console.warn("no userId passed to session constructor"); 
      this.userName = fields.userName  || null;
      this.userAvatarPath = fields.userAvatarPath || null;

      this.sessionId = fields.sessionId || null;
      this.collectionId = fields.collectionId || null;
      this.collectionTitle = fields.collectionTitle || null;
      this.sessionCreated = new Date();
      this.comments = fields.comments  || [];
      this.votes = fields.votes || [];
      this.tags = fields.tags || [];
      this.sessionItemPath = fields.sessionItemPath || "";
      this.height = fields.height || 0;
      this.width = fields.width || 0;
      this.sessionThumbnailPath = fields.sessionThumbnailPath || '/img/hangersbg.png';
      this.primeColor = fields.primeColor || '#8c8c8c';
      this.sessionItemType = fields.sessionItemType || "";
  
      this.voteCnt = fields.voteCnt || 0;
      this.voteAvg = fields.voteAvg || 0;
      this.commentCnt = fields.commentCnt || 0;
      
      // per default there is not any vote by the user but if there is, parse it
      if (fields.myVote){
        let newVote = new Vote(fields.myVote); 
        this.myVote = newVote;
        this.hasVote = true;
      }
      
    }
  
    
    getDayCreated(){
      return padStart2("0", this.sessionCreated.getDate().toString());
    }

    getMonthCreated(){
      return padStart2("0", this.sessionCreated.getMonth().toString());
    }

    getYearCreated(){
      return padStart2("0", (this.sessionCreated.getFullYear() - 2000 ).toString());
    }
  
    castComments(){
      
      this.comments = this.comments.map(function(commentItem){
        if (commentItem.constructor.name != "Comment"){
            return new Comment(commentItem);
        }else{
          return commentItem;
        }
      });
    }
  
    castVotes(){
      
      this.votes = this.votes.map(function(voteItem){
        if (voteItem.constructor.name != "Vote"){
            return new Vote(voteItem);
        }else{
          return voteItem;
        }
      });
  
    }

    castTags(){
      
      this.tags = this.tags.map(function(tagItem){
        if (tagItem.constructor.name != "PurchaseTag"){
            return new PurchaseTag(tagItem);
        }else{
          return tagItem;
        }
      });
  
    }
  
    getIsHighlyRated(){
      try{
        if (this.voteCnt > 0 && this.voteAvg > 60){
          return true; 
        }else{
          return false;
        }
      }catch(err){
        return false;
      }
    }
  
    getMyVoteType(){
      try {
        let myVote : Vote = this.myVote;
        return myVote.getVoteType();
      }catch(err){
        return;
      }
    }
  
    setMyVote(vote : Vote){
      if (!this.hasVote){
        this.voteCnt++;
      }
      this.myVote = vote;
      this.hasVote = true;
    }
  
    removeMyVote(){
      delete this.myVote;
      this.hasVote = false;
      this.voteCnt--;
    }
  
    getId(){
      return this.sessionId;
    }

    getUserId(){
      return this.userId;
    }

    getUserName(){
      return this.userName;
    }

    getCollectionId(){
      return this.collectionId;
    }

    getCollectionTitle(){
      return this.collectionTitle; 
    }
  
    getThumbnail(){
      try{
        return this.sessionThumbnailPath;
      }catch(err){
        return '/img/hangersbg.png';
      }
    }

    getPrimeColor(){
      try{
        return this.primeColor;
      }catch(err){
        return '#8c8c8c';
      }
    }
  
    getSessionItemPath(isPic = true){
      
      if (isPic){
        if (this.sessionItemType.indexOf("video") > -1){
          return this.getThumbnail();
        }else{
          return this.sessionItemPath;
        }
      }else{
        return this.sessionItemPath;
      }
      
    }
  
    toggleCompareSession(){
      if (this.sessionIsCompared){
        this.sessionIsCompared = false;
      }else{
        this.sessionIsCompared = true;
      }
    }
  
    getRatio(){
      return this.width/this.height;
    }
  
    getImgIndexFromPercent(PercInt : number){
  
      return 0;
  
    }
  
    getCommentsDisplay(currentPrcSessionItem){
  
      let displayComments = this.comments.filter(function(comment, index){
  
        if (comment.displayBoolHidden == false){
          return comment;
        }
  
      });
  
      return displayComments;
  
    }
  
    getNoComments(){
      return this.comments.length;
    }
  
    getNoVotes(){
      return this.votes.length;
    }
  
    addComment(comment: Comment){
      this.comments.push(comment);
    }
  
  
  }
  
  export class Vote {
  
    sessionId: number;
    voteType : number;
    voteChanged : Date;
    userId : string;
  
    constructor(fields : any) {
      this.sessionId = fields.sessionId;
      this.voteType = fields.voteType;
      this.voteChanged = fields.voteChanged || new Date();
      this.userId = fields.userId;
    }
  
    getUserId(){
      return this.userId;
    }
  
    getVoteType (){
      return this.voteType
    }
  
    
  
  
  }

  export class PurchaseTag {
    tagId: number;
    yRatio : number;
    xRatio : number;
    tagTitle: string ; 
    tagUrl : string;
    tagImage: string;
    tagSeller : string; 
    tagBrand : string;

    constructor(fields : any) {

      this.tagId = fields.tagId;
      this.yRatio = fields.yRatio || 0.5;
      this.xRatio = fields.xRatio  || 0.5;
      this.tagTitle = fields.tagTitle
      this.tagUrl = fields.tagUrl;
      this.tagImage = fields.tagImage; 
      this.tagSeller = fields.tagSeller;
      this.tagBrand = fields.tagBrand;
  
    }

    getLocation(){
      return "top: " + (this.yRatio * 100).toFixed(2)  + "%; left: " + (this.xRatio * 100).toFixed(2) + "%;";
    }
  

  }
  
  
  export class Comment {
  
    commentId: number;
    yRatio : number;
    xRatio : number;
    commentCreated: Date ; 
    commentText : String = ''; 
    commentUrl: String = '';
    sessionId: number;
    prcSessionItem : number;
  
    commentUserId : string; 
    commentUserName : string; 
    commentUserAvatarPath : string;
  
    displayBoolHidden : boolean = false; 
  
  
    constructor(fields : any) {
      this.commentId = fields.commentId || null;
      this.commentText = fields.commentText || '';
      this.yRatio = fields.yRatio || 0.5;
      this.xRatio = fields.xRatio  || 0.5;
      this.sessionId = fields.sessionId
      this.prcSessionItem = fields.prcSessionItem || null;
  
      this.commentUserId = fields.commentUserId || null;
      this.commentUserName = fields.commentUserName || null;
      this.commentUserAvatarPath = fields.commentUserAvatarPath || null;
  
      this.commentCreated = fields.commentCreated || new Date();
  
    }
  
    getId(){
      return this.commentId;
    }
    getUsername(){
      return this.commentUserName;
    }

    getUserAvatarPath(){
      return this.commentUserAvatarPath;
    }
  
    getDate(){
      return this.commentCreated;
    }
  
    calculateDisplay(currentPrcSessionItem){
  
      if (currentPrcSessionItem - 10 <= this.prcSessionItem && currentPrcSessionItem + 10 >= this.prcSessionItem){
        this.displayBoolHidden = false;
        return false;
      }else{
        this.displayBoolHidden = true;
        return true;
      }
  
    }
  
    calculateRatioFromCoords(coords: any, viewPort : Element, selectedSessionItem : Session){
  
        let commentCoordX = coords.x;
        let commentCoordY = coords.y; 
  
        let viewPortHeight = viewPort.clientHeight; 
        let viewPortWidth = viewPort.clientWidth;
        let viewPortRatio = viewPortWidth / viewPortHeight; 
  
        let imgHeight = selectedSessionItem.height; 
        let imgWidth = selectedSessionItem.width; 
        let imgRatio = imgWidth / imgHeight; 
        
        let scallingFactor = (imgRatio / viewPortRatio);
        
        let xRatio, yRatio;
  
        if (imgRatio > viewPortRatio){
  
          let newWidthTotal = viewPortHeight * imgRatio * scallingFactor; 
          let addionalWidthOneSide = (newWidthTotal - viewPortWidth ) / 2;
          xRatio = (commentCoordX + addionalWidthOneSide ) / newWidthTotal;
          yRatio = commentCoordY / viewPortHeight;
  
        }else{
  
          let newHeightTotal = viewPortWidth * imgRatio * scallingFactor; 
          let addionalHeightOneSide = (newHeightTotal - viewPortHeight ) / 2;
          
          yRatio = (commentCoordY + addionalHeightOneSide ) / newHeightTotal;
          xRatio = commentCoordX / viewPortWidth;
  
        }
  
        this.xRatio = xRatio; 
        this.yRatio = yRatio; 
  
    }
  
    getScalledCommentPos(viewPortId : string, selectedSessionItem : Session){
  
      let viewPort = document.getElementById(viewPortId);
  
      let viewPortHeight = viewPort.clientHeight; 
      let viewPortWidth = viewPort.clientWidth;
      let viewPortRatio = viewPortWidth / viewPortHeight; 
  
      let imgHeight = selectedSessionItem.height; 
      let imgWidth = selectedSessionItem.width; 
      let imgRatio = imgWidth / imgHeight; 
      
      let scallingFactor = (imgRatio / viewPortRatio);
      
      let coordX, coordY;
  
      let styleStr = '';
  
      if (imgRatio > viewPortRatio){
  
        let newWidthTotal = viewPortHeight * imgRatio * scallingFactor; 
        let addionalWidthOneSide = (newWidthTotal - viewPortWidth ) / 2;
        coordX = (this.xRatio * newWidthTotal) - addionalWidthOneSide;
  
        if (imgRatio < addionalWidthOneSide/newWidthTotal){
          styleStr += "left: 95px; ";
        }else if (imgRatio > (addionalWidthOneSide + viewPortWidth)/newWidthTotal){
          styleStr += "right: 95px; ";
        }else{
          styleStr += "left: " + coordX + "px; ";
        }
  
        coordY = this.yRatio * viewPortHeight;
  
        styleStr+= "top: "+ coordY + "px; ";
  
      }else{
  
        let newHeightTotal = viewPortWidth * imgRatio * scallingFactor; 
        let addionalHeightOneSide = (newHeightTotal - viewPortHeight ) / 2;
        
        coordY = (this.yRatio * newHeightTotal) - addionalHeightOneSide; 
  
        if (coordY > viewPortHeight){
          styleStr += "bottom: 130px;";
        }else if (coordY < addionalHeightOneSide){
          styleStr += "top: 95px;";
        }else{
          styleStr += "top: " + coordY + "px;";
        }
  
        coordX = this.xRatio * viewPortWidth;
        styleStr+= "left: "+ coordX + "px;";
  
      }
      /*
      let debug = {
        img : selectedImg,
        vH : viewPortHeight, 
        vW : viewPortWidth, 
        vR : viewPortRatio, 
        iH : imgHeight, 
        iW : imgWidth, 
        iR : imgRatio, 
        sF : scallingFactor,
        cX : coordX, 
        cY : coordY, 
        styleStr: styleStr
      }
      */
      return styleStr;
  
    }
  
  }
  
    // ## messages ##
    export class Message {
  
      messageId: number;
      isUnread : boolean;
      senderName : string;
      senderAvatarPath : string;
      receiverName : string;
      messageBody : string;
      messageCreated : Date;
      linkUrl : any;
      sessionThumbnailPath : string;
      collectionTitle : string;

    
    
      constructor(fields : any) {
        this.messageId = fields.messageId;
        this.isUnread = fields.isUnread;
        this.receiverName = fields.receiverName;
        this.senderName = fields.senderName;
        this.senderAvatarPath = fields.senderAvatarPath;
        this.messageBody = fields.messageBody; 
        this.linkUrl = JSON.parse(fields.linkUrl);
        this.messageCreated = fields.messageCreated;
        this.sessionThumbnailPath = fields.sessionThumbnailPath  || '/img/hangersbg.png';
        this.collectionTitle = fields.collectionTitle;
      }

      getSenderAvatar(){
        return this.senderAvatarPath;
      }
  
      getAuthorName(){
        return this.senderName;
      }
  
      getMessage() : string{
        return this.messageBody;
      }
  
      getId(){
        return this.messageId;
      }
  
      setReadStatus(status){
        this.isUnread = status;
      }

      getReadStatus(){
        return this.isUnread;
      }
  
      getLinkUrl(){
        return this.linkUrl;
      }


    }
  
    export interface Message {
      messageId: number;
      isUnread : boolean;
      senderName : string;
      receiverName : string;
      messageBody : string;
      messageCreated : Date;
      linkUrl : any;
    }
    
  
    // ## stream Items  ##
    export class TrendItem {
  
      commentId: number; 
      sessionId: number; 
      userId : string; 
      // username = itemCreator
      userName : string; 
      itemCreator : string; 
      itemCreatorAvatarPath : string; 

      sessionItemPath : string; 
      sessionThumbnailPath : string;
      sessionCreated : Date;
      primeColor : string;
  
      collectionTitle: string; 
      collectionId : number;

      colOwner: string; 
      colOwnerId : string; 
      colOwnerAvatarPath: string;

      commentCnt: number; 
      voteCnt: number; 
      voteAvg: number; 
      refDate : Date;
      itemType: number; 
      
      commentText: string; 
      commentCreated : Date; 
      
      voteChanged : Date;
      voteType: number;
  
      myVoteType : number;
      myVote : Vote;
  
  
    
      constructor(fields : any) {
  
        // defining the item type (e.g. 1 = vote)
        this.itemType = fields.itemType;
  
        // referred session
        this.sessionId = fields.sessionId;
        this.sessionItemPath = fields.sessionItemPath; 
        this.sessionThumbnailPath = fields.sessionThumbnailPath  || '/img/hangersbg.png';
        this.sessionCreated = new Date(fields.sessionCreated);
        this.primeColor = fields.primeColor;
  
        // referred collection
        this.collectionTitle = fields.collectionTitle;
        this.collectionId = fields.collectionId;
        this.colOwner = fields.colOwner;
        this.colOwnerId = fields.colOwnerId; 
        this.colOwnerAvatarPath = fields.colOwnerAvatarPath  || '/img/hangersbg.png';
  
        // userId of the creator of the comment/vote /...
        this.userId = fields.userId;
        this.userName = fields.itemCreator;
  
        // username of the creator + avatar
        this.itemCreator = fields.itemCreator;
        this.itemCreatorAvatarPath = fields.itemCreatorAvatarPath  || '/img/hangersbg.png';
  
        
        // stats on the session / collection
        this.commentCnt = fields.commentCnt;
        this.voteCnt = fields.voteCnt;
        this.voteAvg = fields.voteAvg;
        
        // comment details
        this.commentId = fields.commentId  || null;
        this.commentText = fields.commentText  || null;
        this.commentCreated = fields.commentCreated  || null;
  
        // vote details
        this.voteChanged = fields.voteChanged || null;
        this.voteType = fields.voteType || null;

        // per default there is not any vote by the user but if there is, parse it
        if (fields.voteType){
          this.myVote = new Vote({
            sessionId : fields.sessionId, 
            voteType : fields.myVoteType,
            voteChanged : fields.myVoteChanged, 
            userId : fields.userId
          }); 
        }
  
        // date of creation of the item (disregarding the itemType)
        this.refDate = fields.refDate; 
  
        // what is the vote type (if exists) for the requesting user if he/she has voted 
        this.myVoteType = fields.myVoteType || null;
  
      }

      getId(){
        return this.sessionId;
      }

      getPrimeColor(){
        return this.primeColor;
      }
  
      getItemOwnerId(){
        return this.colOwnerId;
      }
  
      getCollectionId(){
        return this.collectionId;
      }
  
      getItemCreatorId(){
        return this.userId;
      }
  
      getSessionId(){
        return this.sessionId;
      }

      getMyVoteType(){
        if (this.myVote){
          return this.myVote.getVoteType();
        }else{
          return false;
        }
        
      }

      setMyVote(vote : Vote){

        this.voteCnt++;
        this.myVote = vote;
      }
    
      removeMyVote(){
        delete this.myVote;
        this.voteCnt--;
      }
  
  
    }


    export class User {
  
      userId: string;
      userName : string;
      userAvatarPath : string;

      constructor(fields : any) {

        this.userId = fields.userId;
        this.userName = fields.userName;
        this.userAvatarPath = fields.userAvatarPath || '/img/hangersbg.png';
      }
    
      getUserId(){
        return this.userId;
      }
    
      getUserName(){
        return this.userName;
      }

      getUserAvatarPath(){
        return this.userAvatarPath;
      }
    
      
    
    
    }
