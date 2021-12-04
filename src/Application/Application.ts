

/*
Application
 Creates a root view on the document and the main Navigation Controller
 Also holds references to object subscribing to notifications

Usage:
    var _myApp = undefined;
    let MyApplication = MentatJS.Application.extend({

        applicationWillStart: function () {
            // Do stuff like
            this.navigationController.loadViewController(...)
        },

        viewControllerWasLoadedSuccessfully: function (vc) {
            this.navigationController.present(vc, { animated: false });
        }
    });

    window.onload = function (e) {
        _myApp = new MyApplication();
        _myApp.launch();
    }



*/





import {BaseClass} from "../baseClass";
import {isDefined} from "../Utils/isDefined";
import {NavigationController} from "../NavigationController/NavigationController";
import {ViewController} from "../ViewController/ViewController";
import {NotificationHandler} from "./NotificationHandler";
import {View} from "../View/View";
import {Bounds} from "../Bounds/Bounds";
import {Logging} from "../Utils/logging";
import {generateV4UUID} from "../Utils/generateV4UUID";
import {MCache} from "./MCache";
import {postDataWithDelegate} from "../Datasource/download";


export class Application extends BaseClass {
    static _instance: Application;

    id: string = "MentatJS.Application";

    constructor() {
        super();
        Application._instance = this;
    }

    static get instance(): Application {
        // @ts-ignore
        if (isDefined(global)) {
            // @ts-ignore
            if (isDefined(global["Application"])) {
                // @ts-ignore
                return global["Application"];
            } else {
                return Application._instance;
            }
        } else {
            if (isDefined(window["Application"])) {
                return window["Application"];
            } else {
                return Application._instance;
            }
        }
    }


    // Main Navigation Controller
    navigationController?: NavigationController;
    viewController?: ViewController;

    private m_allNavigationControllers: NavigationController[] = [];


    // List of Notifications subscribers
    //  { notification: String, target: ObjectRef }
    // register a subscriber with a call to MentatJS.Application.instance.registerForNotification("kSampleNotification", myObject);
    // unregister the subscription before your object is deleted with MentatJS.Application.instance.deregisterForNotification("kSampleNotification", myObject);
    // see events ViewController.viewWillBeDestroyed and View.viewWasDetached
    // trigger a notification by calling MentatJS.Application.instance.notifyAll(senderObjectRef, "kSampleNotification", optionalParameter);
    notifications: NotificationHandler[] = [];

    // Name of the Application
    // used in Session recordings
    appName: String = '';

    // Main root View
    // access anywhere with MentatJS.Application.instance.rootView
    rootView?: View;

    // Array of View/ViewControllers being downloaded by the Navigation Controller and Cache of View/ViewControllers definitions
    downloadStack : any;
    downloadCache : MCache[] = [];


    // Identifier for the current session
    // if recording session is enabled
    sessionToken:string = "";
    // Identifier for the current user if known
    userToken:string = "";


    // cached to avoid relayouts
    documentElementClientWidth:number = 0;
    documentElementClientHeight:number = 0;
    elHead?: HTMLElement;


    keyValues: any = {};


    isInAnimationFrame: boolean = false;

    shiftKeyPressed: boolean = false;


    // Wipe the list of subscribers
    resetNotification()  {
        this.notifications = [];
    }

    // override function to point to your application main page.
    wipeAndReload() {
        window.location.href = '/';
    }


    // Enable/Disable Session recording
    // override and return the address of a JSON endpoint
    uriForSessionEvents():string {
        return "";
    }
    timestampForSessionEvents():string {
        return ""+ new Date();
    }

