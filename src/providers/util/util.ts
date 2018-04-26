

import { Injectable } from '@angular/core';
import { ConfigService } from '../config/config';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class UtilService {



    constructor(
        private cfg : ConfigService, 
        private sanitizer:DomSanitizer,
        private translate: TranslateService
    ) {
       
    }

    formatToNoDisplay(value){
        try{
            if (value != null){
                return value;
            }else{
                return "0";
            }
        }catch(err){
            return "0";
        }
    }

    formatToPercent(floatVal){

        try{
            return (floatVal * 100 ).toFixed(0) + "%";
        }catch(err){
            return " - %";
        }

    }

    formatIntToPercent(intVal){
        try{
            return (intVal).toFixed(0) + "%";
        }catch(err){
            return " - %";
        }
        
    }

    sanitizeStyle(value){ 
        return this.sanitizer.bypassSecurityTrustStyle(value);
    }

    sanitizeResource(value){ 
        return this.sanitizer.bypassSecurityTrustResourceUrl(value);
    }

    formatDate(inputDateStr : string){
        let inputDate = new Date(inputDateStr);

        let day = inputDate.getDate();

    }


    formatDateDiffToNow(inputDateStr: string){

        let inputDate = new Date(inputDateStr)

        let desc = "sec";
        let text = " ago"
    
        let now = new Date(); 
        
        // get diff in seconds
        let diff = (now.getTime() - inputDate.getTime()) / 1000;

        if (diff / 60 < 1){
            return diff.toFixed(0) + desc + text; 
        }

        diff = diff / 60;

        if (diff / 60 < 1){
            desc = "min"
            return diff.toFixed(0) + desc + text; 
        }

        diff = diff / 60;

        if (diff / 24 < 1){
            desc = "h"
            return diff.toFixed(0) + desc + text; 
        }

        diff = diff / 24; 
        desc = "d"
        

        return diff.toFixed(0) + desc + text; 

    }

    wrapHostBase(path : string){

        return this.cfg.getHostBase() + "/data" + path;

    }

    isTmpId(id : any){
        let idString = id.toString(); 

        if (idString.indexOf("tmp") > -1){
            return true;
        }else{
            return false;
        }
    }


}
