import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable, ApplicationRef } from '@angular/core';


import { Collection, Session, Comment, Vote, TrendItem } from '../../models/datamodel'


import 'rxjs/add/operator/map';
import { ConfigService } from '../config/config';

import { FirstRunPage  } from '../../pages/pages';


/**
 * Api is a generic REST Api handler. Set your API url first.
 */
@Injectable()
export class Api { 
  url: string;

  public collections : any = [];

  public sessions : Session[];

  private selectedCollectionId : any;
  public selectedCollection : Collection = new Collection({});
  
  // compare sessions
  public compareSessionIds : Number[] = [];
  public compareSessions : Session[] = [];

  // fitting stream 

  public streamItems : any = [];


  constructor( 
    public http: HttpClient, 
    public config: ConfigService, 
    private ref: ApplicationRef) {
    this.url = this.config.getAPIBase();
  }

  getCollections(userId : string, callback = function(){ }){

    this.http.get<Collection[]>(this.url + '/' + "imgcollection/room/" + userId).subscribe(
      (data) => {
        
        try{
          let outData = data.map(function(val){
            let tmpCollection = new Collection(val);
            tmpCollection.castSessions();
            callback();

            return tmpCollection;
          })

        this.collections = outData;
      }
      catch(err){
       
        console.log(err)
        this.collections = [];
        return null;
      }

      },
      error => {
        this.handleAPIError(error);
      }
    )
  }


  loadCollection(collectionId: Number, forced = false, callback = function () { }){

    if (this.selectedCollection.getId() != collectionId || forced){

      this.http.get<Collection>(this.url + '/' + "imgcollection/" + collectionId, {responseType: 'json'}).subscribe(
        (data) => {
          if (data[0]){
            
            let loadedCol = new Collection(data[0]);
            loadedCol.castSessions();
            this.selectedCollection = loadedCol;

            callback();

          }else{
            console.log("no collection data received for collectionId " + collectionId)
          }
          
        },
        error => {
          this.handleAPIError(error);
        }
      )

    }else{
      return this.selectedCollection;
    }
  }

  addCollection(collection: Collection){
    return this.http.post(this.url + "/imgcollection", collection);
  }

  deleteCollection(collection: Collection){

    let collectionId = collection.getId();

    return this.http.delete(this.url + '/imgcollection' + "/" + collectionId);

  }

  

  setSelectedCollectionId(collectionId){

    if (this.selectedCollectionId == collectionId){
      this.selectedCollectionId = null;
    }else{
      this.selectedCollectionId = collectionId; 
    }
    
  }

  getSelectedCollectionId(){

    let isSelected = true; 
    if (this.selectedCollectionId != null){
      isSelected = false; 
    }

    return { selectedId : this.selectedCollectionId , isSelected : isSelected }; 
  }

/**
 * Function to toggle whether a session should be viewable for comparison or not, flag available to delete 
 * @param session 
 * @param forceDelete 
 */
  toggleCompareSession(session : Session, forceDelete = false){

    let sessionId = session.getId();
    let currIndex = this.compareSessionIds.indexOf(sessionId);

    if ( currIndex == -1){

      // when normally toggling, add session to comparison if not there
      // upon deletion, just make sure to remove and not add again

      if (!forceDelete){
        this.compareSessionIds.push(sessionId);
        this.compareSessions.push(session);
      }
      
    }else{

      this.compareSessionIds.splice(currIndex, 1); 
      this.compareSessions.splice(currIndex, 1)
    }


  }

  addSessionToCollection(collectionId : number, newSession : Session){


    this.collections.forEach((collection : Collection) => {
      
      if (collection.getId() == collectionId){

        collection.addSession(newSession)

      }

    });

  }

  deleteSession(collection: Collection, session: Session){
    let collectionId = collection.getId();
    let sessionId = session.getId();

    this.toggleCompareSession(session, true);

    this.http.delete(this.url + '/imgcollection/' + collectionId + "/session/" + sessionId).subscribe(
      (data) => {

        let session = this.getSessionById(sessionId); 
        let index = this.selectedCollection.sessions.indexOf(session);
        this.selectedCollection.sessions.splice(index, 1);

      },
      error => {
        this.handleAPIError(error);
      }
    );

  }

  private getCollectionByIdHandler(collectionId){

    let getHandler = function getCollectionById(collection){
      return collection.getId() == collectionId;
    }

    return getHandler;
  }

  private getSessionByIdHandler(sessionId){

    let getHandler = function getSessionByIdHandler(session){
      return session.getId() == sessionId;
    }

    return getHandler;
  }

