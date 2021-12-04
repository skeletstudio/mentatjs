


export interface NotificationHandler {
    message: string;
    handlers: {
        id: string;
        // we have a reference to a function
        handler?: (sender, param) => void;
        // we have an object reference on which we need to send the message {message}
        messageOnDelegate?: any;
    }[]
}
