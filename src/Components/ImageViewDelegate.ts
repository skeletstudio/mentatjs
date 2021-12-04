import {ImageView} from "./ImageView";


export interface ImageViewDelegate {
    imageViewImageNotLoaded?(imageView: ImageView);
}