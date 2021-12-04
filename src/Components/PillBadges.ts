import {View} from "../View/View";


export class PillBadges extends View {

    pillBadges: any[];

    constructor() {
        super();
        this.pillBadges = [];
    }



    addPillBadge(id: string,title: string, options: any) {
        const pill_colors = {
            border: "1px solid rgb(99,108,114)",
            borderRadius: '6px',
            backgroundColor: 'rgb(99,108,114)',
            color: 'white'
        };
        if (options !== undefined) {
            if (options.border !== undefined) {
                pill_colors.border = options.border;
            }
            if (options.borderRadius !== undefined) {
                pill_colors.borderRadius = options.borderRadius;
            }
            if (options.backgroundColor !== undefined) {
                pill_colors.backgroundColor = options.backgroundColor;
            }
            if (options.color !== undefined) {
                pill_colors.color = options.color;
            }
        }


        const pillBadge = document.createElement("span");
        pillBadge.id = id;
        pillBadge.style.wordBreak = "keep-all";
        pillBadge.innerHTML = "&nbsp;&nbsp;<nobr>" + title + "</nobr>&nbsp;&nbsp;";
        pillBadge.style.backgroundColor = pill_colors.backgroundColor;
        pillBadge.style.color = pill_colors.color;
        pillBadge.style.border = pill_colors.border;
        pillBadge.style.borderRadius = pill_colors.borderRadius;
        pillBadge.style.textAlign = "center";
        pillBadge.style.whiteSpace = "nowrap";
        pillBadge.style.display = "inline-block";
        pillBadge.style.verticalAlign = "middle";
        pillBadge.style.marginRight = "5px";


        this.pillBadges.push(pillBadge);
        this.getDiv().append(pillBadge);
        this.doResize();

        pillBadge.style.marginTop = (this.getBounds("").height.amount / 2 - pillBadge.getBoundingClientRect().height / 2) + "px";

    }

    removeAllPillBadges() {
        while (this.pillBadges.length > 0) {
            this.removePillBadge(this.pillBadges[this.pillBadges.length-1].id);
        }
    }

    removePillBadge(id: string) {
        let idx = -1;
        for (let i = 0; i < this.pillBadges.length; i++) {
            if (this.pillBadges[i].id === id) {
                idx = i;
            }
        }
        if (idx>-1) {
            this.getDiv().removeChild(this.pillBadges[idx]);
        }
        this.pillBadges[idx] = undefined;
        this.pillBadges.splice(idx,1);
        this.doResize();

    }





}