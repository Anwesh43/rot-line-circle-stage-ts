const w : number = window.innerWidth, h : number = window.innerHeight
const nodes : number = 5
const color : string = '#E65100'
class RotLineCircStage {
    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D
    lrlc : LinkedRotLineCircle = new LinkedRotLineCircle()
    animator : Animator = new Animator()
    constructor() {
        this.initCanvas()
        this.render()
        this.handleTap()
    }

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = '#212121'
        this.context.fillRect(0, 0, w, h)
        this.lrlc.draw(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.lrlc.startUpdating(() => {
                this.animator.start(() => {
                    this.render()
                    this.lrlc.update(() => {
                        this.animator.stop()
                        this.render()
                    })
                })
            })
        }
    }

    static init() {
        const stage : RotLineCircStage = new RotLineCircStage()
    }
}

class State {
    scale : number = 0
    prevScale : number = 0
    dir : number = 0

    update(cb : Function) {
        this.scale += 0.05 * this.dir
        if (Math.abs(this.scale - this.prevScale) > 1) {
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
            this.interval = setInterval(cb, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class RLCNode {
    state : State = new State()
    prev : RLCNode
    next : RLCNode
    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new RLCNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        const gap : number = w / (nodes + 1)
        const factor : number = 1 - 2 * (this.i % 2)
        const sc1 = Math.min(0.5, this.state.scale) * 2
        const sc2 = Math.min(0.5, Math.max(this.state.scale - 0.5 , 0)) * 2
        context.fillStyle = color
        context.strokeStyle = color
        context.lineWidth = Math.min(w, h) / 60
        context.lineCap = 'round'
        context.save()
        context.translate(this.i * gap + gap / 2, h/2)
        context.rotate(Math.PI/2 * sc1 * factor)
        context.beginPath()
        context.arc(0, -gap * factor * sc2, gap/5, 0, 2 * Math.PI)
        context.fill()
        context.beginPath()
        context.moveTo(0, -gap * factor * sc2)
        context.lineTo(0, -gap * factor)
        context.stroke()
        context.restore()
        if (this.next) {
            this.next.draw(context)
        }
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : RLCNode {
        var curr : RLCNode = this.prev
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

class LinkedRotLineCircle {
    curr : RLCNode = new RLCNode(0)
    dir : number = 1

    update(cb : Function) {
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

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }
}
