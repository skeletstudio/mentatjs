import {View} from "../View/View";
import {ViewController} from "../ViewController/ViewController";
import {MAnimation} from "../Animation/MAnimation";
import {NavigationControllerDelegate} from "./NavigationControllerDelegate";
import {isDefined} from "../Utils/isDefined";
import {Logging} from "../Utils/logging";
import {ViewAnimationKey} from "../Animation/ViewAnimationKey";
import {Easing} from "../Utils/easing";
import {loadScript} from "../Application/loadScript";
import {Application} from "../Application/Application";



export class NavigationController {
    id: String = 'UINavigationController.instance';
    rootView?: View;
    viewControllers: ViewController[] = [];

    history: any[];

    protected animation?: MAnimation;

    constructor() {
        this.rootView = undefined;
        this.history = [];
        this.animation = undefined;
    }


    initNavigationControllerWithRootView (_id: string,_rootView: View) {
        this.id = _id;
        this.rootView = _rootView;
        this.viewControllers = [];
        this.history = [];

        Application.instance.registerNavigationController(this);
    }

    destroy() {
        this.clear();
        Application.instance.removeNavigationController(this);
    }


    loadViewController( vcOpts: { class: string, id: string}, arrayOfFilesToDownload: any[], delegate: NavigationControllerDelegate ) {

        const downloadStack: {
            vcClass: string;
            vcID: string;
            counter: number;
            files: string[];
            navigationController: NavigationController;
            delegate: NavigationControllerDelegate;
        } = {
            vcClass: vcOpts.class,
            vcID: vcOpts.id,
            counter: arrayOfFilesToDownload.length,
            files: [],
            navigationController: this,
            delegate: delegate
        };

        Application.instance.downloadStack.push(downloadStack);

        for (let i = 0; i < arrayOfFilesToDownload.length; i++ ) {
            const downloadID: string = arrayOfFilesToDownload[i].id;
            if (!Application.instance.cacheContains(downloadID)) {
                downloadStack.files.push(downloadID);
                loadScript(downloadID, arrayOfFilesToDownload[i].uri);
            } else {
                downloadStack.counter--;
            }
        }
        if (downloadStack.counter === 0) {
            this._initViewController(downloadStack);
        }
    }


    protected _initViewController(stack: any) {
        let newVC:ViewController;
        // @ts-ignore
        newVC = new (window as Window)[stack.vcClass]();
        //eval('newVC = new ' + stack.vcClass + "();");
        if (!isDefined(newVC)) {
            throw new Error('could not instantiate VC ' + stack.vcClass);
        } else {
            if (Logging.enableLogging) {
                Logging.log('+VC: ' + stack.vcID);
            }
        }
        newVC.vcClass = stack.vcClass;
        newVC.navigationController = this;
        newVC.initViewController(stack.vcID);
        if (newVC.view) {
            newVC.view.viewController = newVC;
        }
        this.viewControllers.push(newVC);
        stack.delegate.viewControllerWasLoadedSuccessfully (newVC);
        stack = { vcClass: '', vcID: '', counter: 0, files:[], delegate: undefined};
    }

    instantiateViewController(id: string, VCClass: any, delegate: NavigationControllerDelegate) {
        let newVC = new VCClass();
        if (!isDefined(newVC)) {
            throw new Error('could not instantiate VC ' + VCClass);
        } else {
            if (Logging.enableLogging) {
                console.log('+VC: ' + id);
            }
        }
        newVC.id = id;
        newVC.navigationController = this;
        newVC.initViewController(id);
        newVC.view.viewController = newVC;
        this.viewControllers.push(newVC);
        if (isDefined(delegate) && isDefined(delegate.viewControllerWasLoadedSuccessfully)) {
            delegate.viewControllerWasLoadedSuccessfully(newVC);
        }
    }


    removeViewController(vcToRemove: ViewController) {
        if (Logging.enableLogging) {
            console.log('-VC ' + vcToRemove.id);
        }

        if (vcToRemove.viewControllerWillBeDestroyed !== undefined) {
            vcToRemove.viewControllerWillBeDestroyed();
        }

        if (isDefined(vcToRemove.view)) {
            if (isDefined(this.rootView)) {
                vcToRemove.view?.detachItSelf();
                delete vcToRemove.view;
            }
        }

        for (let i = 0; i < this.viewControllers.length; i++) {
            if (this.viewControllers[i] === vcToRemove) {
                this.viewControllers.splice(i,1);
                i = 0;
            }
        }
    }

    clear() {

        while (this.viewControllers.length>0) {
            const vc = this.viewControllers[this.viewControllers.length - 1];
            this.removeViewController(vc);
        }
        this.history = [];

    }





