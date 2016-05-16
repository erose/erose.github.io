var zeroColor = 'CornflowerBlue',
    oneColor  = 'Crimson';
var activeMachine = null;

// Animations.
flash = function(item, duration){
    return new Promise(function(resolve, reject){
        item.animate([
            {
                properties: {
                    // fillColor: {brightness: 0},
                    scale: 3
                },
                settings: {duration: duration}
            },
            {
                properties: {
                    // fillColor: {brightness: 1},
                    scale: 1
                },
                settings: {
                    duration: duration,
                    complete: resolve,
                },
            },
        ]);
    });
}
jumpOut = function(item, duration){
    return new Promise(function(resolve, reject){
        var originalOpacity = item.opacity;
        item.animate([
            {
                properties: {
                    opacity: 1,
                },
                settings: {duration: duration}
            },
            {
                properties: {
                    opacity: originalOpacity,
                },
                settings: {
                    duration: duration,
                    complete: resolve
                }
            }
        ])
    });
}
flyTo = function(item, new_location, duration){
    return new Promise(function(resolve, reject){
        item.animate({
            properties: {
                position: {
                    x: '+' + new_location.x,
                    y: '+' + new_location.y
                }
            },
            settings: {
                duration: duration,
                complete: function(){
                    item.remove();
                    resolve();
                }
            }
        })
    });
}
// End animations.

