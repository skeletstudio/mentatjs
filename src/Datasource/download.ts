import {isDefined} from "../Utils/isDefined";


declare var window;

function DownloadWorkerBlobFunction() {

    self.onmessage = function (event) {
        const xmlHttpReq = new XMLHttpRequest();
        //console.log('uri is ' + event.data);
        xmlHttpReq.open("GET", event.data, false);
        xmlHttpReq.send(undefined);
        (this as any).postMessage(xmlHttpReq.responseText);
    };

}

let code = DownloadWorkerBlobFunction.toString();
code = code.substring(code.indexOf("{") + 1, code.lastIndexOf("}"));

export var DownloadWorkerBlob = undefined;
export var DownloadWorkerURI = undefined;


if (typeof window !== "undefined") {
    DownloadWorkerBlob = new window.Blob([code], {type: 'text/javascript'});
    DownloadWorkerURI = window.URL.createObjectURL(DownloadWorkerBlob);
}


function PostWorkerBlobFunction() {
    self.onmessage = function (event) {
        const xmlHttpReq = new XMLHttpRequest();
        //console.log('post to uri ' + event.data.uri);
        xmlHttpReq.open("POST", event.data.uri, true);
        xmlHttpReq.setRequestHeader("Content-type", "application/json");
        xmlHttpReq.onreadystatechange = () => {//Call a function when the state changes.
            if (xmlHttpReq.readyState === 4 && xmlHttpReq.status === 200) {
                postMessage(xmlHttpReq.responseText, "worker");
            }
        };
        xmlHttpReq.send(event.data.postData);
    };
}

let codePost = PostWorkerBlobFunction.toString();
codePost = codePost.substring(codePost.indexOf("{") + 1, codePost.lastIndexOf("}"));

var PostWorkerBlob = undefined;
var PostWorkerURI = undefined;

if (typeof window !== "undefined") {
    PostWorkerBlob = new window.Blob([codePost], {type: 'text/javascript'});
    PostWorkerURI = window.URL.createObjectURL(PostWorkerBlob);
}


function PostFormWorkerBlobFunction() {
    self.onmessage = function (event) {
        const xmlHttpReq = new XMLHttpRequest();
        //console.log('post to uri ' + event.data.uri);
        xmlHttpReq.open("POST", event.data.uri, true);
        xmlHttpReq.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        xmlHttpReq.onreadystatechange = () => {//Call a function when the state changes.
            if (xmlHttpReq.readyState === 4 && xmlHttpReq.status === 200) {
                postMessage(xmlHttpReq.response, "worker");
            }
        };
        xmlHttpReq.responseType = 'blob';
        xmlHttpReq.send(event.data.form);
    };
}

let codePostForm = PostFormWorkerBlobFunction.toString();
codePostForm = codePostForm.substring(codePostForm.indexOf("{") + 1, codePostForm.lastIndexOf("}"));

var PostFormWorkerBlob = undefined;
var PostFormWorkerURI = undefined;

if (typeof window !== "undefined") {
    PostFormWorkerBlob = new window.Blob([codePostForm], {type: 'text/javascript'});
    PostFormWorkerURI = window.URL.createObjectURL(PostFormWorkerBlob);
}


export function downloadData(uri: string, callback: any, errorCallback: any) {

    if (!!(window as any).Worker) {
        const worker = new Worker(DownloadWorkerURI);
        worker.onmessage = function (event) {
            callback(event.data);
        };
        worker.onerror = function (event) {
            errorCallback(event);
        };

        worker.postMessage(uri);

    } else {
        const xmlHttpReq = new XMLHttpRequest();
        xmlHttpReq.open("GET", uri, false);
        xmlHttpReq.send(undefined);
        callback(xmlHttpReq.responseText);
    }
}


