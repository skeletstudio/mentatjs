import {View} from "../View/View";
import {Fill} from "../View/Fill";
import {Border} from "../View/Border";
import {Shadow} from "../View/Shadow";
import {PropertyTextStyle} from "../TextStyle/PropertyTextStyle";
import {renderViewStyle} from "../View/renderViewStyle";
import {Application} from "../Application/Application";
import {isDefined} from "../Utils/isDefined";
import {Label} from "../Components/Label";
import {boundsWithPixels} from "../Bounds/boundsWithPixels";
import {generateV4UUID} from "../Utils/generateV4UUID";


export var contextMenuInstance: ContextMenu = undefined;

export class ContextMenu {
    kind: string = "ContextMenu";
    id: string = 'ContextMenuInstance';
    dataSource?: any = undefined;
    displayed: boolean = false;

    viewRef?: View;
    containerRef?: View;
    lastContext: string = '';

    keyValues: any = {};


    fills: Fill[] = [new Fill(true, "color", "normal", "rgba(80, 80, 80, 1.0)")];
    borders: Border[] = [new Border(true, 1, "solid", "#dfdfdf")];
    shadows: Shadow[] = [new Shadow(true, 1, 1, 2, 0, "#cfcfcf", false)];

    textStyle: PropertyTextStyle = new PropertyTextStyle();


    protected nav?: HTMLElement;
    protected ul?: HTMLElement;

    initContextMenu(id: string, containerRef: View) {
        this.nav = document.createElement("nav");
        this.nav.id = id;
        this.nav.style.position = 'absolute';
        this.nav.style.zIndex = '999';
        this.nav.style.padding = "12px 0";
        this.nav.style.width = 240 + "px";
        this.nav.style.backgroundColor = "#fff";
        this.nav.style.border = "solid 1px #dfdfdf";
        this.nav.style.boxShadow = "1px 1px 2px #cfcfcf";
        this.ul = document.createElement("ul");
        this.ul.style.listStyle = "none";
        this.ul.style.margin = "0";
        this.ul.style.padding = "0";
        this.nav.appendChild(this.ul);
        this.nav.style.display = 'none';
        containerRef.getDiv().appendChild(this.nav);
        this.containerRef = containerRef;
        this.id = id;

        renderViewStyle(this.nav, this);


        Application.instance.registerForNotification("noticeBodyClicked", this);

    }

    noticeBodyClicked(sender: any) {
        this.hide();
    }

    detachItSelf() {
        if (isDefined(this.nav) && isDefined(this.nav!.parentElement)) {
            this.nav!.parentElement!.removeChild(this.nav!);
            delete this.nav;
            delete this.ul;
        }
        Application.instance.deregisterForNotification("noticeBodyClicked", this.id);
    }


    toggle() {
        this.displayed = !this.displayed;
        this.nav!.style.display = (this.displayed) ? "block" : "none";
    }

    showAt(e: any) {
        this.displayed = true;
        this.nav!.style.display = (this.displayed) ? "block" : "none";
        this.reposition(e);
        this.render();
    }

    reposition(event: any) {
        this.nav!.style.top = event.clientY + "px";
        this.nav!.style.left = event.clientX + "px";
    }

    hide() {
        this.displayed = false;
        this.nav!.style.display = "none";

        // go through the datasource and remove submenus
        let removeSubContextMenus = function (base) {
            if (isDefined(base.contextMenu)) {
                base.contextMenu.hide();
                base.contextMenu.detachItSelf();
                base.contextMenu = undefined;
            }
            if (isDefined(base.subMenus)) {
                for (let i = 0; i < base.subMenus.length; i += 1) {
                    removeSubContextMenus(base.subMenus[i]);
                }
            }
        }
        if (isDefined(this.dataSource)) {
            for (let i = 0; i < this.dataSource.length; i += 1) {
                removeSubContextMenus(this.dataSource[i]);
            }
        }

    }



    itemSelected(id: string, e: any) {

    }

