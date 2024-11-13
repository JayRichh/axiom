import { Color } from 'three';
import { Value } from './types';

export class ConstantValue implements Value {
    private value: number;

    constructor(value: number) {
        this.value = value;
    }

    getValue(): number {
        return this.value;
    }
}

export class IntervalValue implements Value {
    private min: number;
    private max: number;

    constructor(min: number, max: number) {
        this.min = min;
        this.max = max;
    }

    getValue(): number {
        return this.min + Math.random() * (this.max - this.min);
    }
}

export class Bezier implements Value {
    private points: number[];

    constructor(points: number[]) {
        this.points = points;
    }

    getValue(): number {
        const t = Math.random();
        return this.evaluate(t);
    }

    private evaluate(t: number): number {
        const n = this.points.length - 1;
        let value = 0;
        
        for (let i = 0; i <= n; i++) {
            value += this.points[i] * this.bernstein(n, i, t);
        }
        
        return value;
    }

    private bernstein(n: number, i: number, t: number): number {
        return this.binomial(n, i) * Math.pow(t, i) * Math.pow(1 - t, n - i);
    }

    private binomial(n: number, k: number): number {
        let coeff = 1;
        for (let i = n - k + 1; i <= n; i++) coeff *= i;
        for (let i = 1; i <= k; i++) coeff /= i;
        return coeff;
    }
}

export class PiecewiseBezier implements Value {
    private curves: Bezier[];
    private times: number[];

    constructor(curves: Bezier[], times: number[]) {
        this.curves = curves;
        this.times = times;
    }

    getValue(): number {
        const t = Math.random();
        for (let i = 0; i < this.times.length - 1; i++) {
            if (t >= this.times[i] && t <= this.times[i + 1]) {
                const localT = (t - this.times[i]) / (this.times[i + 1] - this.times[i]);
                return this.curves[i].getValue();
            }
        }
        return this.curves[this.curves.length - 1].getValue();
    }
}

export class Gradient {
    private colors: Color[];
    private times: number[];

    constructor(colors: Color[], times: number[]) {
        this.colors = colors;
        this.times = times;
    }

    evaluate(t: number): Color {
        for (let i = 0; i < this.times.length - 1; i++) {
            if (t >= this.times[i] && t <= this.times[i + 1]) {
                const localT = (t - this.times[i]) / (this.times[i + 1] - this.times[i]);
                const color = new Color();
                color.lerpColors(this.colors[i], this.colors[i + 1], localT);
                return color;
            }
        }
        return this.colors[this.colors.length - 1].clone();
    }
}

export class RandomColorBetweenGradient {
    private gradient1: Gradient;
    private gradient2: Gradient;

    constructor(gradient1: Gradient, gradient2: Gradient) {
        this.gradient1 = gradient1;
        this.gradient2 = gradient2;
    }

    evaluate(t: number): Color {
        const color1 = this.gradient1.evaluate(t);
        const color2 = this.gradient2.evaluate(t);
        const color = new Color();
        const r = Math.random();
        color.lerpColors(color1, color2, r);
        return color;
    }
}
