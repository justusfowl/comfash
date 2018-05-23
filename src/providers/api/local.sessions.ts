

import { Injectable, EventEmitter } from '@angular/core';
import { File } from '@ionic-native/file';
import { AuthService } from '../auth/auth';
import { Session } from '../../models/datamodel';
import { Platform, ModalController } from 'ionic-angular';

import { Camera } from '@ionic-native/camera';

import { FileTransfer, FileUploadOptions } from '@ionic-native/file-transfer';
import { Api } from './api';
import { ConfigService } from '../config/config';

import { Storage } from '@ionic/storage';

import { BackgroundFetch, BackgroundFetchConfig } from '@ionic-native/background-fetch';
import { MsgService } from '../message/message';


@Injectable()
export class LocalSessionsService {
  
    public displayUserLocalSessions : Session[] = [];

    public userLocalSessions : any[] = [];

    onLocalSessionAdded = new EventEmitter<any>();

    onLocalSessionUploaded = new EventEmitter<any>();

    public isInit : boolean = false;

    compareLocalSessionIds : number[] = [];


    constructor(
        private file: File, 
        private auth : AuthService,
        platform: Platform,
        public api : Api,
        public config : ConfigService,
        private transfer: FileTransfer, 
        public modalCtrl: ModalController, 
        private camera : Camera,
        public storage: Storage,
        private backgroundFetch: BackgroundFetch, 
        public msg: MsgService
    ) { 
        
    }

    initLocalSession(){

        console.log("Initialize local sessions...");

        return new Promise<any>((resolve, reject) => {

            if (this.isInit){
                resolve();
            }

            const config: BackgroundFetchConfig = {
                stopOnTerminate: false, // Set true to cease background-fetch from operating after user "closes" the app. Defaults to true.
              };
            
            this.backgroundFetch.configure(config)
                .then(() => {
                    console.log('Background Fetch initialized');
                    this.uploadAllSessions();
                    this.backgroundFetch.finish();
        
                })
                .catch(e => console.log('Error initializing background fetch', e));

            this.isInit = true;

            this.createUserDir();
            this.loadLocalSessions(resolve, reject)
        });

    }

    createUserDir (){
        let userId = this.auth.getUserId();
        this.file.createDir(this.file.dataDirectory, userId, false)
        .then(_ => {
            console.log('user directory created'); 
            
        })
        .catch(err => console.log('Error in creating user directory', JSON.stringify(err)));
    }

    captureCameraPicture(collectionId: number, navCtrl : any, callback?, flagIsCamera = true){

        let sourceType;

        if (flagIsCamera){
            sourceType = this.camera.PictureSourceType.CAMERA;

            navCtrl.push('CapturePage', {
                "collectionId" : collectionId, 
                "resultCallback" : callback
              });
              

        }else{
            sourceType = this.camera.PictureSourceType.PHOTOLIBRARY;
            if (Camera['installed']()) {
                this.camera.getPicture({
                    sourceType : sourceType,
                    destinationType: this.camera.DestinationType.DATA_URL,
                    encodingType: this.camera.EncodingType.JPEG,
                    correctOrientation: true,
                    targetWidth: window.outerWidth,
                    targetHeight:window.outerHeight
                }).then((data) => {

                navCtrl.push('CapturePage', {
                    "collectionId" : collectionId,
                    "resultCallback" : callback,
                    "imageData" : data
                });
          
                }, (err) => {
                  console.log('Aborted to take photo');
                })
              } else {
                console.log("cordova unavailable??"!);
              }
        }

    }

    createTmpSession(data){

        let collectionId = parseInt(data.name.substring(0,data.name.indexOf("_")));

        let newSession = new Session({
            userId : this.auth.getUserId(),
            sessionId : Date.now(),
            collectionId : collectionId,
            tmpFileName : data.name,
            tmpFullFilePath : data.nativeURL,
            sessionItemPath : data.src, //data_uri -> not base64 encoded!!!
            sessionItemType : data.sessionItemType, //corresponding mime-type to encode data_uri
            filterOption : data.filterOption,
            flagIsTmp : true, 
            tags : data.newTags
        });

        this.userLocalSessions.push(newSession);
        this.displayUserLocalSessions.push(newSession);

        return newSession; 

    }

