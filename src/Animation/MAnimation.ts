import {ViewAnimationKey} from "./ViewAnimationKey";
import {Logging} from "../Utils/logging";
import {generateV4UUID} from "../Utils/generateV4UUID";


export class MAnimation {
    id: string = '';
    keys: any = undefined;
    activeKeys: any = undefined;
    delegate: any = undefined;

    protected stopping: boolean;
    protected milliKey: number;
    protected thresholds: any[];
    protected fps : number;
    protected fpsInterval : number;
    protected startTime: number;
    protected now: number;
    protected then: number;
    protected elapsed: number;
    protected totalElapsed: number;
    protected endOfAnimation: number;

    constructor() {
        this.stopping = false;
        this.milliKey = 0;
        this.thresholds = [];
        this.fps = 0;
        this.fpsInterval = 0;
        this.startTime = 0;
        this.now = 0;
        this.then = 0;
        this.elapsed = 0;
        this.totalElapsed = 0;
        this.endOfAnimation = 0;
    }


    initWithDelegate(_id: string, _delegate: any) {
        this.id = _id;
        this.delegate = _delegate;
        this.keys = [];
        this.activeKeys = [];
    }


    pushAnimationKey(viewAnimation: ViewAnimationKey) {
        if (this.keys['key' + viewAnimation.offset] === undefined) {
            this.keys['key' + viewAnimation.offset] = [];
        }
        viewAnimation.uniqueGuid = generateV4UUID();
        this.keys['key' + viewAnimation.offset].push(viewAnimation);
    }

    startPlaying() {

        this.activeKeys = [];
        this.stopping = false;
        this.milliKey = -1;
        this.thresholds = [];

        this.fps = 60;
        this.fpsInterval = 0;
        this.startTime = window.performance.now();
        this.now = 0;
        this.then = 0;
        this.elapsed = 0;

        this.fpsInterval = 1000 / this.fps;
        this.then = window.performance.now();
        this.startTime = this.then;

        this.totalElapsed = 0;

        if (this.keys['key0'] !== undefined) {
            if (this.keys['key0'].length>0) {
                for ( var  i = 0; i < this.keys['key0'].length; i++) {
                    ;; //this.activeKeys.push(this.keys['key0'][i]);
                }
            }
        }
        this.endOfAnimation = -1;


        for (let x in this.keys) {

            if (this.keys[x] !== undefined) {
                // is it an array ?
                if (Array.isArray(this.keys[x])) {
                    for (var i = 0; i < this.keys[x].length; i++) {
                        if (this.keys[x][i] === undefined) {
                            console.warn('error key is broken');
                            if (Logging.enableLogging === true) {
                                console.dir(this.keys[x][i]);
                            }
                        }
                        const threshold = {
                            offset: this.keys[x][i].offset,
                            key: this.keys[x][i],
                            triggered: false,
                            stopped: false
                        };
                        this.thresholds.push(threshold);

                        if (this.keys[x][i].offset + this.keys[x][i].duration > this.endOfAnimation) {
                            this.endOfAnimation = this.keys[x][i].offset + this.keys[x][i].duration;
                        }
                    }
                }
            }


        }

        this.animate();
    }


    animate () {
        const ptr = this;
        this.now = window.performance.now();
        this.elapsed = this.now - this.then;
        this.totalElapsed = Math.floor(this.now - this.startTime);
        if (this.totalElapsed>10500) {
            if (this.delegate !== undefined) {
                if (this.delegate.animationDidFinish !== undefined) {
                    this.delegate.animationDidFinish(this.id);
                }
            }
        }

        if (this.elapsed > this.fpsInterval) {
            this.then = this.now - (this.elapsed % this.fpsInterval);

            // add new keys
            for ( var i = 0; i < this.thresholds.length; i++) {
                const t = this.thresholds[i];
                if ( (t.offset <= this.totalElapsed) && (t.triggered === false) ) {
                    t.triggered = true;
                    this.activeKeys.push(t.key);
                }
            }
            // remove old ones
            for ( var i = this.activeKeys.length - 1; i >= 0; i--) {
                const k = this.activeKeys[i];
                if (k.offset + k.duration > this.totalElapsed) {
                    this.activeKeys.slice(i,1);
                }
            }

            this.drawFrame();
        }

        if (this.totalElapsed > this.endOfAnimation) {

            if (this.delegate !== undefined) {
                if (this.delegate.animationDidFinish !== undefined) {
                    this.delegate.animationDidFinish(this.id);
                }
            }
            return;
        }
        requestAnimationFrame(function () {
            ptr.animate();
        });
    }

    drawFrame() {
        const keysToRemove = [];
        let transform = "";
        for ( var i = 0; i < this.activeKeys.length; i++) {
            const k = this.activeKeys[i];
            const expectedEnd = Math.floor(this.startTime + k.offset + k.duration);
            const t = window.performance.now() - this.startTime + k.offset;
            const x = this.totalElapsed / expectedEnd;
            const d = k.duration;
            const b = 0;
            const c = 1;
            const value = k.easingFunction(x, t, b, c, d);


            if (t>d) {
                transform += k.drawFrame(1.000);
                keysToRemove.push(this.activeKeys[i]);
            } else {
                transform += k.drawFrame(value);
            }
        }
        if (Logging.enableLogging === true) {
            console.log(transform);
        }
        this.activeKeys[0].view.getDiv().style.transform = transform;
        while (keysToRemove.length > 0) {
            for (let i = 0; i < this.activeKeys.length; i++) {
                if (keysToRemove[keysToRemove.length-1].uniqueGuid === this.activeKeys[i].uniqueGuid) {
                    this.activeKeys.splice(i,1);
                    keysToRemove.pop();
                    break;
                }
            }

        }

    }

}

