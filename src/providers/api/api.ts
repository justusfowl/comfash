import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';


import { Collection, Session, Image, Comment } from '../../models/datamodel'
import { AuthService } from '../auth/auth'

import 'rxjs/add/operator/map';

/**
 * Api is a generic REST Api handler. Set your API url first.
 */
@Injectable()
export class Api {
  url: string = 'http://cl18:9999/api/v01';

  public collections : any = [];

  private selectedCollectionId : Number; 
  

  constructor(public http: HttpClient, public auth: AuthService) {

    
  }

  getCollection(){

    let headers = new Headers({"Content-Type" : "application/json"});
    let reqOpts = {
      headers: headers
    };

    this.http.get<Collection[]>(this.url + '/' + "imgcollection", {responseType: 'json'}).subscribe(
      (data) => {

        console.log("bluub");
        console.log(data);

        let outData = data.map(function(val){

          let tmpCollection = new Collection(val);

          let sessionArray = val.sessions.map(function(session){

            let tmpSession = new Session(session);

            let imgArray = session.images.map(function(img){

              let tmpImg = new Image(img);

              let commentsArray = img.comments.map(function(comment){

                return new Comment(comment);
  
              });

              tmpImg.comments = commentsArray

              return tmpImg;
            });
  
            tmpSession.images = imgArray;
  
            return tmpSession;

          });

          tmpCollection.sessions = sessionArray;

          return tmpCollection;

        })

      this.collections = outData;

      console.log(this.collections);

      },
      error => {
        console.log("error");
        console.log(error)
      }
    )
  }


  get(endpoint: string, params?: any, reqOpts?: any) {
    
    /*
    if (endpoint == "collection"){
      return this.collections;
    }
    */
    
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

    return this.http.get(this.url + '/' + endpoint, {responseType: 'json'});
    
  }

  addCollection(collection){
    collection["authorId"] = this.auth.getUserId();
    this.collections.push(collection);
  }

  deleteCollection(collectionId){
    this.collections.forEach((item: Collection, index) => {
      if (item.getId() == collectionId){
        this.collections.splice(index,1)
      }
    }); 
  }




  setSelectedCollectionId(collectionId){
    this.selectedCollectionId = collectionId; 
  }

  getSelectedCollectionId(){
    return this.selectedCollectionId;
  }

  post(endpoint: string, body: any, reqOpts?: any) {
    return this.http.post(this.url + '/' + endpoint, body, reqOpts);
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
}