    loadLocalSessions(resolve, reject){

        let userId = this.auth.getUserId();
        let self = this;

        this.userLocalSessions.length = 0;
        this.displayUserLocalSessions.length = 0;

        this.file.listDir( this.file.dataDirectory, userId ) 
            .then((data : any) => {

                data.forEach(element => {
                    
                    self.getLocalSession(element.name).then(data => {

                        element["src"] = data;

                        self.getImageMetaData(element.name).then((val) => {
                            
                            if (val){

                                element["sessionItemType"] = val.mimeType || null;
                                element["filterOption"] = val.filterOption || null;
                                
                                self.createTmpSession(element);
                            }

                        })
                    })
                });

                this.onLocalSessionAdded.emit(true);

                resolve();
            })
            .catch(err => {
                reject(err);
                console.log('Error in loading the local sessions', JSON.stringify(err));
            });
    }


    getLocalSession(filename){
        let targetDir = this.getUserDir();
        return this.file.readAsDataURL(targetDir, filename)
    }

    readVidAsData(filename){
        let targetDir = this.file.dataDirectory;
        console.log("targetDir");
        console.log(targetDir)
        return this.file.readAsDataURL(targetDir, filename)
    }

    loadLocalSessionArray(collectionIds : number[]){
        let self = this;
        return new Promise<any>((resolve, reject) => {
            if (this.isInit){
                let output = self.getLocalSessionsByCollectionId(collectionIds);
                resolve(output);
            }else{
                this.initLocalSession().then(res => {
                    let output = self.getLocalSessionsByCollectionId(collectionIds);
                    resolve(output);
                })
            }
        });
    }

    getLocalSessionsByCollectionId(collectionIds : number[]){
        let output = {};

        collectionIds.forEach(collectionId => {
            let collectionSessionArr = this.userLocalSessions.filter(session => session.collectionId == collectionId);
            
            output[collectionId] = collectionSessionArr;

        });

        return output;
    }

    loadLocalSessionByIds(arrayOfIds : any){

        if (typeof(arrayOfIds) == "string"){
            let session = this.getLocalSessionById(arrayOfIds);
            return [session]
        }else{
            let output = [];

            arrayOfIds.forEach(inputTmpId => {
                let result = this.getLocalSessionById(inputTmpId); 
                if (result.length > 0){
                    output.push(result[0]);
                }
                
            });

            return output;
        }
    }

    protected getLocalSessionById(tmpSessionId : string){
        return this.userLocalSessions.filter(session => session.getId() == tmpSessionId);
    }

    getTypeFromFileName(filname){
        return filname.substring(filname.lastIndexOf("_")+1,filname.length);
    }

    /**
     * Store additional information, such as filters or purchase tags added to the image
     */
    setImageMetaData(filename: string, metaData: any){

        return this.storage.set("meta_" + filename, metaData);

    }

    getImageMetaData(filename: string){

        return this.storage.get("meta_" + filename);

    }

    storeImage(previewItem : any){

        let self = this;

        return new Promise<any>((resolve, reject) => {

            let collectionId = previewItem.collectionId;
            let imageData = previewItem.data;
            let contentType = previewItem.mimeType;
            let filterOption = previewItem.filterOption;
    
            
            var fileBlob = this.b64toBlob(imageData, contentType);
            let type = contentType.substring(0,contentType.indexOf("/"));
    
            let targetDir = this.getUserDir();
        
            let fileName = collectionId.toString() + "_" + Date.now().toString() + "_" + type;
        
            this.file.writeFile( targetDir, fileName, fileBlob )      
            .then(element => {
              console.log('image stored');
              element["src"] = imageData;
              element["sessionItemType"] = contentType;
              element["filterOption"] = filterOption;
              element["newTags"] = previewItem.newTags;
              
              // create temporary session item for display until uploaded
              let newSession = self.createTmpSession(element);
                
              self.msg.toast("SESSION_ADDED");
              this.onLocalSessionAdded.emit(true);
    
              // store meta data (e.g. filter) to storage
              let metaData = {
                  "filename" : fileName,
                  "mimeType" : contentType,
                  "filterOption" : previewItem.filterOption,
                  "newTags" : previewItem.newTags
              }
    
              self.setImageMetaData(fileName, metaData).then(res => {
                  console.log("metadata saved!", fileName)
              });

              self.upload(newSession);

              resolve();
        
            })
            .catch(err => {
                console.log('Error in storing an image', JSON.stringify(err));
                reject();
            });

        });
    
      }

