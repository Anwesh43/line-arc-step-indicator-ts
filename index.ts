const w : number = window.innerWidth
const h : number = window.innerHeight
const scGap : number = 0.02 / 6
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
        context.rotate(start * Math.PI / 180)
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
        if (sc == 0) {
            return
        }
        const x : number = size - i * gap
        const deg : number = 360 / arcs
        DrawingUtil.drawLine(context, x, 0, x - gap * sc, 0)
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

class Stage {

    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D
    renderer : Renderer = new Renderer()

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor
        this.context.fillRect(0, 0, w, h)
        this.renderer.render(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.renderer.handleTap(() => {
                this.render()
            })
        }
    }

    static init() {
        const stage : Stage = new Stage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

class State {

    scale : number = 0
    dir : number = 0
    prevScale : number = 0

    update(cb : Function) {
        this.scale += scGap * this.dir
        if (Math.abs(this.scale - this.prevScale) > 1)  {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}

class Animator {

    animated : boolean = false
    interval : number

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(cb, delay)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class LAINode {

    prev : LAINode
    next : LAINode
    state : State = new State()

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new LAINode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        DrawingUtil.drawLAINode(context, this.i, this.state.scale)
        if (this.prev) {
            this.prev.draw(context)
        }
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : LAINode {
        var curr : LAINode = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}

class LineArcStepIndicator {

    curr : LAINode = new LAINode(0)
    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    update(cb : Function)  {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}

class Renderer {

    lasi : LineArcStepIndicator = new LineArcStepIndicator()
    animator : Animator = new Animator()

    render(context : CanvasRenderingContext2D) {
        this.lasi.draw(context)
    }

    handleTap(cb : Function) {
        this.lasi.startUpdating(() => {
            this.animator.start(() => {
                cb()
                this.lasi.update(() => {
                    this.animator.stop()
                    cb()
                })
            })
        })
    }
}
