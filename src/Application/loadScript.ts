import {Application} from "./Application";


export function loadScript (dataID: string, uri: string) {
    const tag = document.createElement("script");
    tag.src = uri;
    Application.instance.elHead!.appendChild(tag);

}
