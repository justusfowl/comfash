

import { Injectable } from '@angular/core';

@Injectable()
export class UtilService {



    constructor() {
       
    }

    formatToPercent(floatVal){

        return (floatVal * 100 ).toFixed(0) + "%";
    }


}
