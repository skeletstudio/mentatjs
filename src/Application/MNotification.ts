


export class MNotification {
    target: any = undefined;
    notification: string = "";

    constructor (target: any, notification: string) {
        this.target = target;
        this.notification = notification;
    }
}