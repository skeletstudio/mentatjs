
export type TextFieldFormatter = { masks: any[] }




export const time24 : TextFieldFormatter = {
        masks: [
        {
            mask: "^[0-2][0-9][:][0-5][0-9]$",
            steps: [
                {mask: "^[0-2]$"},
                {mask: "^[0-2][0-9]$", match: {append: ":"}},
                {mask: "^[0-2][0-9][:]$"},
                {mask: "^[0-2][0-9][:][0-5]$"},
                {mask: "^[0-2][0-9][:][0-5][0-9]$", match: {trigger: true}}
            ]
        }
        ]
};



export const timeAMPM: TextFieldFormatter = {
        masks: [
            {
                mask: "^[0-9]{1,2}[:][0-5][0-9]\\s[apAP][mM]$",
                steps: [
                    {mask: "^[0-9]$"},
                    {mask: "^[0-9][0-9]$", match: {append: " "}},
                    {mask: "^[0-9][0-9]\\s$"},
                    {mask: "^[0-9][0-9]\\s[apAP]", match: {append: "m", trigger: true}},
                    {mask: "^[0-9][0-9]\\s[apAP][mM]", match: {trigger: true}}
                ]
            }
        ]
    };

export const integer: TextFieldFormatter = {
        masks: [
            {
                mask: "^[0-9]+$",
                steps: [

                ]
            }
        ]
    };

export const signedInteger: TextFieldFormatter = {
        masks: [
            {
                mask: "^-?[0-9]+$",
                steps: [

                ]
            }
        ]
    };
export const floatDot: TextFieldFormatter = {
        masks: [
            {
                mask: "^[0-9]+([.][0-9]+)?",
                steps: [

                ]
            }
        ]
    };

export const duration: TextFieldFormatter = {
        masks: [
            {
                mask: "^(?!$)(?P<years>\\d+\\s?y(ear(s)?)?)?\\s?(?P<months>\\d+\\s?month(s)?)?\\s?(?P<weeks>\\d+\\s?w(eek(s)?)?)?\\s?(?P<days>\\d+\\s?d(ay(s)?)?)?\\s?(?P<hours>\\d+\\s?h(our(s)?)?)?\\s?(?P<minutes>\\d+\\s?m(inute(s)?)?)?\\s?(?P<seconds>\\d+\\s?s(econd(s)?)?)?$",
                steps: []
            }
        ]
    };


export const TextFieldFormatters: any = {
    "time24": time24,
    "timeAMPM": timeAMPM,
    "integer": integer,
    "signedInteger": signedInteger,
    "floatDot": floatDot,
    "duration": duration
};