    present(vc: ViewController, options?: {  animated?: boolean, direction?: string, duration?: number, replaceCurrentViewController?: boolean }) {

        const opts = {
            animated: (options) ? options.animated || false : false,
            direction: (options) ? options.direction || 'left' : 'left',
            duration: (options) ? options.duration || 1300 : 1300,
            replaceCurrentViewController: (options) ? options.replaceCurrentViewController || true : true
        };
        if (opts.animated === undefined) {
            opts.animated = false;
        }
        if (opts.replaceCurrentViewController === undefined) {
            opts.replaceCurrentViewController = true;
        }
        // let the view prepare for the right bounds
        if (isDefined(this.rootView) && isDefined(vc.view)) {
            vc.viewWillBePresented(this.rootView!.bounds);

            vc.view!.bounds = vc.view!.boundsForView(this.rootView!.getBounds(""));

            this.rootView!.attach(vc.view!);


            recursive_setViewController(vc, vc.view!);
        }


        if (opts.replaceCurrentViewController) {
            if (!opts.animated) {
                for (let i = 0; i < this.viewControllers.length; i++) {
                    if (this.viewControllers[i] !== vc) {
                        const vcToRemove = this.viewControllers[i];
                        this.removeViewController(vcToRemove);
                        i = 0;
                    }
                }
                vc.viewWasPresented();

                this.history.push({
                    class: vc.vcClass,
                    id: vc.id
                });
                if (Logging.enableLogging) {
                    console.log("NavigationController stack for " + this.id);
                    console.dir(this.history);
                }

                let param = {
                    viewController: vc,
                    navigationController: this,
                    rootView: this.rootView
                };
                Application.instance.notifyAll(this, "kViewControllerWasPresented", param);
                return;
            }
        } else {
            if (opts.animated === false) {
                vc.viewWasPresented();
                let param = {
                    viewController: vc,
                    navigationController: this,
                    rootView: this.rootView
                };
                Application.instance.notifyAll(this, "kViewControllerWasPresented", param);
                return;
            }
        }
        // ok we animate
        // from which direction is the new view coming ?

        this.animation = new MAnimation();
        this.animation.initWithDelegate(vc.id,this);

        for (let i = 0; i < this.viewControllers.length; i++) {
            let isNewView = false;
            let aview = undefined;

            if (this.viewControllers[i].id === vc.id) {
                isNewView = true;
                aview = vc.view;
            } else {
                aview = this.viewControllers[i].view;
            }

            const animKey = new ViewAnimationKey();
            animKey.view = aview;
            animKey.easingFunction = Easing.easeOutCirc;
            animKey.duration = 5500;
            switch (opts.direction) {
                case 'left':
                    animKey.transform = 'translateX';
                    if (isNewView) {
                        animKey.startValue = this.rootView!.bounds.width.amount;
                        animKey.endValue = 0;
                    } else {
                        animKey.startValue = 0;
                        animKey.endValue = -this.rootView!.bounds.width.amount;
                    }
                    animKey.direction = -1;
                    break;
                case 'right':
                    animKey.transform = 'translateX';
                    if (isNewView) {
                        animKey.startValue = -this.rootView!.bounds.width.amount;
                        animKey.endValue = 0;
                    } else {
                        animKey.startValue = 0;
                        animKey.endValue = this.rootView!.bounds.width.amount;
                    }
                    animKey.direction = +1;
                    break;
                case 'up':
                    animKey.transform = 'translateY';
                    if (isNewView) {
                        animKey.startValue = this.rootView!.bounds.height.amount;
                        animKey.endValue = 0;
                    } else {
                        animKey.startValue = 0;
                        animKey.endValue = -this.rootView!.bounds.height.amount;
                    }
                    animKey.direction = -1;
                    break;
                case 'down':
                    animKey.transform = 'translateY';
                    if (isNewView) {
                        animKey.startValue = -this.rootView!.bounds.height.amount;
                        animKey.endValue = 0;
                    } else {
                        animKey.startValue = 0;
                        animKey.endValue = this.rootView!.bounds.height.amount;
                    }
                    animKey.direction = +1;
                    break;
            }
            animKey.drawFrame(0.000);
            this.animation.pushAnimationKey(animKey);
        }
        this.animation.startPlaying();
    }

    back(delegate: any) {
        "use strict";
        this.history.pop();
        if (this.history.length===0) return;
        this.loadViewController(this.history[this.history.length-1], [], delegate);
    }


    animationDidFinish(id: string) {
        this.animation = undefined;
        let vc = undefined;
        let i = 0;
        while (i<this.viewControllers.length) {

            if (this.viewControllers[i].id === id) {
                vc = this.viewControllers[i];
            } else {
                const vcToRemove = this.viewControllers[i];
                this.removeViewController(vcToRemove);
                i = -1;
            }
            i++;
        }
        if (vc !== undefined) {
            vc.viewWasPresented();

            this.history.push({
                class: vc.vcClass,
                id: vc.id
            });
            if (Logging.enableLogging) {
                console.log("NavigationController stack for " + this.id);
                console.dir(this.history);
            }

            let param = {
                viewController: vc,
                navigationController: this,
                rootView: this.rootView
            };
            Application.instance.notifyAll(this, "kViewControllerWasPresented", param);
        }
    }
}


function recursive_setViewController (vc: ViewController, view: View) {
    view.viewController = vc;
    for (let i = 0 ; i < view.subViews.length; i++) {
        recursive_setViewController(vc, view.subViews[i]);
    }
}