  getCollectionById(collectionId) : Collection{

    let getCollectionByIdHandler = this.getCollectionByIdHandler(collectionId);

    let collection = this.collections.find(getCollectionByIdHandler);

    return collection;

  }

  /**
   * Function to return a session from within the selected collection 
   * @param sessionId 
   */
  getSessionById(sessionId : number) : Session{

    let collection = this.selectedCollection;

    let getSessionByIdHandler = this.getCollectionByIdHandler(sessionId);

    let session = collection.sessions.find(getSessionByIdHandler);

    return session;

  }

  syncToSession(collectionId: number, tmpSessionId : number, data : any){

    console.log("before syncing session")

    // get session with Id from selected collection

    let session = this.getSessionById(tmpSessionId);

    session.sessionId = data.sessionId; 
    session.flagIsTmp = false; 
    session.sessionItemPath = data.sessionItemPath; 
    session.sessionThumbnailPath = data.sessionThumbnailPath;

    this.ref.tick();

  }

  getUser(searchStr: string){

      return this.http.get(this.url + '/' + "user" + "?userSearch=" + searchStr);
      
  }


  getMessages(){
    return this.http.get(this.url + "/user/messages");
  }

  markMessageRead(messageId){

    let body = {};
    this.http.put(this.url + "/user/messages/"+messageId, body);
  }

  registerDevice(id : any){
    return this.http.post(this.url + "/user/push/registerDevice", id);
  }


  /*
  uploadImgStr(collectionId : Number, sessionId : Number, image: Image, imgSequenceNumber : Number){
    
    this.post("imgcollection/" + collectionId + "/session/" + sessionId, image).subscribe(
      (data) => {
          if (image.order == imgSequenceNumber){

            this.loadCollection(collectionId, true);
          }
      },
      error => {
        console.log("error");
        console.log(error)
      }
    )

  }

  */

 addCommentToSession(collectionId : Number, sessionId : Number, comment: Comment, selectedSession : Session){ 
  this.post("imgcollection/" + collectionId + "/session/" + sessionId + "/comment", comment).subscribe(
    (data) => {
      let addedComment = new Comment(data);

      selectedSession.addComment(addedComment);
    },
    error => {
      this.handleAPIError(error);
    }
  )
}

upsertVote(collectionId : number, sessionId: number, vote : Vote){
  this.post("imgcollection/" + collectionId + "/session/" + sessionId + "/vote", vote).subscribe(
    (data) => {
        console.log(data)
    },
    error => {
      this.handleAPIError(error);
    }
  )

}

upsertUserAvatar(avatar : any){
  return this.post("user/avatar", avatar);
}

getTrendStream(options){

    let qry = ''; 

    if (options.limit){
      qry += '?limit=' + options.limit;
    }

    if (options.skip){
      if (qry.length > 0){
        qry += "&"
      }else{
        qry += "?"
      }

      qry += 'skip=' + options.skip
    }

  return this.http.get(this.url + "/stream" + qry)
  
}

post(endpoint: string, body: any, reqOpts?: any) {
    return this.http.post(this.url + '/' + endpoint, body, reqOpts);
  }

  
  // ### BASIC FUNCTIONS ###
/*
  get(endpoint: string, params?: any, reqOpts?: any) {

    let options = this.prepareReqOpts(reqOpts, params);

    return this.http.get(this.url + '/' + endpoint, options);

  }

  

  put(endpoint: string, body: any, reqOpts?: any) {
    return this.http.put(this.url + '/' + endpoint, body, reqOpts);
  }

  delete(endpoint: string, reqOpts?: any) {
    return this.http.delete(this.url + '/' + endpoint, reqOpts);
  }

  patch(endpoint: string, body: any, reqOpts?: any) {
    return this.http.put(this.url + '/' + endpoint, body, reqOpts);
  }
*/

  handleAPIError(error){

    console.log("Error in API call")
    console.log(error);

    let errorCode = error.status;

    switch (errorCode) {
        case 401:
          alert("Unauthorized");
            break;
    }
  }

  prepareReqOpts(reqOpts? : any, params? : any){
    if (!reqOpts) {
      reqOpts = {
        params: new HttpParams()
      };
    }

    // Support easy query params for GET requests
    if (params) {
      reqOpts.params = new HttpParams();
      for (let k in params) {
        reqOpts.params = reqOpts.params.set(k, params[k]);
      }
    }

    let headers = new HttpHeaders();

    //let token = this.auth.getToken();
    //headers.set('x-access-token', token)
    reqOpts.headers = headers;

    return reqOpts;
  }
}