    // Main entry-point for the App
    // instantiate  a Navigation Controller and a Root View
    // then calls applicationWillStart
    launch() {
        // init the vars
        this.navigationController = undefined;
        this.appName = "";
        this.rootView = undefined;
        this.notifications = [];
        this.downloadStack = [];
        this.downloadCache = [];
        this.keyValues = {};


        // we keep a reference to our App in MentatJS.Application.instance
        // so controls can access it from anywhere
        Application._instance = this;
        // cache the document dimensions to avoid layouts
        this.documentElementClientWidth = document.documentElement.clientWidth;
        this.documentElementClientHeight = document.documentElement.clientHeight;
        this.elHead = document.head || document.getElementsByTagName('head')[0];


        // init the NC,V
        this.navigationController = new NavigationController();
        this.rootView = new View();
        this.rootView.boundsForView = function (parentBounds: Bounds): Bounds {
            let b = new Bounds(0,0, Application.instance.documentElementClientWidth, Application.instance.documentElementClientHeight);
            return b;
        };
        this.navigationController.initNavigationControllerWithRootView('NavigationController.instance',this.rootView);
        this.navigationController.rootView!.initView('rootView');
        // attach the view to the DOM
        document.getElementsByTagName('body')[0].appendChild(this.navigationController.rootView!.getDiv());
        // we don't want anything to overflow on the main view
        // views that we will attach later can be scrollable
        this.rootView.getDiv().style.overflow = 'hidden';


        // there's no ViewController so we put a ref to our App
        this.rootView.viewController = new ViewController();
        // resize the view ( normally done automatically when a view is attached to its parent view but since its the root view we have to do it by hand)
        this.navigationController.rootView!.doResize();

        window.addEventListener("resize", function() {
            // cache the new size
            Application.instance.documentElementClientWidth = document.documentElement.clientWidth;
            Application.instance.documentElementClientHeight = document.documentElement.clientHeight;
            Application.instance.navigationController!.rootView!.doResize();
            Application.instance.notifyAll(this, "noticeViewportResized");
        });

        document.getElementsByTagName('body')[0].onclick = function (e) {
            //MentatJS.Application.instance.notifyAll(MentatJS.Application.instance, 'noticeBodyClicked', e);
        };


        // Send notification kSystemKeyPressed when ESC,ENTER key are pressed
        document.addEventListener("keyup", _mentatjs_application_keyup);


        // setup some key values used in dragging/resizing views
        this.keyValues["x_pos"] = 0;
        this.keyValues["y_pos"] = 0;
        this.keyValues["currentViewMoving"] = undefined;
        this.keyValues["x_off_start"] = 0;
        this.keyValues["y_off_start"] = 0;
        this.keyValues["mouseDownTime"] = 0;
        this.keyValues["lastMouseDownTime"] = 0;


        // the app is ready
        this.applicationWillStart();
    }

    // Override function in your Application Class
    // at this point, the app is ready to open custom ViewControllers with this.navigationController.loadViewController(...)
    applicationWillStart () {
        //throw 'Application.applicationWillStart must be implemented.';
    }



    // Stop subscribing to a notification
    deregisterForNotification(notification: string,obj_id: string) {
        let idx = -1;

        for (let i = 0; i < this.notifications.length; i++) {
            if (this.notifications[i].message === notification) {
                for (let x = 0; x < this.notifications[i].handlers.length; x += 1) {
                    if (this.notifications[i].handlers[x].id === obj_id) {
                        idx = x;
                        break;
                    }
                }
                if (idx > -1) {
                    if (Logging.enableLogging) {
                        Logging.log('-REG ' + obj_id + '.' + notification);
                    }
                    this.notifications[i].handlers.splice(idx, 1);
                    if (this.notifications[i].handlers.length === 0) {
                        this.notifications.splice(i, 1);
                    }
                    return;
                }
            }
        }
    }

    // Subscribe to a event notification
    // notification is the name of the function that will be called on the object
    registerForNotification (notification: string, objectRef: any) {
        let ret = objectRef.id;
        if (Logging.enableLogging) {
            console.log('+REG ' + ret + '.' + notification);
        }
        // is the notification already in the list?
        for (let i =0; i < this.notifications.length; i += 1) {
            if (this.notifications[i].message === notification) {
                this.notifications[i].handlers.push({
                    id: ret,
                    messageOnDelegate: objectRef
                });
                return ret;
            }
        }
        this.notifications.push({
            message: notification,
            handlers: [{
                id: ret,
                messageOnDelegate: objectRef
            }]
        });
        return ret;
    }

    onNotification(message: string, handler:(sender: any, param?: any) => void) {
        let ret = generateV4UUID();
        if (Logging.enableLogging) {
            console.log('+REG ' + ret + '.' + message);
        }
        // is the notification already in the list?
        for (let i =0; i < this.notifications.length; i += 1) {
            if (this.notifications[i].message === message) {
                this.notifications[i].handlers.push({
                    id: ret,
                    handler: handler
                });
                return ret;
            }
        }
        this.notifications.push({
            message: message,
            handlers: [{
                id: ret,
                handler: handler
            }]
        });
        return ret;
    }


