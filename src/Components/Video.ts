import {View} from "../View/View";
import {Bounds} from "../Bounds/Bounds";
import {ViewStyle} from "../View/ViewStyle";


export class Video extends View {

    source: string = "";
    sourceType: string = '';
    poster: any = undefined;
    allowAirplay: boolean = false;
    showControls: boolean = true;
    autoPlay: boolean = false;
    volume: number = 1.0;

    _videoDiv: any = undefined;

    constructor() {
        super();
    }

    wasResized() {
        if (this._videoDiv) {
            let bounds: Bounds = this.getBounds("");
            this._videoDiv.width = bounds.width.amount;
            this._videoDiv.height = bounds.height.amount;
        }
    }

    viewWasAttached() {
        this._videoDiv = document.createElement('video');
        this.getDiv().appendChild(this._videoDiv);
    }

    render(parentBounds?: Bounds, style?: ViewStyle) {
        super.render(parentBounds, style);
        if (this._videoDiv) {
            while (this._videoDiv.hasChildNodes()) {
                this._videoDiv.removeChild(this._videoDiv.lastChild);
            }
            let bounds: Bounds = this.getBounds("");
            this._videoDiv.width = bounds.width.amount;
            this._videoDiv.height = bounds.height.amount;
            if (this.autoPlay) {
                this._videoDiv.setAttribute('autoplay', 'autoplay');
            }
            if (this.showControls) {
                this._videoDiv.setAttribute('controls', 'controls');
            }
            if (this.allowAirplay) {
                this._videoDiv.setAttribute('airplay', true);
                this._videoDiv.setAttribute('x-webkit-airplay', true);
            }
            this._videoDiv.setAttribute('volume', this.volume);
            this._videoDiv.volume = this.volume;
            var source = document.createElement('source');

            this._videoDiv.setAttribute('src', this.source);



            this._videoDiv.appendChild(source);
        }
    }

}