

/**
 * The datamodel for the comfash application
 *
 */

export class Collection {

  _id: String;
  name : String;
  collectionCreated: Date;
  sessions: Session[];
  access: Object = {
    public: true, 
    groupId : null
  };

  constructor(fields : any) {

    this._id = fields._id || 'datamodel.ts-testid';
    this.name = fields.name;
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
    return this._id;
  }

  getThumbnail(){

    try{
      return this.sessions[0].images[0].path
    }catch(err){
      return '../assets/img/hanger_white.png';
    }

  }

  addSession(newSession : Session){
    this.sessions.push(newSession);
  }

  removeSession(deleteSession : Session){

    let index = this.sessions.indexOf(deleteSession);
    this.sessions.splice(index, 1);

  }

  getCompareSessions(){
    return this.sessions.filter(session => session.sessionIsCompared == true);
  }

}

export class Session {

  sessionId: String;
  images : Image[] = [];
  sessionCreated: Date;
  sessionIsCompared : Boolean = false;

  constructor(fields : any) {
    this.sessionCreated = new Date();
  }

  getId(){
    return this.sessionId;
  }

  getThumbnail(){

    try{
      return this.images[0].path
    }catch(err){
      return '../assets/img/hanger_white.png';
    }

  }

  toggleCompareSession(){
    if (this.sessionIsCompared){
      this.sessionIsCompared = false;
    }else{
      this.sessionIsCompared = true;
    }
    
  }

  getImgIndexFromPercent(PercInt : number){

    let index = (Math.ceil(this.images.length * (PercInt / 100))) -1 ;

    if (index < 0){
      return 0;
    }else if (index > this.images.length - 1){
      return this.images.length - 1 ;
    }else{
      return (Math.ceil(this.images.length * (PercInt / 100))) -1 ;
    }
    
  }

}

export class Image {
  imageId: String;
  path: String;
  height : number;
  width : number;
  comments : Comment[] = [];

  constructor(fields : any) {

    this.path = fields.path || '../assets/img/hanger_white.png';
    this.height = fields.height;
    this.width = fields.width; 
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

}

export class Comment {

  commentId: string;
  yRatio : number;
  xRatio : number;
  commentCreated: Date = new Date(); 
  commentText : String = ''; 
  commentUrl: String = '';

  constructor(fields : any) {

    this.commentText = fields.commentText || '';
    this.yRatio = fields.yRatio || 0.5;
    this.xRatio = fields.xRatio  || 0.5;
  }

  getId(){
    return this.commentId;
  }

  calculateRatioFromCoords(coords: any, viewPort : Element, selectedImg : Image){

      let commentCoordX = coords.x;
      let commentCoordY = coords.y; 

      let viewPortHeight = viewPort.clientHeight; 
      let viewPortWidth = viewPort.clientWidth;
      let viewPortRatio = viewPortWidth / viewPortHeight; 

      let imgHeight = selectedImg.height; 
      let imgWidth = selectedImg.width; 
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

  getScalledCommentPos(viewPortId : string, selectedImg : Image){

    let viewPort = document.getElementById(viewPortId);

    let viewPortHeight = viewPort.clientHeight; 
    let viewPortWidth = viewPort.clientWidth;
    let viewPortRatio = viewPortWidth / viewPortHeight; 

    let imgHeight = selectedImg.height; 
    let imgWidth = selectedImg.width; 
    let imgRatio = imgWidth / imgHeight; 
    
    let scallingFactor = (imgRatio / viewPortRatio);
    
    let coordX, coordY;

    let styleStr = '';

    if (imgRatio > viewPortRatio){

      let newWidthTotal = viewPortHeight * imgRatio * scallingFactor; 
      let addionalWidthOneSide = (newWidthTotal - viewPortWidth ) / 2;
      coordX = (this.xRatio * newWidthTotal) - addionalWidthOneSide;

      if (imgRatio < addionalWidthOneSide/newWidthTotal){
        styleStr += "left: 5px; ";
      }else if (imgRatio > (addionalWidthOneSide + viewPortWidth)/newWidthTotal){
        styleStr += "right: 5px; ";
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
        styleStr += "bottom: 5px;";
      }else if (coordY < addionalHeightOneSide){
        styleStr += "top: 5px;";
      }else{
        styleStr += "top: " + coordY + "px;";
      }

      coordX = this.xRatio * viewPortWidth;
      styleStr+= "left: "+ coordX + "px;";

    }

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
    
    return styleStr;

  }

}