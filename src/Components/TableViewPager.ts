import {View} from "../View/View";
import {DataSource, DataSourceBind} from "../Datasource/DS";
import {Label} from "./Label";
import {TextField} from "./TextField";
import {Bounds} from "../Bounds/Bounds";
import {ViewStyle} from "../View/ViewStyle";
import {boundsWithPixels} from "../Bounds/boundsWithPixels";
import {Btn} from "./Btn";
import {Drp} from "./Drp";


export class TableViewPager extends View implements DataSourceBind {

    className: string = "TableViewPager";

    delegate?: any = undefined;
    dataSource?: DataSource;
    maxSequentialButtons: number = -1;

    protected backPage?: Btn;
    protected page?: Label;
    protected txt?: TextField;
    protected ofTotal?: Label;
    protected nextPage?: Btn;
    protected total?: Label;
    protected drp?: Drp;
    protected showResults?: Label;

    constructor () {
        super();

        this.styles = [
            {
                kind: "ViewStyle",
                fills: []
            },
            {
                kind: "ViewStyle",
                subViewId: "leftButton"
            },
            {
                kind: "ViewStyle",
                subViewId: "rightButton"
            },
            {
                kind: "ViewStyle",
                subViewId: "textField"
            },
            {
                kind: "ViewStyle",
                subViewId: "label"
            },
            {
                kind: "ViewStyle",
                subViewId: "dropDown"
            }

        ]

    }

    bindDataSourceUpdated(ds: DataSource) {
        this.reloadData();
    }


    bindDataSource(ds: DataSource) {
        this.dataSource = ds;
    }


    render (parentBounds?: Bounds, style?: ViewStyle) {
        "use strict";
        super.render(parentBounds, style);
        this.reloadData();
    }


