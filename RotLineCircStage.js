var w = window.innerWidth, h = window.innerHeight;
var nodes = 5;
var color = '#E65100';
var RotLineCircStage = (function () {
    function RotLineCircStage() {
        this.canvas = document.createElement('canvas');
        this.lrlc = new LinkedRotLineCircle();
        this.animator = new Animator();
        this.initCanvas();
        this.render();
        this.handleTap();
    }
    RotLineCircStage.prototype.initCanvas = function () {
        this.canvas.width = w;
        this.canvas.height = h;
        this.context = this.canvas.getContext('2d');
        document.body.appendChild(this.canvas);
    };
    RotLineCircStage.prototype.render = function () {
        this.context.fillStyle = '#212121';
        this.context.fillRect(0, 0, w, h);
        this.lrlc.draw(this.context);
    };
    RotLineCircStage.prototype.handleTap = function () {
        var _this = this;
        this.canvas.onmousedown = function () {
            _this.lrlc.startUpdating(function () {
                _this.animator.start(function () {
                    _this.render();
                    _this.lrlc.update(function () {
                        _this.animator.stop();
                        _this.render();
                    });
                });
            });
        };
    };
    RotLineCircStage.init = function () {
        var stage = new RotLineCircStage();
    };
    return RotLineCircStage;
})();
var State = (function () {
    function State() {
        this.scale = 0;
        this.prevScale = 0;
        this.dir = 0;
    }
    State.prototype.update = function (cb) {
        this.scale += 0.05 * this.dir;
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir;
            this.dir = 0;
            this.prevScale = this.scale;
            cb();
        }
    };
    State.prototype.startUpdating = function (cb) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale;
            cb();
        }
    };
    return State;
})();
var Animator = (function () {
    function Animator() {
        this.animated = false;
    }
    Animator.prototype.start = function (cb) {
        if (!this.animated) {
            this.animated = true;
            this.interval = setInterval(cb, 50);
        }
    };
    Animator.prototype.stop = function () {
        if (this.animated) {
            this.animated = false;
            clearInterval(this.interval);
        }
    };
    return Animator;
})();
var RLCNode = (function () {
    function RLCNode(i) {
        this.i = i;
        this.state = new State();
        this.addNeighbor();
    }
    RLCNode.prototype.addNeighbor = function () {
        if (this.i < nodes - 1) {
            this.next = new RLCNode(this.i + 1);
            this.next.prev = this;
        }
    };
    RLCNode.prototype.draw = function (context) {
        var gap = w / (nodes + 1);
        var factor = 1 - 2 * (this.i % 2);
        var sc1 = Math.min(0.5, this.state.scale) * 2;
        var sc2 = Math.min(0.5, Math.max(this.state.scale - 0.5, 0)) * 2;
        context.fillStyle = color;
        context.strokeStyle = color;
        context.lineWidth = Math.min(w, h) / 60;
        context.lineCap = 'round';
        context.save();
        context.translate(this.i * gap + gap / 2, h / 2);
        context.rotate(Math.PI / 2 * sc1 * factor);
        context.beginPath();
        context.arc(0, -gap * factor * sc2, gap / 5, 0, 2 * Math.PI);
        context.fill();
        context.beginPath();
        context.moveTo(0, -gap * factor * sc2);
        context.lineTo(0, -gap * factor);
        context.stroke();
        context.restore();
        if (this.next) {
            this.next.draw(context);
        }
    };
    RLCNode.prototype.update = function (cb) {
        this.state.update(cb);
    };
    RLCNode.prototype.startUpdating = function (cb) {
        this.state.startUpdating(cb);
    };
    RLCNode.prototype.getNext = function (dir, cb) {
        var curr = this.prev;
        if (dir == 1) {
            curr = this.next;
        }
        if (curr) {
            return curr;
        }
        cb();
        return this;
    };
    return RLCNode;
})();
var LinkedRotLineCircle = (function () {
    function LinkedRotLineCircle() {
        this.curr = new RLCNode(0);
        this.dir = 1;
    }
    LinkedRotLineCircle.prototype.update = function (cb) {
        var _this = this;
        this.curr.update(function () {
            _this.curr = _this.curr.getNext(_this.dir, function () {
                _this.dir *= -1;
            });
            cb();
        });
    };
    LinkedRotLineCircle.prototype.startUpdating = function (cb) {
        this.curr.startUpdating(cb);
    };
    LinkedRotLineCircle.prototype.draw = function (context) {
        this.curr.draw(context);
    };
    return LinkedRotLineCircle;
})();
