import {GradientStep} from "./GradientStep";


export interface GradientData {
    type: 'linear' | 'radial';
    shape: 'circle' | 'ellipse' | 'closest-side' | 'farthest-side' | 'closest-corner' | 'farthest-corner';
    originX: number;
    originY: number;
    directionAngle: number;
    steps: GradientStep[];
}