    reloadData() {

        this.detachAllChildren();

        if (!this.dataSource) {
            return;
        }

        const total = this.dataSource.totalNumberOfRows();
        const limit = (this.dataSource.lastRequest !== undefined) ? this.dataSource.lastRequest.limit : this.dataSource.limit;
        //const offset = (this.dataSource.lastRequest !== undefined) ? this.dataSource.lastRequest.offset : this.dataSource.offset;
        // what is the current page
        const currentPageIndex = (this.dataSource.lastRequest !== undefined) ? this.dataSource.lastRequest.page : 1;
        let numberOfPages = Math.ceil(total / limit);

        if (isNaN(numberOfPages)) {
            numberOfPages = 1;
        }


        let startX = 0;
        this.backPage = new Btn();
        this.backPage.styles = this.getStylesForSubViewId("leftButton", true);
        this.backPage.keyValues["xPos"] = startX;
        this.backPage.boundsForView = function (parentBounds) {
            return boundsWithPixels({
                x: this.keyValues["xPos"],
                y: 0,
                width: 30,
                height: 30,
                unit: "px",
                position: "absolute"
            });
        };
        this.backPage.text = "&#xf0d9;";
        if (currentPageIndex === 1) {
            this.backPage.setEnabled(false);
        }
        this.backPage.initView(this.id + ".backPage");
        this.attach(this.backPage);
        this.backPage.keyValues["ds"] = this.dataSource;
        this.backPage.keyValues["movePage"] = (sender) => {
            this.backPage.setEnabled(false);
            this.nextPage.setEnabled(false);
            if (this.dataSource !== undefined) {
                this.dataSource.previousPage();
                this.backPage.setEnabled( this.dataSource.currentPage > 1);
                this.nextPage.setEnabled(this.dataSource.currentPage < this.dataSource.numberOfPages());
            }

        };
        if (this.dataSource.currentPage === 1) {
            this.backPage.setEnabled(false);
        } else {
            this.backPage.setActionDelegate(this.backPage.keyValues, "movePage");
        }
        startX += 45;

        this.page = new Label();
        this.page.styles = this.getStylesForSubViewId("label", true);
        this.page.keyValues["xPos"] = startX;
        this.page.boundsForView = function (parentBounds) {
            return boundsWithPixels({
                x: this.keyValues["xPos"],
                y: 0,
                width: 30,
                height: 30,
                unit: "px",
                position: "absolute"
            });
        };
        this.page.text = "Page";
        this.page.initView(this.id + ".page");
        this.attach(this.page);
        startX += 35;


        this.txt = new TextField();
        this.txt.keyValues["xPos"] = startX;
        this.txt.styles = this.getStylesForSubViewId("textField", true);
        this.txt.boundsForView = function (parentBounds) {
            return boundsWithPixels({
                x: this.keyValues["xPos"],
                y: 0,
                width: 30,
                height: 30,
                unit: "px",
                position: "absolute"
            });
        };
        this.txt.initView(this.id + ".txt");
        this.attach(this.txt);
        this.txt.setText(this.dataSource.currentPage.toString());
        this.txt!.textContainer!.keyValues["textbox"].style.textAlign = "center";
        if ((currentPageIndex === 1) && (numberOfPages === 1)) {
            this.txt.setEnabled(false);
        } else {
            this.txt.keyValues["ds"] = this.dataSource;
            this.txt.keyValues["numberOfPages"] = numberOfPages;
            this.txt.keyValues["onPageJump"] = (sender: TextField) => {
                this.backPage.setEnabled(true);
                this.nextPage.setEnabled(true);
                if (sender.value === "") {
                    sender.setText("1");
                }
                let newPage = parseInt(sender.value as string);
                if (newPage <= 0) {
                    newPage = 1;
                }
                if (newPage > numberOfPages) {
                    newPage = numberOfPages;
                }
                this.txt.setText(newPage.toString());
                if (this.dataSource !== undefined) {
                    this.dataSource.jumpTo(newPage);
                    this.backPage.setEnabled( this.dataSource.currentPage > 1);
                    this.nextPage.setEnabled(this.dataSource.currentPage < this.dataSource.numberOfPages());
                }
            };
            this.txt.setActionDelegate(this.txt.keyValues, "onPageJump");
        }
        startX += 40;

        this.ofTotal = new Label();
        this.ofTotal.styles = this.getStylesForSubViewId("label", true);
        this.ofTotal.keyValues["xPos"] = startX;
        this.ofTotal.boundsForView = function (parentBounds) {
            return boundsWithPixels({
                x: this.keyValues["xPos"],
                y: 0,
                width: 50,
                height: 30,
                unit: "px",
                position: "absolute"
            });
        };
        this.ofTotal.text = "of " + numberOfPages;
        this.ofTotal.initView(this.id + ".ofTotal");
        this.attach(this.ofTotal);
        startX += 50;


        this.nextPage = new Btn();
        this.nextPage.styles = this.getStylesForSubViewId("rightButton", true);
        this.nextPage.keyValues["xPos"] = startX;
        this.nextPage.boundsForView = function (parentBounds) {
            return boundsWithPixels({
                x: this.keyValues["xPos"],
                y: 0,
                width: 30,
                height: 30,
                unit: "px",
                position: "absolute"
            });
        };

        if (currentPageIndex === numberOfPages) {
            this.nextPage.setEnabled(false);
        }
        this.nextPage.text = "&#xf0da;";
        this.nextPage.initView(this.id + ".nextPage");
        this.attach(this.nextPage);
        this.nextPage.keyValues["ds"] = this.dataSource;
        this.nextPage.keyValues["movePage"] = () => {
            if (this.dataSource !== undefined) {
                this.dataSource.nextPage();
                this.backPage.setEnabled(this.dataSource.currentPage > 1);
                this.nextPage.setEnabled(this.dataSource.currentPage < this.dataSource.numberOfPages());
            }
        };
        if (currentPageIndex === numberOfPages) {
            this.nextPage.setEnabled(false);
        } else {
            this.nextPage.setActionDelegate(this.nextPage.keyValues, "movePage");
        }
        startX += 35;


        this.total = new Label();
        this.total.styles = this.getStylesForSubViewId("label", true);
        this.total.boundsForView = function (parentBounds) {
            return boundsWithPixels({
                x: parentBounds.width.amount / 2 - 50,
                y: 0,
                width: 100,
                height: 30,
                unit: "px",
                position: "absolute"
            });
        };
        this.total.text = total + " total";
        this.total.initView(this.id + ".total");
        this.attach(this.total);

        this.drp = new Drp();
        this.drp.styles = this.getStylesForSubViewId("dropDown", true);
        this.drp.boundsForView = function (parentBounds) {
            return boundsWithPixels({
                x: parentBounds.width.amount - 55,
                y: 0,
                width: 50,
                height: 30,
                unit: "px",
                position: "absolute"
            });
        };
        this.drp.dataSource = [
                { id : '10', text: "10"},
                { id: '20', text: "20"},
                { id: '50', text: "50"},
                { id: '100', text: "100"},
                { id: '250', text: "250"},
                { id: '500', text: "500"},
                { id: '1000', text: "1000"}
            ];
        this.drp.initView(this.id + ".drp");
        this.attach(this.drp);
        this.drp.setSelectedItem(this.dataSource.limit.toString());

        this.drp.keyValues["ds"] = this.dataSource;
        this.drp.keyValues["onLimitChanged"] = (sender: Drp) => {
            const selected = sender.selectedID;
            this.dataSource.limit = parseInt(selected);
            this.dataSource.firstPage();
        };
        this.drp.setActionDelegate(this.drp.keyValues, "onLimitChanged");

        this.showResults = new Label();
        this.showResults.styles = this.getStylesForSubViewId("label", true);
        this.showResults.boundsForView = function (parentBounds) {
            return boundsWithPixels({
                x: parentBounds.width.amount - 55 - 150,
                y: 0,
                width: 150,
                height: 30,
                unit: "px",
                position: "absolute"
            });
        };
        this.showResults.textAlignment = "right";
        this.showResults.text = "Results per page:&nbsp;";
        this.showResults.initView(this.id + ".showResults");
        this.attach(this.showResults);


        if (this.getBounds("").width.amount < 550) {
            this.total.setVisible(false);
            this.showResults.setText("Show:&nbsp;");
        }



    }

}