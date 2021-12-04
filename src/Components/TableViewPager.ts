import {View} from "../View/View";
import {DataSource} from "../Datasource/DataSource";
import {Label} from "./Label";
import {TextField} from "./TextField";
import {isDefined} from "../Utils/isDefined";
import {generateV4UUID} from "../Utils/generateV4UUID";
import {Bounds} from "../Bounds/Bounds";
import {ViewStyle} from "../View/ViewStyle";
import {boundsWithPixels} from "../Bounds/boundsWithPixels";
import {Btn} from "./Btn";
import {Drp} from "./Drp";


export class TableViewPager extends View {

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
    }


    bindDataSource(ds: DataSource) {
        "use strict";
        this.dataSource = ds;
        //if (this.isLayoutEditor === true) {
            if (!isDefined(ds)) {
                let ds = new DataSource();
                //ds.isLayoutEditor = true;
                ds.initWithData({ valid: true, rows: [{ id: generateV4UUID(), text: "1"}], total_count: 1});
                this.dataSource = ds;
            }
        //}
        if (isDefined(ds)) {
            ds.bindViews.push(this);
        }
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

        const total = this.dataSource.totalNumberOfItems();
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

        this.backPage.fontFamily = 'FontAwesomeProSolid,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif';
        this.backPage.text = "&#xf0d9;";
        this.backPage.fontWeight = '300';
        if (currentPageIndex === 1) {
            this.backPage.setEnabled(false);
        }
        this.backPage.initView(this.id + ".backPage");
        this.attach(this.backPage);
        this.backPage.keyValues["ds"] = this.dataSource;
        this.backPage.keyValues["movePage"] = function () {
            this.keyValues["ds"].previousPage();
        };
        if (currentPageIndex === 1) {
            this.backPage.setEnabled(false);
        } else {
            this.backPage.setActionDelegate(this.backPage, "movePage");
        }
        startX += 45;

        this.page = new Label();
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
        this.page.fontFamily = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif';
        this.page.fontWeight = '300';
        this.page.fillLineHeight = true;
        this.page.initView(this.id + ".page");
        this.attach(this.page);
        startX += 35;


        this.txt = new TextField();
        this.txt.keyValues["xPos"] = startX;
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
        this.txt.setText(currentPageIndex);
        this.txt!.textContainer!.keyValues["textbox"].style.textAlign = "center";
        if ((currentPageIndex === 1) && (numberOfPages === 1)) {
            this.txt.setEnabled(false);
        } else {
            this.txt.keyValues["ds"] = this.dataSource;
            this.txt.keyValues["numberOfPages"] = numberOfPages;
            this.txt.keyValues["onPageJump"] = function (sender: TextField) {
                let newPage = parseInt(sender.value as string);
                if (newPage <= 0) {
                    newPage = 1;
                }
                if (newPage > numberOfPages) {
                    newPage = numberOfPages;
                }
                this.setText(newPage);
                this.keyValues["ds"].jumpTo(newPage);
            };
            this.txt.setActionDelegate(this.txt, "onPageJump");
        }
        startX += 40;

        this.ofTotal = new Label();
        this.ofTotal.keyValues["xPos"] = startX;
        this.ofTotal.boundsForView = function (parentBounds) {
            return boundsWithPixels({
                x: this.keyValues["xPos"],
                y: 0,
                width: 35,
                height: 30,
                unit: "px",
                position: "absolute"
            });
        };
        this.ofTotal.text = "of " + numberOfPages;
        this.ofTotal.fontFamily = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif';
        this.ofTotal.fontWeight = '300';
        this.ofTotal.fillLineHeight = true;
        this.ofTotal.initView(this.id + ".ofTotal");
        this.attach(this.ofTotal);
        startX += 40;


        this.nextPage = new Btn();
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
        this.nextPage.fontFamily = 'FontAwesomeProSolid,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif';
        this.nextPage.text = "&#xf0da;";
        this.nextPage.fontWeight = '300';
        this.nextPage.initView(this.id + ".nextPage");
        this.attach(this.nextPage);
        this.nextPage.keyValues["ds"] = this.dataSource;
        this.nextPage.keyValues["movePage"] = function () {
            this.keyValues["ds"].nextPage();
        };
        if (currentPageIndex === numberOfPages) {
            this.nextPage.setEnabled(false);
        } else {
            this.nextPage.setActionDelegate(this.nextPage, "movePage");
        }
        startX += 35;


        this.total = new Label();
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
        this.total.fontFamily = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif';
        this.total.fillLineHeight = true;
        this.total.fontWeight = '300';
        this.total.initView(this.id + ".total");
        this.attach(this.total);

        this.drp = new Drp();
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
        this.drp.keyValues["onLimitChanged"] = function (sender: Drp) {
            const selected = this.selectedItem;
            this.ds.limit = selected.id;
            this.ds.firstPage();
        };
        this.drp.setActionDelegate(this.drp, "onLimitChanged");

        this.showResults = new Label();
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
        this.showResults.fontFamily = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif';
        this.showResults.fillLineHeight = true;
        this.showResults.fontWeight = '300';
        this.showResults.initView(this.id + ".showResults");
        this.attach(this.showResults);


        if (this.getBounds("").width.amount < 550) {
            this.total.setVisible(false);
            this.showResults.setText("Show:&nbsp;");
        }



    }

}