    render() {
        while (this.ul!.children.length > 0) {
            this.ul!.removeChild(this.ul!.lastChild!);
        }

        if (!isDefined(this.dataSource)) {
            return;
        }

        for (let i = 0; i < this.dataSource.length; i += 1) {

            let li = document.createElement("li");
            li.style.display = "block";
            li.style.position = "relative";
            if (i < this.dataSource.length - 1) {
                li.style.marginBottom = "4px";
            }

            if (this.dataSource[i].id != "sep") {
                li.style.height = 24 + "px";


                let hasSubMenus: boolean = false;
                if (isDefined(this.dataSource[i].subMenus) && this.dataSource[i].subMenus.length > 0) {
                    hasSubMenus = true;
                }

                let checked = document.createElement("div");
                checked.style.position = "absolute";
                checked.style.top = 0 + "px";
                checked.style.left = 0 + "px";
                checked.style.width = 20 + "px";
                checked.style.height = 24 + "px";
                checked.style.textAlign = "center";
                checked.style.fontFamily = "FontAwesome5ProRegular";
                checked.style.lineHeight = 24 + "px";
                checked.style.fontWeight = '300';
                checked.style.fontSize = 14 + "px";
                checked.innerHTML = "&nbsp;";
                li.appendChild(checked);
                if (this.dataSource[i].checked === true) {
                    checked.innerHTML = "&#xf00c;";
                }

                let a: any = document.createElement("a");

                // a.style.padding = "4px 12px";

                if (this.dataSource[i].disabled === true) {
                    a.style.color = "#acacac";
                } else {
                    a.style.color = "#0066aa";
                }
                a.style.textDecoration = "none";
                a.href = "#";
                a.style.position = "absolute";
                a.style.top = 0 + "px";
                a.style.left = 20 + "px";
                a.style.width = 240 - 20 + "px";
                a.style.height = 24 + "px";
                a.style.lineHeight = 24 + "px";
                a.innerHTML = this.dataSource[i].text;
                a.contextMenuRef = this;
                a.id = this.dataSource[i].id;
                if (this.dataSource[i].disabled !== true && hasSubMenus === false) {
                    let clickHandle = function (e: MouseEvent) {
                        e.stopPropagation();
                        if (isDefined(a.contextMenuRef)) {
                            a.contextMenuRef.itemSelected(a.id, e);
                        }
                    };
                    a.addEventListener("click", clickHandle);
                }



                if (hasSubMenus) {
                    this.dataSource[i].rightView = new Label();
                    this.dataSource[i].rightView.boundsForView = function (parentBounds) {
                        return boundsWithPixels({
                            x: 0,
                            y: 0,
                            width: 20,
                            height: parentBounds.height.amount,
                            unit: 'px',
                            position: 'absolute'
                        });
                    };
                    this.dataSource[i].rightView.fillLineHeight = true;
                    this.dataSource[i].rightView.fontFamily = "FontAwesome5ProRegular";
                    this.dataSource[i].rightView.lineHeight = 24;
                    this.dataSource[i].rightView.fontWeight = '300';
                    this.dataSource[i].rightView.fontSize = 14;
                    this.dataSource[i].rightView.text = "&#xf105;";
                    this.dataSource[i].rightView.initView(generateV4UUID());

                    let rvBounds = this.dataSource[i].rightView.getBounds("");

                    let container = document.createElement("div");
                    container.style.width = rvBounds.width.amount + rvBounds.width.unit;
                    container.style.height = 24 + "px";
                    container.style.left = 240 - 10 - rvBounds.width.amount + rvBounds.width.unit;
                    container.style.top = 0 + "px";
                    container.style.position = "absolute";
                    li.append(container);
                    container.appendChild(this.dataSource[i].rightView.getDiv());
                    this.dataSource[i].rightView.viewWasAttached();
                    this.dataSource[i].rightView.doResize();
                    this.dataSource[i].rightView.render();

                    if (!isDefined(this.dataSource[i].contextMenu)) {
                        let cm = new ContextMenu();
                        cm.dataSource = this.dataSource[i].subMenus;
                        cm.keyValues["previousContextMenu"] = this;
                        cm.initContextMenu("contextMenu" + this.dataSource[i].id, this.containerRef);
                        cm.itemSelected = function (id, e) {
                            if (isDefined(this.keyValues["previousContextMenu"])) {
                                (<ContextMenu>this.keyValues["previousContextMenu"]).itemSelected(id, e);
                            }
                        }
                        this.dataSource[i].contextMenu = cm;
                    }
                    a.contextMenuRef = this.dataSource[i].contextMenu;
                    a.liRef = li;
                    let clickHandle = function (e: MouseEvent) {
                        e.stopPropagation();
                        if (isDefined(this.contextMenuRef)) {
                            let bounds = this.liRef.getBoundingClientRect();
                            (<ContextMenu>this.contextMenuRef).reposition({clientX: parseInt(bounds.left) + parseInt(bounds.width), clientY: parseInt(bounds.top) - 12});
                            (<ContextMenu>this.contextMenuRef).toggle();
                            (<ContextMenu>this.contextMenuRef).render();
                        }
                    };
                    a.addEventListener("click", clickHandle);


                } else {
                    if (isDefined(this.dataSource[i].rightView)) {
                        let rvBounds = this.dataSource[i].rightView.getBounds("");
                        let container = document.createElement("div");
                        container.style.width = rvBounds.width.amount + rvBounds.width.unit;
                        container.style.height = 24 + "px";
                        container.style.left = 240 - 10 - rvBounds.width.amount + rvBounds.width.unit;
                        container.style.top = 0 + "px";
                        container.style.position = "absolute";
                        li.append(container);
                        container.appendChild(this.dataSource[i].rightView.getDiv());
                        this.dataSource[i].rightView.viewWasAttached();
                        this.dataSource[i].rightView.doResize();
                        this.dataSource[i].rightView.render();
                    }
                }


                li.appendChild(a);
            } else {
                let hr = document.createElement("hr");
                li.appendChild(hr);
            }
            this.ul!.appendChild(li);

        }

    }




}