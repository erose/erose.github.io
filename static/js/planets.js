var frame_gap = 20; // in ms, how far apart ticks are.
var dt = 1;
var G = 1; // gravitational constant.
var paused = false;
var current_scenario = 1;

window.onload = function(){
    const w = 640,
          h = 480;
    var canvas = Raphael("canvas", w, h);

    // Groups of objects.
    var planets = [];
    var arrows = [];

    class Planet {
        constructor({
            position=undefined,
            velocity=$V([0, 0]),
            radius=undefined,
            mass=undefined,
            color=undefined,
            fixed=false
        }) {
            this.mass = mass;
            this.position = position;
            this.velocity = velocity;
            this.radius = radius;
            this.svg = canvas
                .circle(position.e(1), position.e(2), this.radius)
                .attr({fill: color}
            );
            this.fixed = fixed;

            var self = this;
            var move = function(dx, dy){
                var ox = self.oposition.e(1),
                    oy = self.oposition.e(2);
                self.position = $V([dx + ox, dy + oy]);
            };
            var start = function(){
                self.oposition = self.position.dup();
                self.dragging = true;
            };
            var end = function(){ self.dragging = false; };
            this.svg.drag(move, start, end);

            if (!this.fixed){
                new Arrow(this, canvas.path("")
                    .attr(
                        {"arrow-end": "classic",
                        "stroke-width": 2,
                        "stroke": "white"}
                    )
                );
            }

            planets.push(this);
        }

        get_force_vector(){
            var force = $V([0, 0]);

            for (let other of planets){
                if (this !== other){
                    var delta = other.position.subtract(this.position);
                    var rsquared = delta.modulus() * delta.modulus();
                    var direction = delta.toUnitVector();

                    force = force.add(
                        direction
                        .multiply(G/rsquared)
                        .multiply(other.mass/this.mass)
                    );
                };
            };

            return force;
        }

        update(){
            this.position = this.position.add(this.velocity.multiply(dt));
            this.velocity = this.velocity.add(this.get_force_vector().multiply(dt));
        }

        draw(){
            this.svg.attr(
                {
                    cx: this.position.e(1),
                    cy: this.position.e(2),
                }
            );
        }
    }
    class Arrow {
        constructor(planet, svg) {
            this.planet = planet;
            this.svg = svg;

            var self = this;
            var move = function(dx, dy){
                var ox = self.planet.ovelocity.e(1),
                    oy = self.planet.ovelocity.e(2);
                self.planet.velocity = $V([ox + (0.1)*dx, oy + (0.1)*dy]);
            }
            var start = function(){
                self.planet.ovelocity = self.planet.velocity.dup();
                self.planet.fixed = true;
            };
            var end = function(){
                self.planet.fixed = false;
            };
            this.svg.drag(move, start, end);

            arrows.push(this);
        }

        draw(){
            var x = this.planet.position.e(1);
            var y = this.planet.position.e(2);
            var vx = this.planet.velocity.e(1);
            var vy = this.planet.velocity.e(2);

            this.svg.attr({
                path: Raphael.format("M{0},{1} l{2},{3}", x, y, 10*vx, 10*vy)
            });
        }
    }
    class Space {
        constructor(w, h){
            this.w = w;
            this.h = h;
            this.svg = canvas.rect(0, 0, w, h).attr({fill: "black"});

            this.create_stars(30);
        }

        create_stars(n){
            const max_radius = 4;

            for (var i = 0; i < n; i++){
                var cx = Math.floor(Math.random() * this.w);
                var cy = Math.floor(Math.random() * this.h);
                var r = Math.random() * max_radius;
                canvas.circle(cx, cy, r).attr({fill: "white"});
            }
        }
    }

    function tick(){
        for (let planet of planets){
            if (!paused && !planet.fixed && !planet.dragging){
                planet.update();
            }
            planet.draw();
        };

        for (let arrow of arrows){
            arrow.draw();
        }
    }
    function loop(){ tick(); setTimeout(loop, frame_gap); }
    function wipe(){
        canvas.clear();
        planets = [];
        arrows = [];
        let space = new Space(w, h);
    }
    function setup(scenario_number){
        wipe();

        if (scenario_number == 1){
            // One fixed, one orbiter.
            // zoom-out = mass/radius = 7/1

            var moon = new Planet({
                position: $V([0 + w/4, h/2]),
                velocity: $V([0, 2]),
                radius: 10,
                mass: 1,
                color: "white"
            });
            var earth = new Planet({
                position: $V([w/2, h/2]),
                mass: 700,
                radius: 100,
                color: "blue",
                // fixed: true
            });
        }
        else if (scenario_number == 2){
            // Mutually orbiting planets.
            // zoom-out = mass/radius = 10/1
            let d = 40;
            G = d;

            var thing_one = new Planet({
                position: $V([w/2 - d, h/2]),
                velocity: $V([0, 0.5]),
                mass: 1,
                radius: 10,
                color: "green"
            });
            var thing_two = new Planet({
                position: $V([w/2 + d, h/2]),
                mass: 1,
                radius: 10,
                velocity: $V([0, -0.5]),
                color: "yellow",
            });
        }
        else if (scenario_number == 3){
            // Two static planets and one swinging between them.
            // zoom-out = mass/radius = 50/1
            let d = 100;

            var left = new Planet({
                position: $V([w/2 - d, h/2]),
                mass: 1000,
                radius: 20,
                color: "orange",
                fixed: true
            });
            var right = new Planet({
                position: $V([w/2 + d, h/2]),
                mass: 1000,
                radius: 20,
                color: "purple",
                fixed: true
            });
            var middle = new Planet({
                position: $V([w/2, h/2]),
                velocity: $V([0, 4]),
                mass: 1,
                radius: 5,
                color: "white"
            });
        }
        else if (scenario_number == 4){
            // Three little planets orbiting around a big star.
            // zoom-out = mass/radius = 10/1
            let a = 70;
            let b = 2;

            var hub = new Planet({
                position: $V([w/2, h/2]),
                mass: 1500,
                radius: 150,
                color: "red",
                fixed: true
            });

            var left = new Planet({
                position: $V([w/2 - a, h/2 - a]),
                velocity: $V([-b, b]),
                mass: 200,
                radius: 7,
                color: "white"
            });

            var right = new Planet({
                position: $V([w/2 + a, h/2 - a]),
                velocity: $V([-b, -b]),
                mass: 200,
                radius: 7,
                color: "white"
            });

            var bottom = new Planet({
                position: $V([w/2, h/2 + Math.sqrt(a*a + a*a)]),
                velocity: $V([Math.sqrt(b*b*b), 0]),
                mass: 200,
                radius: 7,
                color: "white"
            });
        }

        else if (scenario_number == 5){
            // 
            //
            dt = 0.1;
            let d = 10;
            let G = 2*d;

            var dancer = new Planet({
                position: $V([w/2, h/2]),
                velocity: $V([0, -1/Math.sqrt(2)]),
                mass: 4,
                radius: 10,
                color: "white"
            });

            var prancer = new Planet({
                position: $V([w/2 + d, h/2]),
                velocity: $V([0, 1/Math.sqrt(2)]),
                mass: 4,
                radius: 10,
                color: "purple"
            });

            // var donner = new Planet({
            //     position: $V([w/2 + d/2, h/2 + d*(Math.sqrt(3)/2)]),
            //     velocity: $V([-1*Math.sqrt(3/2), 0]),
            //     mass: 0.001,
            //     radius: 3,
            //     color: "pink"
            // });
        }

        else if (scenario_number == -1){
            // 
            // zoom-out = mass/radius = 10/1

            function get_random_int(min, max) {
                // min included, max excluded
                return Math.floor(Math.random() * (max - min)) + min;
            }
            function get_random_element(array){
                return array[Math.floor(Math.random() * array.length)];
            }
            function get_random_color(){
                return '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16);
            }

            let n = get_random_int(2, 7 + 1);
            for (let i = 0; i < n; i++){
                let mass = get_random_int(25, 300 + 1);
                let x = get_random_int(-100, 100 + 1);
                let y = get_random_int(-100, 100 + 1);
                let theta = Math.random() * Math.PI * 2; // random angle for the velocity

                new Planet({
                    position: $V([w/2 + x, h/2 + y]),
                    velocity: $V([Math.cos(theta), Math.sin(theta)]),
                    mass: mass,
                    radius: mass/15.0,
                    color: get_random_color()
                });
            }
        }
    }
    function ready_buttons(){
        $("#scenario-selector").change(function(){
            current_scenario = this.value;
            setup(current_scenario);
        });
        $("#pause-button").click(function(){
            paused = !paused;
            if (this.value == 'Pause'){
                this.value = 'Play';
            }
            else if (this.value == 'Play'){
                this.value = 'Pause';
            }
        });

        $("#speed-selector").val(frame_gap);
        $("#speed-selector").on("input change", function(){
            frame_gap = this.value;
        });

        $("#reset-button").click(function(){
            setup(current_scenario);
        });
    }
    
    setup(current_scenario);
    ready_buttons();
    loop();
};