var Cell = Group.extend({
    initialize: function(position, side){
        var rect = new Rectangle({
            point: position - [side/2, side/2],
            size: [side, side]
        });
        this.path = new Path.Rectangle({
            rectangle: rect,
            radius: 3,
            strokeColor: 'black',
        });
        var defaultSymbol = '0';
        this.text = new PointText({
            position: rect.center + [0, side/4],
            content: defaultSymbol,
            font: 'serif',
            justification: 'center',
            fillColor: (defaultSymbol == '0') ? zeroColor : oneColor,
            fontSize: 24
        });

        Cell.base.call(this, [this.path, this.text]);
    },
    write: function(text){
        var self = this;
        return new Promise(function(resolve, reject){
            self.text.animate([
                {
                    properties: {
                        opacity: 0
                    },
                    settings: {
                        duration: 150,
                        complete: function(){
                            self.text.content = text;
                            self.text.fillColor =
                                (text == '0') ? zeroColor : oneColor;
                        }
                    }
                },
                {
                    properties: {
                        opacity: 1
                    },
                    settings: {
                        duration: 150,
                        complete: resolve
                    }
                }
            ]);
        });
    },
    read: function(){
        return this.text.content;
    }
});
var Tape = Group.extend({
    initialize: function(position, cell_size, n, spacing){
        var n = (typeof n !== 'undefined') ? n : 5;
        this.spacing = (typeof spacing !== 'undefined') ? spacing : 5;
        this.cell_size = (typeof cell_size !== 'undefined') ? cell_size : 40;
        this.cell_offset = this.cell_size + this.spacing;

        this.middle = new Cell(new Point(0, 0), this.cell_size);
        this.first = this.middle;
        this.last = this.middle;

        var cells = [this.middle];
        for (var i = 0; i < n; i++){
            cells.unshift(this.growLeft());
            cells.push(this.growRight());
        }

        Cell.base.call(this, cells);
    },
    growLeft: function(){
        var baby = new Cell(
            this.first.position - [this.cell_offset, 0], this.cell_size
        );

        this.first.prev = baby;
        baby.next = this.first;
        this.first = baby;
        return baby;
    },
    growRight: function(){
        var baby = new Cell(
            this.last.position + [this.cell_offset, 0], this.cell_size
        );

        this.last.next = baby;
        baby.prev = this.last;
        this.last = baby;
        return baby;
    },
});
var Head = Group.extend({
    initialize: function(tape, size, v_offset){
        var size = (typeof size !== 'undefined') ? size : 30;
        this.v_offset = (typeof v_offset !== 'undefined') ? v_offset : 15;

        this.tape = tape;
        this.current_cell = tape.middle;

        this.path = new Path.RegularPolygon({
            center: this.current_cell.bounds.bottomCenter
                    + new Point(0, this.v_offset + size),
            sides: 3,
            radius: size,
            fillColor: 'LightGrey',
            strokeWidth: 2,
            strokeColor: 'black',
            strokeCap: 'square'
        });
        this.lowerText = new PointText({
            position: this.path.position + [0, 3*size/5],
            font: 'serif',
            content: '',
            justification: 'center',
            fontSize: 8
        });
        this.mainText = new PointText({
            position: this.path.position + [0, size/4],
            font: 'serif',
            content: '',
            justification: 'center',
            fontSize: 20
        })

        Head.base.call(this, [this.path, this.lowerText, this.mainText]);
    },
    read: function(){
        var self = this;
        return new Promise(function(resolve, reject){
            self.animate({
                properties: {
                    position: { y: '-' + self.v_offset }
                },
                settings: {
                    duration: 150,
                    complete: function(){
                        resolve(self.current_cell.read());
                    }
                }
            })
        });
    },
    write: function(symbol){
        return this.current_cell.write(symbol);
    },
    setCurrentNode: function(node){
        var self = this;
        self.mainText.animate([
            {
                properties: {
                    opacity: 0
                },
                settings: {
                    duration: 150,
                    complete: function(){
                        self.mainText.content = node.label;
                    }
                }
            },
            {
                properties: {
                    opacity: 1
                },
                settings: {
                    duration: 150,
                }
            }
        ]);
    },
    move: function(direction){
        var self = this;
        if (direction == 'L'){
            sign = '-';
        }
        if (direction == 'R'){
            sign = '+';
        }

        return new Promise(function(resolve, reject){
            self.animate([
                {
                    properties: {
                        position: {y: '+' + self.v_offset}
                    },
                    settings: {
                        duration: 150,
                        complete: function(){
                            var cur = self.current_cell;
                            if (direction == 'L'){
                                self.current_cell = 
                                    (typeof cur.prev !== 'undefined')
                                    ? cur.prev : self.tape.growLeft();
                            }
                            if (direction == 'R'){
                                self.current_cell = 
                                    (typeof cur.next !== 'undefined')
                                    ? cur.next : self.tape.growRight();
                            }
                        }
                    }
                },
                {
                    properties: {
                        position: {x: sign + self.tape.cell_offset}
                    },
                    settings: {
                        duration: 1000,
                        complete: resolve,
                    }
                }
            ])
        })
    }
});
var Arrow = Group.extend({
    initialize: function(source, read, write, move, target, options){
        var options = options || {};
        var curveAngle = (typeof options.curveAngle !== 'undefined')
                          ? options.curveAngle : 20;

        if (source != target){
            // direction is a unit vector from here to there.
            var a = new Point(0, 0),
                b = target.path.position - source.path.position;
            var direction = b.normalize();

            // The unit vectors which give the angles of entry and exit.
            // Compute enter by shifting the system to b, rotating around b
            // then shifting back. Its angle should be negative so the
            // two angles will sum to 0 (a straight line).
            var exitDirection = direction.rotate(curveAngle);
            var enterDirection = (b + direction).rotate(-curveAngle, b) - b;

            // the origin & b are inside nodes, start & end are on the edge.
            // Scale the unit direction vectors up to land on the node's edge.
            var start = exitDirection * source.radius;
            var end = b - (enterDirection * target.radius);
            this.drawArrow(
                start, end, exitDirection, enterDirection, read, write, move
            );
        }
        else {
            var curveAngle = 30;
            var direction = new Point(0, 1);

            var exitDirection = direction.rotate(curveAngle);
            var enterDirection = direction.rotate(-curveAngle);

            var start = exitDirection * source.radius;
            var end = enterDirection * source.radius;
            this.drawSelfLoop(
                start, end, exitDirection, enterDirection, read, write, move
            );
        }

        Arrow.base.call(this,
            [this.path, this.readMarker, this.arrowhead,
            this.writeMarker, this.directionText]
        );
    },
    drawArrow: function(
        start, end, exitDirection, enterDirection, read, write, move
    ){
        // Curvature controls how much the arrow bulges out.
        var curvature = 8;
        this.path = new Path.Arc({
            from: start,
            through: (start + end)/2 + (exitDirection * curvature),
            to: end,
            strokeColor: 'black',
            strokeWidth: 1
        });

        // Large circular port for the symbol to trigger this transition.
        this.readMarker = new Path.Circle({
            center: start + exitDirection,
            radius: 5,
            fillColor: (read == '0') ? zeroColor : oneColor,
            strokeColor: 'black'
        });
        // Smaller colored circle that indicates symbol to print on the tape.
        this.writeMarker = new Path.Circle({
            center: (start + end)/2 + (exitDirection * curvature),
            radius: 3,
            fillColor: (write == '0') ? zeroColor : oneColor,
            strokeColor: 'black'
        });

        // The pointy thing at the end of the arrow body.
        var size = 5;
        this.arrowhead = new Path({
            segments: [end, end + [-size, size], end + [size, size]],
            fillColor: 'white',
            strokeWidth: 1,
            strokeColor: 'black',
            closed: true
        });
        this.arrowhead.rotate(90 + enterDirection.angle, end);

        // Near-transparent 'L' or 'R' that indicates what direction
        // the head moves on the tape.
        // Offset controls how far into the target node to place this.
        var fontSize = 8;
        var offset = 6;
        this.directionText = new PointText({
            position: end + (enterDirection * offset) + [0, fontSize/4],
            content: move,
            opacity: 0.5,
            justification: 'center',
            font: 'serif',
            fontSize: fontSize,
        });
    },
    drawSelfLoop: function(
        start, end, exitDirection, enterDirection, read, write, move
    ){
        // Size controls how big the loop is.
        var size = 25;
        var out = (exitDirection + enterDirection)/2 * size;
        this.path = new Path.Arc({
            from: start,
            through: start + out,
            to: end,
            strokeColor: 'black',
            strokeWidth: 1
        });

        // Large circular port for the symbol to trigger this transition.
        this.readMarker = new Path.Circle({
            center: start + exitDirection,
            radius: 5,
            fillColor: (read == '0') ? zeroColor : oneColor,
            strokeColor: 'black'
        });
        // Smaller colored circle that indicates symbol to print on the tape.
        this.writeMarker = new Path.Circle({
            center: start + out,
            radius: 3,
            fillColor: (write == '0') ? zeroColor : oneColor,
            strokeColor: 'black'
        });

        // The pointy thing at the end of the arrow body.
        var size = 5;
        this.arrowhead = new Path({
            segments: [end, end + [-size, size], end + [size, size]],
            fillColor: 'white',
            strokeWidth: 1,
            strokeColor: 'black',
            closed: true
        });
        this.arrowhead.rotate(-90 + enterDirection.angle, end);

        // Near-transparent 'L' or 'R' that indicates what direction
        // the head moves on the tape.
        // Offset controls how far into the target node to place this.
        var fontSize = 8;
        var offset = 6;
        this.directionText = new PointText({
            position: end + (enterDirection * -offset) + [0, fontSize/4],
            content: move,
            opacity: 0.5,
            justification: 'center',
            font: 'serif',
            fontSize: fontSize,
        });
    }
});
var Node = Group.extend({
    initialize: function(position, label, options){
        var options = options || {};
        this.radius = (typeof options.radius !== 'undefined')
                       ? options.radius : 25;
        var fontSize = (typeof options.fontSize !== 'undefined')
                       ? options.fontSize : 24;
        var borderWidth = (typeof options.borderWidth !== 'undefined')
                           ? options.borderWidth : 2;
        var inactiveColor = (typeof options.inactiveColor !== 'undefined')
                     ? options.inactiveColor : new Color(0, 0, 0, 0);
        var activeColor = (typeof options.activeColor !== 'undefined')
                             ? options.activeColor : 'LightGrey'
        
        this.inactiveColor = inactiveColor;
        this.activeColor = activeColor;

        this.path = new Path.Circle({
            center: new Point(0, 0),
            radius: this.radius,
            strokeColor: 'black',
            strokeWidth: borderWidth,
            fillColor: this.inactiveColor
        });
        this.text = new PointText({
            position: new Point(0, fontSize/4),
            content: label,
            font: 'serif',
            justification: 'center',
            fontSize: fontSize
        });
        this.label = label;

        this.arrows = {};
        this.transitionRules = {};

        Node.base.call(this, [this.path, this.text]);
        this.position = position;
    }
});
var DFA = Group.extend({
    initialize: function(nodes, center){
        this.nodes = nodes;
        this.setCurrentNode(nodes[0]);

        DFA.base.call(this, this.nodes);
        this.position = center;
    },
    setCurrentNode: function(node){
        if (this.currentNode){
            this.currentNode.path.fillColor = this.currentNode.inactiveColor;
        }
        this.currentNode = node;
        node.path.fillColor = node.activeColor;
    },
    setRule: function(source, read, write, move, target, options){
        var arrow = new Arrow(source, read, write, move, target, options);

        // Move the arrow to the node.
        arrow.position += source.path.position;

        this.addChild(arrow);
        source.transitionRules[read] = {
            'writeSymbol': write, 'direction': move,
            'to': target, 'arrow': arrow
        };
    }
});
var TuringMachine = Group.extend({
    initialize: function(position, nodes, dfa_v_offset){
        var dfa_v_offset = (typeof dfa_v_offset !== 'undefined') ?
                           dfa_v_offset : 180;
        
        this.tape = new Tape();
        this.head = new Head(this.tape);
        this.dfa = new DFA(
            nodes, this.head.path.position + [0, dfa_v_offset]
        );

        TuringMachine.base.call(this, [this.tape, this.head, this.dfa]);
        this.position = position;
        this.head.bringToFront();
    },
    tick: function(){
        var self = this;
        return (
                this.head.read()
            .then(
                self.transition_dfa.bind(this)
            ).then(function(direction){
                var arrow_char = direction === "L" ? "←" : "→"; 
                self.head.lowerText.content = direction;
                self.head.mainText.content = arrow_char;
                return self.head.move(direction);
            }).then(function(){
                self.head.lowerText.content = '';
                self.head.mainText.content = '';
                return self.tick()
            })
        );
    },
    start: function(){
        setTimeout(this.tick.bind(this), 1000);
    },
    transition_dfa: function(symbolRead){
        var self = this;
        var rule = this.dfa.currentNode.transitionRules[symbolRead];

        return (
                flash(rule.arrow.readMarker, 300)
            .then(
                flash.bind(null, rule.arrow.writeMarker, 300)
            ).then(
                self.head.write.bind(self.head, rule.writeSymbol)
            ).then(
                flash.bind(null, rule.arrow.directionText, 300)
            // ).then(function(){
            //     var clone = rule.arrow.directionText.clone();
            //     clone.scaling = 3;
            //     clone.remove();
            //     paper.project.activeLayer.addChild(clone);
            //     var diff = self.head.lowerText.position - clone.position;
            //     return flyTo(clone, diff, 500);
            ).then(function(){
                self.dfa.setCurrentNode(rule.to);
                return rule.direction;
            })
        );
    },
});
window.switchTM = function(tm_name){
    project.clear(); // Wipe the canvas.

    if (tm_name == "charger"){
        activeMachine = create_charger(view.center);
    } else if (tm_name == "looper"){
        activeMachine = create_looper(view.center);
    } else if (tm_name == "6_state_busy_beaver"){
        activeMachine = create_busy_beaver_6(view.center);
    }

    $(".tm-description").hide();
    $("#" + tm_name + "-description").show()
    activeMachine.start();
}
function create_busy_beaver_6(position){
    pentagon = [
        new Point(100, 0), new Point(30, 95), new Point(-80, 58),
        new Point(-80, -58), new Point(30, -95),
    ];
    var A = new Node(pentagon[0], 'A');
    var B = new Node(pentagon[1], 'B');
    var C = new Node(pentagon[2], 'C');
    var D = new Node(pentagon[3], 'D');
    var E = new Node(pentagon[4], 'E');
    var F = new Node(new Point(0, 0), 'F');

    var M = new TuringMachine(position, [A, B, C, D, E, F]);

    M.dfa.setRule(A, '0', '1', 'R', B, { curveAngle: -5 });
    M.dfa.setRule(A, '1', '1', 'L', E);
    M.dfa.setRule(B, '0', '1', 'R', C);
    M.dfa.setRule(B, '1', '1', 'R', F);
    M.dfa.setRule(C, '0', '1', 'L', D);
    M.dfa.setRule(C, '1', '0', 'R', B);
    M.dfa.setRule(D, '0', '1', 'R', E);
    M.dfa.setRule(D, '1', '0', 'L', C);
    M.dfa.setRule(E, '0', '1', 'L', A);
    M.dfa.setRule(E, '1', '0', 'R', D);

    M.dfa.setRule(F, '1', '1', 'R', C, { curveAngle: -1 });

    return M;
}
function create_looper(position){
    var A = new Node(new Point(-50, 0), 'A');
    var B = new Node(new Point(50, 0), 'B');

    var M = new TuringMachine(position, [A, B]);

    M.dfa.setRule(A, '0', '0', 'R', B);
    M.dfa.setRule(B, '0', '0', 'L', A);

    return M;
}
function create_charger(position){
    var A = new Node(new Point(0, 0), 'A');

    var M = new TuringMachine(position, [A]);

    M.dfa.setRule(A, '0', '1', 'R', A, { curveAngle: -10 });

    return M;
}

function onFrame(){
    if (activeMachine != null){
        // View should remain centered on the tape head.
        view.center = new Point(
            activeMachine.head.path.position.x, view.center.y
        );
        activeMachine.dfa.position.x = activeMachine.head.path.position.x;
    }
}

// Default.
switchTM("6_state_busy_beaver");