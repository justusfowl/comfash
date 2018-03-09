import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';


import { Collection, Session, Comment } from '../../models/datamodel'


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


  constructor( public http: HttpClient, public config: ConfigService ) {
    this.url = this.config.getAPIBase();
  }

  getCollections(callback = function(){ }){

    this.http.get<Collection[]>(this.url + '/' + "imgcollection").subscribe(
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
        console.log("error");
        console.log(error)
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
          console.log("error");
          console.log(error)
        }
      )

    }else{
      return this.selectedCollection;
    }
  }

  addCollection(collection: Collection){
    
    this.http.post(this.url + "/imgcollection", collection).subscribe(
      (data) => {
          console.log(data);
          this.getCollections();
      },
      error => {
        console.log("error");
        console.log(error)
      }
    )
  }

  deleteCollection(collection: Collection){

    let collectionId = collection.getId();

    this.http.delete(this.url + '/imgcollection' + "/" + collectionId).subscribe(
      (data) => {
          console.log(data);
          this.getCollections();
      },
      error => {
        console.log("error");
        console.log(error)
      }
    );

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


  toggleCompareSession(session : Session){

    let sessionId = session.getId();
    let currIndex = this.compareSessionIds.indexOf(sessionId);

    if ( currIndex == -1){
      this.compareSessionIds.push(sessionId);
      this.compareSessions.push(session);
    }else{
      this.compareSessionIds.splice(currIndex, 1); 
      this.compareSessions.splice(currIndex, 1)
    }

  }





  getUser(searchStr: string){

      return this.http.get(this.url + '/' + "user" + "?userSearch=" + searchStr);
      
  }


  getMessages(){
    return this.http.get(this.url + "/user/messages");
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
      console.log("error");
      console.log(error)
    }
  )
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
