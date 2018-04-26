

import { Injectable } from '@angular/core';
import { File } from '@ionic-native/file';
import { AuthService } from '../auth/auth';
import { localSession, Session } from '../../models/datamodel';
import { Platform, ModalController } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';

import { Camera } from '@ionic-native/camera';

import { FileTransfer, FileUploadOptions } from '@ionic-native/file-transfer';
import { Api } from './api';
import { ConfigService } from '../config/config';

@Injectable()
export class LocalSessionsService {
  
    public displayUserLocalSessions : localSession[] = [];


    public userLocalSessions : any[] = [];

    private syncInterval : any;

    constructor(
        private file: File, 
        private auth : AuthService,
        platform: Platform,
        public api : Api,
        public config : ConfigService,
        private transfer: FileTransfer, 
        private sanitizer:DomSanitizer,
        public modalCtrl: ModalController, 
        private camera : Camera
    ) { 
        
        platform.ready().then(() => {

            this.createUserDir();
            this.loadLocalSessions();
            
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
              alert('Unable to take photo');
            })
          } else {
            console.log("click?"!);
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
    
            self.storeImage(collectionId, data, "image/jpg");
    
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
            sessionItemType : sessionItemType
        });

        this.userLocalSessions.push(newSession); 
        this.displayUserLocalSessions.push(newSession)

    }

    loadLocalSessions(){

        let userId = this.auth.getUserId();
        let self = this;

        this.file.listDir( this.file.dataDirectory, userId )     
            .then((data : any) => {
                console.log("this is the files in the directory:");
                console.log(JSON.stringify(data))

                data.forEach(element => {
                    
                    self.getLocalSession(element.name).then(data => {
                        element["src"] = data;
                        element["sessionItemType"] = this.getTypeFromFileName(element.name);
                        self.createTmpSession(element);
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


    storeImage(collectionId: number, imageData, contentType){
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
          self.createTmpSession(element);
    
        })
        .catch(err => console.log('Error in storing an image', JSON.stringify(err)));
    
      }

    deleteLocalSession(fileName){

        // delete item from the display array
        let imageIndexDisplay = this.displayUserLocalSessions.findIndex(x => x.getFileName() == fileName); 
        this.displayUserLocalSessions.splice(imageIndexDisplay, 1);


        //delete item from the userLocalsessions
        let imageIndex = this.userLocalSessions.findIndex(x => x["itemPath"] == fileName); 
        this.userLocalSessions.splice(imageIndex, 1);

        //remove item from local app storage
        this.file.removeFile(this.getUserDir(), fileName)
            .then(element => {
                console.log("file successfully removed"); 
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
