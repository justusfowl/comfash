

import { Injectable } from '@angular/core';
import { File } from '@ionic-native/file';
import { AuthService } from '../auth/auth';
import { localSession } from '../../models/datamodel';
import { Platform, ModalController } from 'ionic-angular';

import { Camera } from '@ionic-native/camera';

import { FileTransfer, FileUploadOptions } from '@ionic-native/file-transfer';
import { Api } from './api';
import { ConfigService } from '../config/config';

import { Storage } from '@ionic/storage';

import { BackgroundFetch, BackgroundFetchConfig } from '@ionic-native/background-fetch';


@Injectable()
export class LocalSessionsService {
  
    public displayUserLocalSessions : localSession[] = [];

    public userLocalSessions : any[] = [];

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
        private backgroundFetch: BackgroundFetch
    ) { 
        
        platform.ready().then(() => {

            this.createUserDir();
            this.loadLocalSessions();

            const config: BackgroundFetchConfig = {
                stopOnTerminate: false, // Set true to cease background-fetch from operating after user "closes" the app. Defaults to true.
              };
            
              backgroundFetch.configure(config)
                 .then(() => {
                     console.log('Background Fetch initialized');
                    this.uploadAllSessions();
                    this.backgroundFetch.finish();
            
                 })
                 .catch(e => console.log('Error initializing background fetch', e));

            
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

    captureCameraPicture(collectionId: number, flagIsCamera = true){

        let self = this;
        let sourceType;

        if (flagIsCamera){
            sourceType = this.camera.PictureSourceType.CAMERA;
        }else{
            sourceType = this.camera.PictureSourceType.PHOTOLIBRARY;
        }
        
        if (Camera['installed']()) {
            this.camera.getPicture({
                sourceType : sourceType,
                destinationType: this.camera.DestinationType.DATA_URL,
                encodingType: this.camera.EncodingType.JPEG,
                correctOrientation: true,
                targetWidth: window.outerWidth,
                targetHeight:window.outerHeight
            }).then((data) => {
                
            self.previewCameraPicture(collectionId, data, "image/jpg");
              //self.storeImage(collectionId, data, "image/jpg");
      
            }, (err) => {
              console.log('Aborted to take photo');
            })
          } else {
            console.log("cordova unavailable??"!);
          }

    }

    previewCameraPicture(collectionId : number, data : any, mimeType : string){

        let self = this;

        let settingsOptions = {
            collectionId : collectionId, 
            data : data, 
            mimeType : mimeType
        }

        let settingsModal = this.modalCtrl.create('SessionSettingsPage', {"settingsOptions": settingsOptions});

        settingsModal.onDidDismiss(previewResult => {
          if (previewResult) {

            previewResult["collectionId"] = collectionId;
            previewResult["data"] = data;
            previewResult["mimeType"] = "image/jpg";
    
            self.storeImage(previewResult);
    
          }
        })
        
        settingsModal.present();

    }

    createTmpSession(data){

        let collectionId = parseInt(data.name.substring(0,data.name.indexOf("_")));
        let sessionItemType = this.getTypeFromFileName(data.name);

        console.log("i am in the createTmpSession", collectionId);

        let newSession = new localSession({
            userId : this.auth.getUserId(),
            collectionId : collectionId,
            itemName : data.name, 
            fullFilePath : data.nativeURL,
            src : data.src,
            sessionItemType : sessionItemType,
            filterOption : data.filterOption 
        });

        this.userLocalSessions.push(newSession); 
        this.displayUserLocalSessions.push(newSession)

    }

    loadLocalSessions(){

        let userId = this.auth.getUserId();
        let self = this;

        this.file.listDir( this.file.dataDirectory, userId ) 
            .then((data : any) => {

                data.forEach(element => {
                    
                    self.getLocalSession(element.name).then(data => {

                        element["src"] = data;

                        self.getImageMetaData(element.name).then((val) => {
                            
                            element["sessionItemType"] = val.mimeType || null;
                            element["filterOption"] = val.filterOption || null;
                            
                            self.createTmpSession(element);
                        })
                    })
                });
            })
            .catch(err => console.log('Error in loading the local sessions', JSON.stringify(err)));
    }


    getLocalSession(filename){
        let targetDir = this.getUserDir();
        return this.file.readAsDataURL(targetDir, filename)
    }

    loadLocalSessionArray(collectionId : number){
        this.displayUserLocalSessions = this.userLocalSessions.filter(session => session.collectionId == collectionId);
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

        let collectionId = previewItem.collectionId;
        let imageData = previewItem.data;
        let contentType = previewItem.mimeType;

        let self = this;
        var fileBlob = this.b64toBlob(imageData, contentType);
        let type = contentType.substring(0,contentType.indexOf("/"));

        let targetDir = this.getUserDir();
    
        let fileName = collectionId.toString() + "_" + Date.now().toString() + "_" + type;
    
        this.file.writeFile( targetDir, fileName, fileBlob )      
        .then(element => {
          console.log('image stored');
          console.log(fileName);
          console.log(element);
          element["src"] = 'data:*/*;base64,' + imageData;
          element["sessionItemType"] = type;
          
          // create temporary session item for display until uploaded
          self.createTmpSession(element);

          // store meta data (e.g. filter) to storage
          let metaData = {
              "filename" : fileName,
              "mimeType" : contentType,
              "filterOption" : previewItem.filterOption
          }

          self.setImageMetaData(fileName, metaData).then(res => {
              console.log("metadata saved!", fileName)
          })


    
        })
        .catch(err => console.log('Error in storing an image', JSON.stringify(err)));
    
      }

    deleteLocalSession(fileName){

        let self = this;

        // delete item from the display array
        let imageIndexDisplay = this.displayUserLocalSessions.findIndex(x => x.getFileName() == fileName); 
        this.displayUserLocalSessions.splice(imageIndexDisplay, 1);


        //delete item from the userLocalsessions
        let imageIndex = this.userLocalSessions.findIndex(x => x["itemPath"] == fileName); 
        this.userLocalSessions.splice(imageIndex, 1);

        //remove item from local app storage
        this.file.removeFile(this.getUserDir(), fileName)
            .then(element => {
                self.storage.remove(fileName).then(val => {
                    console.log("file and meta data successfully removed"); 
                })
            })
            .catch(err => console.log('Error in removing  file', JSON.stringify(err)));
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

          })
          .catch(err => console.log('Error in removing  user directory', JSON.stringify(err)));


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

    upload(localSession : localSession) {

        var self = this;
        let collectionId = localSession.getCollectionId();
      
          let options: FileUploadOptions = {
            fileKey: 'file',
            fileName: 'load_from_localsession.jpg', 
            mimeType : 'image/jpg'
          }
      
          let headers = {
            "Authorization" : "Bearer " + this.auth.getToken()
          }
      
          options.headers = headers; 
      
          var fileTransfer = this.transfer.create(); 
      
          let endpoint = this.config.getAPIBase() + '/' + "imgcollection/" + collectionId + "/sessionImg";
      
          console.log("uploading the video in the background");

          let filePath = localSession.getFullFilePath();
          console.log("this is a filepath: ", filePath)
      
          fileTransfer.upload(filePath, endpoint , options, true)
          .then((data) => {
      
            console.log("successfully uploading the video done");

            self.deleteLocalSession(localSession.getFileName());
            self.api.loadCollection(collectionId, true);
       
          }, (err) => {
            console.log("error in uploading the video");
            console.log(JSON.stringify(err));
          })
          
        }




}
