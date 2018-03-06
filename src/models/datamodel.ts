
/**
 * The datamodel for the comfash application
 *
 */


export class Collection {

  collectionId: Number;
  collectionTitle : String;
  collectionCreated: Date;
  sessions: Session[];
  access: Object = {
    public: true, 
    groupId : null
  };

  constructor(fields : any) {

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

  getAccess(){
    return this.access;
  }

  getThumbnail(){

    try{
      return this.sessions[0].getThumbnail()
    }catch(err){
      return '/assets/img/hangersbg.png';
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

  sessionId: number;
  //images : Image[];
  comments : Comment[];
  sessionCreated: Date;
  sessionIsCompared : boolean = false;
  votes = [];
  thumbnailPath : string;
  sessionItemPath : string;
  height: number; 
  width: number;

  constructor(fields : any) {
    this.sessionId = fields.sessionId || null;
    this.sessionCreated = new Date();
    this.comments = fields.comments || [];
    this.sessionItemPath = fields.sessionItemPath || "";
    this.height = fields.height || 0;
    this.width = fields.width || 0;
    this.thumbnailPath = fields.thumbnailPath || '/assets/img/thumbnailDefault.png';
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

/*
  castImages(){
    
    this.images = this.images.map(function(imageItem){
      if (imageItem.constructor.name != "Image"){
          imageItem = new Image(imageItem);
      }
      imageItem.castComments();
      return imageItem;
    });

  }
*/
  getId(){
    return this.sessionId;
  }

  getThumbnail(){
    try{
      return this.thumbnailPath;
    }catch(err){
      return '/assets/img/hangersbg.png';
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

  getImgIndexFromPercent(PercInt : number){

    return 0;
    /*
    let index = (Math.ceil(this.images.length * (PercInt / 100))) -1 ;

    if (index < 0){
      return 0;
    }else if (index > this.images.length - 1){
      return this.images.length - 1 ;
    }else{
      return (Math.ceil(this.images.length * (PercInt / 100))) -1 ;
    }
    */
  }

  getNoComments(){
    return this.comments.length;
  }

  getNoVotes(){
    return this.votes.length;
  }

}
/*
export class Image {
  imageId: String;
  imagePath: String;
  height : number;
  width : number;
  comments : Comment[];
  order : number;

  constructor(fields : any) {
    this.imageId = fields.imageId || null;
    this.imagePath = fields.imagePath || '/assets/img/hangersbg.png';
    this.comments = fields.comments || [];
    this.height = fields.height;
    this.width = fields.width; 
    this.order = fields.order;
  }

  getImagePath(){
    return this.imagePath;
  }

  getId(){
    return this.imageId;
  }

  addComment(comment: Comment){
    this.comments.push(comment);
  }

  getComments(){
    return this.comments;
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

}

*/

export class Comment {

  commentId: number;
  yRatio : number;
  xRatio : number;
  commentCreated: Date = new Date(); 
  commentText : String = ''; 
  commentUrl: String = '';
  imageId: number;

  constructor(fields : any) {
    this.commentId = fields.commentId || null;
    this.commentText = fields.commentText || '';
    this.yRatio = fields.yRatio || 0.5;
    this.xRatio = fields.xRatio  || 0.5;
    this.imageId = fields.imageId
  }

  getId(){
    return this.commentId;
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
        styleStr += "bottom: 95px;";
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