export function postFormWithDelegate(dataID: string, uri: string, formElements: any, delegate: any) {

    let urlEncodedData = "";
    const urlEncodedDataPairs = [];

    for (const key in formElements) {
        urlEncodedDataPairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(formElements[key]));
    }
    urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');

    if (!!(window as any).Worker) {
        const worker = new Worker(PostFormWorkerURI);
        worker.onmessage = function (event) {
            delegate.formWasPosted(dataID, event.data);
        };
        worker.onerror = function (event) {
            delegate.couldNotPostForm(dataID, event);
        };
        const obj = {
            uri: uri,
            form: urlEncodedData
        };

        worker.postMessage(obj);
    } else {
        const xmlHttpReq = new XMLHttpRequest();
        xmlHttpReq.open("POST", uri, true);
        xmlHttpReq.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        xmlHttpReq.onreadystatechange = function () {//Call a function when the state changes.
            if (xmlHttpReq.readyState === 4 && xmlHttpReq.status === 200) {
                delegate.formWasPosted(dataID, xmlHttpReq.response);
            }
        };
        xmlHttpReq.responseType = 'blob';
        xmlHttpReq.send(urlEncodedData);
    }
}


export function postDataWithDelegate(dataID: string, uri: string, postData: any, delegate: any) {

    const json = JSON.stringify(postData);

    if (!!(window as any).Worker) {
        const worker = new Worker(PostWorkerURI);
        worker.onmessage = function (event) {
            delegate.dataWasPosted(dataID, event.data);
        };
        worker.onerror = function (event) {
            delegate.couldNotPostData(dataID, event);
        };
        const obj = {
            uri: uri,
            postData: json
        };

        worker.postMessage(obj);
    } else {
        const xmlHttpReq = new XMLHttpRequest();
        xmlHttpReq.open("POST", uri, true);
        xmlHttpReq.setRequestHeader("Content-type", "application/json");

        xmlHttpReq.onreadystatechange = function () {//Call a function when the state changes.
            if (xmlHttpReq.readyState === 4 && xmlHttpReq.status === 200) {
                delegate.dataWasPosted(dataID, xmlHttpReq.responseText);
            }
        };
        xmlHttpReq.send(json);
    }
}


export function downloadDataWithDelegate(dataID: string, uri: string, delegate: any = {
    couldNotDownload: function (_: string, event: any) {
        console.warn(event.message);
    },
    dataWasDownloaded: function (dataID: string, _: any) {
        console.log("OK+ " + dataID);
    }
}) {
    if (!!(window as any).Worker) {
        const worker = new Worker(DownloadWorkerURI);
        worker.onmessage = function (event) {
            delegate.dataWasDownloaded(dataID, event.data);
        };
        worker.onerror = function (event) {
            delegate.couldNotDownload(dataID, event);
        };
        worker.postMessage(uri);
    } else {
        const xmlHttpReq = new XMLHttpRequest();
        xmlHttpReq.open("GET", uri, false);
        xmlHttpReq.send(undefined);
        delegate.dataWasDownloaded(dataID, xmlHttpReq.responseText);
    }
}


export function putDataWithDelegate(dataID: string, uri: string, putData: any, delegate: any = {
    couldNotPut: function (_: string, event: any) {
        console.warn(event.message);
    },
    dataWasPut: function (dataID: string, _: any) {
        console.log("OK+ " + dataID);
    }
}) {
    if (!!(window as any).Worker) {
        const worker = new Worker("FrameworkUI/dev/Workers/Put.js");
        worker.onmessage = function (event) {
            if (isDefined(delegate.dataWasPut)) {
                delegate.dataWasPut(dataID, event.data);
            }
        };
        worker.onerror = function (event) {
            if (isDefined(delegate.couldNotPut)) {
                delegate.couldNotPut(dataID, event);
            }
        };
        const obj = {
            uri: uri,
            putData: putData
        };

        worker.postMessage(obj);
    } else {
        const xmlHttpReq = new XMLHttpRequest();
        xmlHttpReq.open("PUT", uri, false);
        xmlHttpReq.send(undefined);
        if (isDefined(delegate.dataWasPut)) {
            delegate.dataWasPut(dataID, xmlHttpReq.responseText);
        }
    }
}

