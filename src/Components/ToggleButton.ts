import {View} from "../View/View";
import {Application, SessionEvent} from "../Application/Application";


export class ToggleButton extends View {

    //action: undefined;
    protected input: any;
    protected label: any;

    constructor() {
        super();
    }


    isToggled(): boolean {
        return this.input.checked === true;
    }
    simpleCheckbox: boolean = false;


    initView(id: string) {

        this.id = id;
        this._div = document.createElement('div');
        this._div.id = id;
        this._div.style.height = '28px';
        this._div.style.color = 'blue';
        this._div.style.fontWeight = 'bolder';
        this._div.style.fontFamily = 'FontAwesome5ProLight,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif';
        this._div.style.fontSize = '14px';



        this.input = document.createElement("input");
        this.input.type = "checkbox";
        this.input.id = id + "_toggle";
        if (!this.simpleCheckbox) {
            this.input.className = "cmn-toggle cmn-toggle-round-flat";
        }
        this.input.ref = this;
        this.input.onclick = function () {
            "use strict";
            const event_param = {
                viewController_id: this.ref.viewController.id,
                button_id: this.ref.id,
                value: this.ref.input.checked
            };
            Application.instance.session_event(SessionEvent.kEvent_User,'ToggleButton.Click', event_param);

            if (this.ref.actionDelegate !== undefined) {
                this.ref.actionDelegate[this.ref.actionDelegateEventName](this.ref,this.ref.isToggled());
            }
        };
        this._div.appendChild(this.input);

        this.label = document.createElement("label");
        this.label.setAttribute("for", this.input.id);
        this._div.appendChild(this.label);



        if (this.viewWillLoad !== undefined)
            this.viewWillLoad();
        if (this.viewDidLoad !== undefined)
            this.viewDidLoad();
        this.doResize();
        //this.setToggled(this.isToggled);
    }




    setToggled(t: boolean) {
        this.input.checked = t;
    }


    onEnableStatusChanged(e: boolean) {

        if (!e) {
            this._div.style.border = '1px solid grey';
            this._div.style.color = 'grey';
            this.getDiv().removeEventListener("click",this.onClickEvent);

        } else {
            this._div.style.border = '1px solid blue';
            this._div.style.color = 'blue';
            this.getDiv().addEventListener("click", this.onClickEvent);

        }

    }

    onClickEvent(e:Event) {

    }

    viewWasAttached() {
        this.doResize();
        if (this.parentView) {
            if (this.parentView.viewController) {
                this.viewController = this.parentView.viewController;
            }
        }
        this.getDiv().addEventListener('mouseover', function (e: MouseEvent) {
            // @ts-ignore
            this.style.cursor = 'pointer';
        });
        this.getDiv().addEventListener('mouseout', function (e: MouseEvent) {
            // @ts-ignore
            this.style.cursor = '';
        });

    }




}