    deleteLocalSession(fileName){

        let self = this;

        // delete item from the display array
        let imageIndexDisplay = this.displayUserLocalSessions.findIndex(x => x.getFileName() == fileName); 
        this.displayUserLocalSessions.splice(imageIndexDisplay, 1);


        //delete item from the userLocalsessions
        let imageIndex = this.userLocalSessions.findIndex(x => x.getFileName() == fileName); 
        this.userLocalSessions.splice(imageIndex, 1);

        return new Promise<any>((resolve, reject) => {
            //remove item from local app storage
            this.file.removeFile(this.getUserDir(), fileName)
            .then(element => {
                self.storage.remove(fileName).then(val => {
                    console.log("file and meta data successfully removed"); 
                    resolve(true);
                })
            })
            .catch(err => {

                console.log('Error in removing  file', JSON.stringify(err))
                reject(err);
            });
        });

        
    }


    deleteLocalSessions(){
        let userId = this.auth.getUserId();
        let self = this;

        this.file.removeRecursively(this.file.dataDirectory, userId)
        .then(element => {
            this.userLocalSessions.length = 0;

            console.log("user directory deleted"); 

            self.storage.forEach(function ( value, key, itererator){
                if (key.indexOf("meta_") != -1){
                    self.storage.remove(key);
                }
            });

            self.createUserDir();
            console.log("WARNING; for debugging storage is cleared!!!")
            self.storage.clear();

          })
          .catch(err => console.log('Error in removing  user directory', JSON.stringify(err)));


    }

    /**
     * Function to toggle whether a session should be viewable for comparison or not, flag available to delete 
     * @param session 
     * @param forceDelete 
     */
    toggleCompareSession(localSession : Session, forceDelete = false){

        let sessionId = localSession.getId();
        let currIndex = this.compareLocalSessionIds.indexOf(sessionId);

        if ( currIndex == -1){

            // when normally toggling, add session to comparison if not there
            // upon deletion, just make sure to remove and not add again

            if (!forceDelete){
                this.compareLocalSessionIds.push(sessionId);
            }
        
        }else{
         this.compareLocalSessionIds.splice(currIndex, 1); 
        }


    }

    protected getUserDir(){
        let userId = this.auth.getUserId();
        let targetDir = this.file.dataDirectory + userId + "/";
        return targetDir; 
    }


    /**
     * Convert a base64 string in a Blob according to the data and contentType.
     * 
     * @param b64Data {String} Pure base64 string without contentType
     * @param contentType {String} the content type of the file i.e (image/jpeg - image/png - text/plain)
     * @param sliceSize {Int} SliceSize to process the byteCharacters
     * @see http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
     * @return Blob
     */
    protected b64toBlob(b64Data, contentType, sliceSize = 512) {
        contentType = contentType || '';
    
        var byteCharacters = atob(b64Data);
        var byteArrays = [];
    
        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);
    
            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
    
            var byteArray = new Uint8Array(byteNumbers);
    
            byteArrays.push(byteArray);
        }
    
        var blob = new Blob(byteArrays, {type: contentType});
        return blob;
    }


    uploadAllSessions(){
        let self = this; 

        this.userLocalSessions.forEach(element => {
            self.upload(element);
        });
    }

    upload(localSession : Session) {
        var self = this;
        
        return new Promise<any>((resolve, reject) => {

            let collectionId = localSession.getCollectionId();
      
            let options: FileUploadOptions = {
              fileKey: 'file',
              fileName: 'load_from_localsession.jpg', 
              mimeType : 'image/jpg'
            }
        
            let headers = {
              "Authorization" : "Bearer " + this.auth.getToken()
            }

            let params = {
                "filterOption" : localSession.filterOption, 
                "newTags" : JSON.stringify(localSession.tags)
              }
        
            options.headers = headers;
            options.params = params; 
        
            var fileTransfer = this.transfer.create(); 
        
            let endpoint = this.config.getAPIBase() + '/' + "imgcollection/" + collectionId + "/sessionImg";
        
            console.log("uploading the video in the background");
  
            let filePath = localSession.getFullFilePath();
            console.log("this is a filepath: ", filePath)
        
            fileTransfer.upload(filePath, endpoint , options, true)
            .then((data) => {
                data["localSessionId"] = localSession.getId();
        
                console.log("successfully uploading the video done");
               
                self.deleteLocalSession(localSession.getFileName()).then(delResult => {
                    self.onLocalSessionUploaded.emit(data);
                }, (err) => {
                    reject({"error" : "Something went wrong with removing the local session/file"});
                    console.log(JSON.stringify(err));
                });
                
                resolve({"code" : 200});
         
            }, (err) => {
                reject({"error" : "Something went wrong with syncing and uploading"});
                console.log("error in uploading the video");
                console.log(JSON.stringify(err));
            })

        });

    }
}
