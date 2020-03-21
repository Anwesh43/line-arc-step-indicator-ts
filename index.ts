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

class DrawingUtil {

    static drawLine(context : CanvasRenderingContext2D, x1 : number, y1  : number, x2 : number, y2 : number)  {
        context.beginPath()
        context.moveTo(x1, y1)
        context.lineTo(x2, y2)
        context.stroke()
    }

    static drawArc(context : CanvasRenderingContext2D, r : number, start : number, deg : number) {
        context.save()
        context.rotate(deg * Math.PI / 180)
        context.beginPath()
        for (var i = 0; i < deg; i++) {
            const x : number = r * Math.cos(i * Math.PI / 180)
            const y : number = r * Math.sin(i * Math.PI / 180)
            if (i == 0) {
                context.moveTo(x, y)
            } else {
                context.lineTo(x, y)
            }
        }
        context.stroke()
        context.restore()
    }

    static drawLineArcIndicator(context : CanvasRenderingContext2D, i : number, scale : number, size : number) {
        const gap : number = 2 * size / arcs
        const sc : number = ScaleUtil.divideScale(scale, i, arcs)
        const sf : number = ScaleUtil.sinify(sc)
        const x : number = size - i * gap
        const deg : number = 360 / arcs
        DrawingUtil.drawLine(context, x, 0, x - size * sc, 0)
        DrawingUtil.drawArc(context, size, i * deg, deg * sf)
    }

    static drawLineArcIndicators(context : CanvasRenderingContext2D, scale : number, size : number) {
        for (var i = 0; i < arcs; i++) {
            DrawingUtil.drawLineArcIndicator(context, i, scale, size)
        }
    }

    static drawLAINode(context : CanvasRenderingContext2D, i : number, scale : number) {
        const gap : number = h / (nodes + 1)
        const size : number = gap / sizeFactor
        context.lineCap = 'round'
        context.lineWidth = Math.min(w, h) / strokeFactor
        context.strokeStyle = foreColor
        context.save()
        context.translate(w / 2, gap * (i + 1))
        DrawingUtil.drawLineArcIndicators(context, scale, size)
        context.restore()
    }
}