    // Notify subscribers of an event
    // sender is a reference to the object triggering the event
    // notification the function name to execute
    // param is optional
    notifyAll(sender: any,notification: string,param?: any) {
        if (Logging.enableLogging) {
            console.log('+EV ' + notification);
        }
        for (let i = 0; i < this.notifications.length; i++) {
            if (this.notifications[i].message === notification) {

                for (let x = 0; x < this.notifications[i].handlers.length; x += 1) {
                    if (Logging.enableLogging) {
                        console.log('    calling ' + this.notifications[i].handlers[x].id + "." + notification);
                    }
                    if (isDefined(this.notifications[i].handlers[x].handler)) {
                        this.notifications[i].handlers[x].handler(sender, param);
                    }
                    if (isDefined(this.notifications[i].handlers[x].messageOnDelegate)) {
                        let target = this.notifications[i].handlers[x].messageOnDelegate;
                        if (isDefined(target) && isDefined(target[this.notifications[i].message])) {
                            target[this.notifications[i].message](sender, param);
                        } else {
                            console.warn(`* Could not dispatch message ${notification} to ${this.notifications[i].handlers[x].id}`);
                        }
                    }

                }
            }
        }
    }

    // Record session event
    // called by controls on clicks...
    // if uriForSessionEvents is set
    // it will send a json payload by POST like this:
    // { id: UUID, session_token: String, user_token: String, app: String, type: String, name: String, params: Object, timestamp: String }
    // the timestamp can be customized by overriding timestampForSessionEvents
    session_event(event_type: SessionEvent, event_name: string, event_param?: any) {

        let id = generateV4UUID();
        let event = {
            id: id,
            session_token: this.sessionToken,
            user_token: this.userToken,
            app: this.appName,
            type: event_type,
            name: event_name,
            params: event_param,
            timestamp: this.timestampForSessionEvents()
        };

        let uri = this.uriForSessionEvents();
        if (uri !== "") {
            let delegate = {
                dataWasPosted: function (dataID: string, data: any) {
                    "use strict";

                },
                couldNotPostData: function (dataID: string, err: any) {
                    "use strict";

                }
            };
            postDataWithDelegate(id, uri, JSON.stringify(event), delegate);
        }
    }

    // Check if we already have a cached version of a View/ViewController
    cacheContains(cacheID: string) {
        for (let i = 0; i < this.downloadCache.length; i++) {
            if (this.downloadCache[i].id === cacheID)
                return this.downloadCache[i];
        }
        return undefined;
    }

    // Add/Update a View/ViewController definition
    cache(cacheID: string, object: any) {
        let obj: MCache = new MCache();
        obj.id = cacheID;
        obj.timestamp = + new Date();
        obj.object = object;

        // update if exists
        for (let i = 0; i < this.downloadCache.length; i++) {
            if (this.downloadCache[i].id === cacheID) {
                this.downloadCache[i] = obj;
                return;
            }
        }
        this.downloadCache.push(obj);
    }


    registerNavigationController(nav: NavigationController) {
        this.m_allNavigationControllers.push(nav);
    }
    removeNavigationController(nav: NavigationController) {
        let idx = this.m_allNavigationControllers.findIndex((n) => { return n.id === nav.id;});
        if (idx > -1) {
            this.m_allNavigationControllers.splice(idx, 1);
        }
    }
    findNavigationController(id: string): NavigationController | undefined {
        return this.m_allNavigationControllers.find((n) => { return n.id === id;});
    }

}

export enum SessionEvent {
    kEvent_Runtime = 0x00,
    kEvent_User = 0x01
}


// Send a notification called kSystemKeyPressed on ESC,ENTER
function _mentatjs_application_keyup(e: KeyboardEvent) {
    "use strict";
    let x = e.keyCode;
    if (x===27) {
        Application.instance.notifyAll(Application.instance, "kSystemKeyPressed", e);
    }
    if (x===13) {
        Application.instance.notifyAll(Application.instance, "kSystemKeyPressed", e);
    }
}

