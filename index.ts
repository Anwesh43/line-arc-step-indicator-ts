const w : number = window.innerWidth
const h : number = window.innerWidth
const scGap : number = 0.02
const strokeFactor : number = 90
const sizeFactor : number = 2.9
const foreColor : string = "#4a148c"
const backColor : string = "#bdbdbd"
const nodes : number = 5
const arcs : number = 6
const delay : number = 20

class ScaleUtil {

    static maxScale(scale : number, i : number, n : number) : number {
        return Math.max(0, scale  - i / n)
    }

    static divideScale(scale : number, i : number, n : number) : number {
        return Math.min(1 / n, ScaleUtil.maxScale(scale, i, n)) * n
    }

    static sinify(scale : number) : number {
        return Math.sin(Math.PI * scale)
    }
}
