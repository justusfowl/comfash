

import { Injectable } from '@angular/core';

@Injectable()
export class UtilService {



    constructor() {
       
    }

    formatToPercent(floatVal){

        return (floatVal * 100 ).toFixed(0) + "%";
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


}
