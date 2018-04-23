import { 
    Component, Input, OnInit, OnDestroy, 
    ViewChild, ViewContainerRef,
    ComponentFactoryResolver, ComponentRef, Output, EventEmitter
  } from '@angular/core';

import { PopoverController } from 'ionic-angular';
import { Vote } from '../../models/datamodel';
import { Api, AuthService, UtilService } from '../../providers/providers';

  @Component({
    selector: 'session-item',

    template: `
        <div #container ></div>
    `
  })
  export class DynamicSessionItemComponent implements OnInit, OnDestroy {
  
    @ViewChild('container', { read: ViewContainerRef })
    container: ViewContainerRef;
  
    @Input()
    type: string;

    @Input()
    totalCnt: number;

    @Input()
    height: number;
  
    @Input()
    context: any;
    
    @Input()
    index: any;

    @Output()
    onCommentClick = new EventEmitter<any>();

  
    private mappings = {
        'image': SessionItemComponentImage,
        'video': SessionItemComponentVideo
    };
  
    private componentRef: ComponentRef<{}>;
  
    constructor(
        private componentFactoryResolver: ComponentFactoryResolver) {
    }
  
    getComponentType(typeName: string) {
        let inputType;
        if (typeName.indexOf("/") > -1){
            inputType = typeName.substring(0,typeName.indexOf("/"));
        }else{
            inputType = typeName;
        }
        
        let type = this.mappings[inputType];
        return type || SessionItemComponentUnknown;
    }
  
    ngOnInit() {


        if (this.type) {

            let componentType = this.getComponentType(this.type);
            
            // note: componentType must be declared within module.entryComponents
            let factory = this.componentFactoryResolver.resolveComponentFactory(componentType);
            this.componentRef = this.container.createComponent(factory);


            // set component context
            let instance = <DynamicSessionItem> this.componentRef.instance;
            
            instance.context = this.context;
            instance.index = this.index;
            instance.totalCnt = this.totalCnt;
            instance.height = this.height;

            if (this.context["flagIsTmp"]){
                instance.flagIsTmp = true;
                instance.itemSessionPath = this.context.getSrc();
            }else{
                instance.flagIsTmp = false;
                instance.itemSessionPath = this.context.getSessionItemPath();
            }

            instance.onCommentClick.subscribe(value => this.handleCommentClicked(value))

        }
    }

    handleCommentClicked(value){
        this.onCommentClick.emit(value)
    }
  
    ngOnDestroy() {
        if (this.componentRef) {
            this.componentRef.destroy();
            this.componentRef = null;
        }
    }
  
  }
  
  export abstract class DynamicSessionItem {
    
    @Output()
    onCommentClick = new EventEmitter<any>();

    context: any;
    index : any;
    flagIsTmp : boolean = false; 
    itemSessionPath : any;
    totalCnt : number;
    height : number;
    
  }
  
  @Component({
    selector: 'session-item-image',
    templateUrl: './session-item.image.html'
  })
  export class SessionItemComponentImage extends DynamicSessionItem {
  
    


    constructor(
        public util : UtilService, 
        public popoverCtrl : PopoverController, 
        public auth : AuthService, 
        public api : Api
    ) {

        super();

    }

    hasCommentClicked(context){
        this.onCommentClick.emit(context);
    }

    getItemSessionPath(itemSessionPath){

        if (this.flagIsTmp){
            return this.util.sanitizeResource(this.itemSessionPath);
        }else{
            return this.util.wrapHostBase(this.itemSessionPath);
        }
    }

    showReactions(ev: any, session: any){

        let hasVote = false;
        if (session.myVote){
          hasVote = true;
        }
     
        let reactions = this.popoverCtrl.create('ReactionsPage', {
          "hasVote" : hasVote
        });
    
        reactions.onDidDismiss((voteType : number) => {
          if (voteType) {
    
            let vote = new Vote({
              sessionId : session.getId(), 
              voteType : voteType, 
              userId : this.auth.getUserId()
            });
    
            if (session.myVote){
              session.myVote.voteType = voteType;
            }else{
              session.setMyVote(vote);
            }
            
            this.api.upsertVote(this.api.selectedCollection.getId(), session.getId(), vote)
    
          }else{
            // unvote = voteType = 0
    
            this.api.deleteVote(this.api.selectedCollection.getId(), session.getId()).subscribe( data => {
              session.removeMyVote();
            })
    
            // this.api.unvote();
          }
        })
    
        reactions.present({
            ev: ev
        });
    
    }

    
  }
  
  @Component({
    selector: 'session-item-video',
    templateUrl: './session-item.video.html'
  })
  export class SessionItemComponentVideo extends DynamicSessionItem {
  
    constructor() {
      super();
  }
    
  }
  @Component({
    selector: 'unknown-component',
    template: `<div style="position: absolute; top: 20%; color: red;">Unknown component</div>`
  })
  export class SessionItemComponentUnknown extends DynamicSessionItem {}