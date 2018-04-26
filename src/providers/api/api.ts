import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable, ApplicationRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Collection, Session, Comment, Vote } from '../../models/datamodel'

import 'rxjs/add/operator/map';
import { ConfigService } from '../config/config';


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


  loadCollection(collectionId: Number, forced = false){

    let returnObj = {};

    if (this.selectedCollection.getId() != collectionId || forced){
      returnObj["observable"] = this.http.get<Collection>(this.url + '/' + "imgcollection/" + collectionId, {responseType: 'json'})
      returnObj["isQry"] = true;
      return returnObj;

    }else{

      let collection = this.selectedCollection; 

      returnObj["observable"] = new Observable(observer => {
          observer.next(collection);
      });
      returnObj["isQry"] = false;

      return returnObj
    }
  }

  getCollectionDetails(collectionId : number){
    return this.http.get<Collection>(this.url + "/imgcollection/" + collectionId + "/detail");
  }

  updateCollectionDetails(collection: Collection){
    return this.http.put(this.url + '/' + "imgcollection/" + collection.getId(), collection)
  }

  handleLoadCollection(data){
    if (data[0]){
            
      let loadedCol = new Collection(data[0]);

      let collectionId = loadedCol.getId();
    
      loadedCol.castSessions();


      this.selectedCollection = loadedCol;

    }else{
      console.log("no collection data received in api.loadCollection(:collectionId)")
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

  getSessions(sessions : any){
    let qryParam = {
      "session" : sessions
    }; 

    return this.http.get<Session[]>(this.url + "/imgcollection/sessions/", {"params" : qryParam})
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

    let getHandler = function getSessionById(session){
      return session.getId() == sessionId;
    }

    return getHandler;
  }
  /**
   * Function to return a collection from within the currently available data of collections
   * @param collectionId 
   */
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

    let getSessionByIdHandler = this.getSessionByIdHandler(sessionId);

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

  getUserProfileBase(userId : string){
    return this.http.get(this.url + "/user/profile/" + userId)
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

 addCommentToSession(collectionId : Number, sessionId : Number, comment: Comment){ 
  return this.post("imgcollection/" + collectionId + "/session/" + sessionId + "/comment", comment);
}

getCommentsForSession(session : Session){
  return this.http.get(this.url + "/imgcollection/" + session.getCollectionId() + "/session/" + session.getId() + "/comment")
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

deleteVote(collectionId : number, sessionId: number){

  return this.http.delete(this.url + "/imgcollection/" + collectionId + "/session/" + sessionId + "/vote");

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

  postAuth(endpoint: string, body: any, reqOpts?: any) {
    return this.http.post(endpoint, body, reqOpts);
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
    console.log(JSON.stringify(error));

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
