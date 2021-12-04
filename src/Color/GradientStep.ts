import {Color} from "./Color";


export interface GradientStep {
    id: string;
    color: Color;
    percentage: number;
}
