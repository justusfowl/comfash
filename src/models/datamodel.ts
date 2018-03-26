


let getVoteIcon = function (voteType){
  let icon = "thumbs-up";

  if (voteType){
    switch (voteType) {
      case -50:
          icon = "frown voteActive";
          break;
      case 25:
          icon = "meh voteActive";
          break;
      case 75:
          icon = "thumbs-up voteActive";
          break;
      case 100:
          icon = "heart voteActive";
          break;
  }
  }

  return icon; 

}




/**
 * The datamodel for the comfash application
 *
 */


export class Collection {

  userId : string; 
  userName : string;
  collectionId: number;
  collectionTitle : string;
  collectionCreated: Date;
  sessions: Session[];
  access: Object = {
    public: true, 
    groupId : null
  };
  sharedWithUsers : any = [];

  constructor(fields : any) {

    this.userId = fields.userId; 
    this.userName = fields.userName;
    this.collectionId = fields.collectionId || null;
    this.collectionTitle = fields.collectionTitle || '';
    this.collectionCreated = new Date();
    this.sessions = fields.sessions || [];

    if (fields.access){
      this.access["public"] = fields.access.public;
      this.access["groupId"] = fields.access.groupId;
    }else{
      this.access["public"] = true;
      this.access["groupId"] = null;
    }
    
  }

  getId(){
    return this.collectionId;
  }

  getUserId(){
    return this.userId;
  }

  getAccess(){
    return this.access;
  }

  getThumbnail(){

    try{
      return this.sessions[0].getThumbnail()
    }catch(err){
      return '/img/hangersbg.png';
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
        amtComments += val.comments.length;
      })
      return amtComments;
    }catch(err){
      return 0;
    }
  }

  addSession(newSession : Session){
    this.sessions.push(newSession);
  }

  removeSession(deleteSession : Session){

    let index = this.sessions.indexOf(deleteSession);
    this.sessions.splice(index, 1);

  }

  castSessions(){

    this.sessions = this.sessions.map(function(sessionItem){

      if (sessionItem.constructor.name != "Session"){
        sessionItem = new Session(sessionItem);
      }
      sessionItem.castComments();
      sessionItem.castVotes();
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

export class Session {

  userId : string;
  sessionId: number;
  //images : Image[];
  comments : Comment[];
  sessionCreated: Date;
  sessionIsCompared : boolean = false;
  votes = [];
  sessionThumbnailPath : string;
  sessionItemPath : string;
  height: number; 
  width: number;
  displayHeight: number; 
  displayWidth: number; 
  displayTop: number; 
  displayLeft: number
  flagIsTmp : boolean = false;

  myVote : Vote;
  hasVote : boolean = false;

  voteStats : any; 

  constructor(fields : any) {
    this.userId = fields.userId  || console.warn("no userId passed to session constructor"); 
    this.sessionId = fields.sessionId || null;
    this.sessionCreated = new Date();
    this.comments = fields.comments || [];
    this.votes = fields.votes || [];
    this.sessionItemPath = fields.sessionItemPath || "";
    this.height = fields.height || 0;
    this.width = fields.width || 0;
    this.sessionThumbnailPath = fields.sessionThumbnailPath || '/img/hangersbg.png';

    this.voteStats = fields.voteStats || {"count" : 0, "avg" : null};


    // per default there is not any vote by the user but if there is, parse it

    if (fields.myVote){
      let newVote = new Vote(fields.myVote); 
      this.myVote = newVote;
    }
    
  }


  getUserId(){
    return this.userId;
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

    this.getMyVote();
  }

  getMyVote(userId = "deprecated"){

    let myUserId = this.userId;

    let getHandler = function getVoteFindHandler(vote){
      return vote.getUserId() == myUserId;
    }

    let myVote = this.votes.find(getHandler);

    if (myVote != undefined){
      this.myVote = myVote;
    }


  }

  getIsHighlyRated(){
    try{
      if (this.voteStats.count > 0 && this.voteStats.avg > 60){
        return true; 
      }else{
        return false;
      }
    }catch(err){
      return false;
    }
  }

  getMyVoteIcon(){
    try {
      let myVote : Vote = this.myVote;
      return myVote.getVoteIcon(myVote.voteType);
    }catch(err){
      return 'thumbs-up';
    }
  }

  setMyVote(vote : Vote){
    this.myVote = vote;
    this.hasVote = true;
  }

  removeMyVote(){
    delete this.myVote;
    this.hasVote = false;
  }

  getId(){
    return this.sessionId;
  }

  getThumbnail(){
    try{
      return this.sessionThumbnailPath;
    }catch(err){
      return '/img/hangersbg.png';
    }
  }

  getSessionItemPath(){
    return this.sessionItemPath;
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

  getVoteIcon (voteType){
    // getVoteTypeIcon function is being used for the 
    return getVoteIcon(voteType);
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

    this.commentCreated = fields.commentCreated || new Date();

  }

  getId(){
    return this.commentId;
  }
  getUsername(){
    return this.commentUserName;
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
      this.messageBody = fields.messageBody; 
      this.linkUrl = JSON.parse(fields.linkUrl);
      this.messageCreated = fields.messageCreated;
      this.sessionThumbnailPath = fields.sessionThumbnailPath  || '/img/hangersbg.png';
      this.collectionTitle = fields.collectionTitle;
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
    itemCreator : string; 
    itemCreatorAvatarPath : string; 
    sessionItemPath : string; 
    sessionThumbnailPath : string;

    collectionTitle: string; 
    collectionId : number;
    colOwner: string; 
    colOwnerId : string; 
    commentCtn: number; 
    votesCtn: number; 
    votesAvg: number; 
    refDate : Date;
    itemType: number; 
    
    commentText: string; 
    commentCreated : Date; 
    
    voteChanged : Date;
    voteType: number;

    myVoteType : number;



  
    constructor(fields : any) {

      // defining the item type (e.g. 1 = vote)
      this.itemType = fields.itemType;

      // referred session
      this.sessionId = fields.sessionId;
      this.sessionItemPath = fields.sessionItemPath; 
      this.sessionThumbnailPath = fields.sessionThumbnailPath  || '/img/hangersbg.png';

      // referred collection
      this.collectionTitle = fields.collectionTitle;
      this.collectionId = fields.collectionId;
      this.colOwner = fields.colOwner;
      this.colOwnerId = fields.colOwnerId; 

      // userId of the creator of the comment/vote /...
      this.userId = fields.userId;

      // username of the creator + avatar
      this.itemCreator = fields.itemCreator;
      this.itemCreatorAvatarPath = fields.itemCreatorAvatarPath  || '/img/hangersbg.png';

      
      // stats on the session / collection
      this.commentCtn = fields.commentCtn;
      this.votesCtn = fields.votesCtn;
      this.votesAvg = fields.votesAvg;
      
      // comment details
      this.commentId = fields.commentId  || null;
      this.commentText = fields.commentText  || null;
      this.commentCreated = fields.commentCreated  || null;

      // vote details
      this.voteChanged = fields.voteChanged || null;
      this.voteType = fields.voteType || null;

      // date of creation of the item (disregarding the itemType)
      this.refDate = fields.refDate; 

      // what is the vote type (if exists) for the requesting user if he/she has voted 
      this.myVoteType = fields.myVoteType || null;


    }

    getVoteIcon (voteType){
      // getVoteTypeIcon function is being used for the 
      return getVoteIcon(voteType);
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


  }
