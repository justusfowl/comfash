import { 
    Component, Input, OnInit, OnDestroy, 
    ViewChild, ViewContainerRef,
    ComponentFactoryResolver, ComponentRef, Output, EventEmitter, OnChanges, SimpleChanges
  } from '@angular/core';

import { PopoverController } from 'ionic-angular';
import { Api, AuthService, UtilService } from '../../providers/providers';

  @Component({
    selector: 'session-item',

    template: `
        <div #container ></div>
    `
  })
  export class DynamicSessionItemComponent implements OnInit, OnDestroy, OnChanges {
  
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

    @Output()
    onVoteClick = new EventEmitter<any>();

    @Output()
    onTagsClick = new EventEmitter<any>();
  
    @Output()
    onSessionRemoveClick = new EventEmitter<any>();

    protected myInstance : any;

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
            instance.flagIsTmp = this.context.flagIsTmp;
            instance.itemSessionPath = this.context.getSessionItemPath();
            

            instance.onCommentClick.subscribe(value => this.handleCommentClicked(value));
            instance.onVoteClick.subscribe(value => this.handleVoteClicked(value));
            instance.onTagsClick.subscribe(value => this.handleTagsClicked(value));
            instance.onSessionRemoveClick.subscribe(value => this.handleSessionRemove(value));

            this.myInstance = instance;
        }
    }

    ngOnChanges(changes : SimpleChanges){

        console.log(changes);
        if (changes["totalCnt"] && this.myInstance){
            this.myInstance.totalCnt = changes["totalCnt"].currentValue;
        }
        

    }

    handleCommentClicked(value){
        this.onCommentClick.emit(value)
    }

    handleVoteClicked(value){
        this.onVoteClick.emit(value)
    }

    handleTagsClicked(value){
        this.onTagsClick.emit(value)
    }

    handleSessionRemove(value){
        this.onSessionRemoveClick.emit(value)
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

    @Output()
    onVoteClick = new EventEmitter<any>();

    @Output()
    onTagsClick = new EventEmitter<any>();

    @Output()
    onSessionRemoveClick = new EventEmitter<any>();

    context: any;
    index : any;
    flagIsTmp : boolean = false; 
    itemSessionPath : any;
    totalCnt : number;
    height : number;
    showsComments : boolean = false;
    
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

    getPosInt(position){
        try{
            return parseInt((parseFloat(position)*100).toFixed(0));
        }catch(err){
            return 50;
        }
        
    }

    hasSessionCloseClicked(context){
        console.log("HERE")
        this.onSessionRemoveClick.emit(context)
    }

    hasTagsClicked(context){
        this.onTagsClick.emit(context);
    }

    hasCommentClicked(context){
        if (this.showsComments){
            this.showsComments = false;
        }else{
            this.showsComments = true;
        }
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
            console.log(voteType)
            this.onVoteClick.emit(voteType)
        });
    
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