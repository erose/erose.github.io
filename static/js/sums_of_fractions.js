var width = 250, height = 250;
var FONT_SIZE = 24;
var rectangle = new Path.Rectangle({
    point: [0, 0],
    size: [width, height],
    strokeColor: 'black',
    fillColor: new Color(0, 0, 0, 0)
});
view.center = rectangle.position;

var n = 2;
var stage = 0;
var cells = undefined;
var cell_columns = undefined;
var horizontal_strips = undefined;
var vertical_strips = undefined;
var top_text = undefined;
var sides_text = undefined;
var scene = undefined;
initalize();

function add_top_text(textobj){
    var HEIGHT_ABOVE_RECTANGLE = 20;
    _.extend(textobj, {
        point: top_text.isEmpty()
               ? [0, 0] : top_text.lastChild.bounds.rightCenter,
        fontSize: FONT_SIZE
    });

    top_text.addChild(new PointText(textobj));
    top_text.lastChild.position.y = rectangle.bounds.top
                                  - HEIGHT_ABOVE_RECTANGLE;
    top_text.position = rectangle.bounds.topCenter
                      + [0, -HEIGHT_ABOVE_RECTANGLE];
}
function initalize(){
    // Width and height of a cell.
    w = width/n;
    h = height/(n+1);

    // Set up all collections. 
    cells = new Group();
    cell_columns = initialize_cells();
    horizontal_strips = new Group();
    vertical_strips = new Group();
    top_text = new Group();
    sides_text = new Group();
    scene = new Group([cells, rectangle, vertical_strips, horizontal_strips]);
}
function initialize_cells(){
    return _.range(n).map(function(value, x){
        return _.range(n+1).map(function(value, y){
            return create_cell({point: [x*w, y*h], size: [w, h]});
        })
    });
}
function create_cell(obj){
    // Given an object of options, renders them into a Cell object.
    obj.strokeColor = 'black';
    obj.strokeWidth = obj.strokeWidth || 0;

    var cell = new Path.Rectangle(obj);
    cells.addChild(cell);
    
    cell.sendToBack(); // All cells are rendered in the bottom layer.
    return cell;
}
function initialize_vertical_strips(){
    _.each(_.range(1, n), function(x){
        _.each(cell_columns[x - 1], function(cell){
            cell.fillColor = 'LightGrey';
        });

        vertical_strips.addChild(
            new Path.Line({
                from: [w*x, 0],
                to: [w*x, h*(n+1)],
                strokeColor: 'black',
            })
        );
    });
}
function initialize_horizontal_strips(){
    _.each(_.range(1, n + 1), function(y){
        _.each(cell_columns, function(column){
            var cell = column[y - 1];
            cell.fillColor = 'LightGrey';
        });

        horizontal_strips.addChild(
            new Path.Line({
                from: [0, h*y],
                to: [w*n, h*y],
                strokeColor: 'black',
            })
        );
    });
}
function move_bottom_row(){
    var bottom_row = _.map(cell_columns, function(column){
        return column[n];
    });
    // Animate all but the last, in the bottom row.
    _.each(bottom_row.slice(0, -1), function(cell, i){
        // Create a replacement occupying the same space.
        cell_columns[i][n] = create_cell({
            rectangle: cell.bounds,
            strokeWidth: 1
        });

        cell.bringToFront(); // We want to see it as it flies.
        cell.animate({
            properties: {
                position: { // Absolute would be much cleaner.
                    x: '+' + w*(n - 1 - i),
                    y: '-' + h*(n - i)
                }
            },
            settings: {
                duration: 1000,
                complete: function(){
                    // The cells should be mapped as follows.
                    // 
                    // _ _ _ a
                    // _ _ _ b
                    // _ _ _ c
                    // a b c _
                    // 
                    // Hence the i-th from the next-to-last
                    // (last = n - 1, next-to-last = n - 2)
                    // in the last column is the target.
                    var target = _.last(cell_columns)[n-2 - i];
                    target.replaceWith(cell); // Replace in the canvas.
                    _.last(cell_columns)[n-2 - i] = cell;

                    // Back to the bottom layer.
                    cell.sendToBack();
                }
            }
        });
    });
}

rectangle.onClick = function(event){
    if (stage === 0){
        initialize_vertical_strips();
        add_top_text({content: _.template("<%=n-1%>/<%=n%>")({n: n})});
    }
    else if (stage === 1){
        // Switch to grid.
        vertical_strips.remove();
        cells.strokeWidth = 1;

        var HEIGHT_ABOVE_RECTANGLE = 20;
        sides_text.addChild(new PointText({
            content: n,
            point: rectangle.bounds.bottomCenter
                + [0, HEIGHT_ABOVE_RECTANGLE + 10],
            fontSize: FONT_SIZE,
            justification: 'center',
            opacity: 0.5
        }));

        var HEIGHT_ABOVE_RECTANGLE = 20;
        sides_text.addChild(new PointText({
            content: n+1,
            point: rectangle.bounds.leftCenter + [-HEIGHT_ABOVE_RECTANGLE, 0],
            fontSize: FONT_SIZE,
            justification: 'center',
            opacity: 0.5
        }));
    }
    else if (stage === 2){
        move_bottom_row();
    }
    else if (stage === 3){
        // Add the single cell and highlight it.
        cell_columns[n - 1][n - 1].fillColor = 'LightBlue';
        add_top_text({
            content: _.template(" + 1/(<%=n%> · <%=n+1%>)")({n: n}),
            fillColor: 'LightBlue'
        });
    }
    else if (stage === 4){
        // Unhighlight it.
        cell_columns[n - 1][n - 1].fillColor = 'LightGrey';
        top_text.lastChild.fillColor = 'black';
        add_top_text({content: ' = '});
    }
    else if (stage === 5){
        // Hide grid and switch to horizontal.
        initialize_horizontal_strips();
        cells.strokeWidth = 0;
        add_top_text({content: (n) + '/' + (n+1)});

        sides_text.remove();
    }
    else if (stage === 6){
        // Rotate and start the cycle over again.

        // Clear the text before the square floats over it.
        top_text.remove();

        scene.animate({
            properties: {rotate: -90},
            settings: {
                duration: 1000,
                complete: function(){
                    n++;

                    horizontal_strips.remove();
                    vertical_strips.remove();
                    cells.remove();
                    initalize();

                    // Don't totally reset; keep these.
                    initialize_vertical_strips();
                    add_top_text({
                        content: _.template("<%=n-1%>/<%=n%>")({n: n})
                    });
                }
            }
        })
    }

    // Advance the stage.
    // The final stage starts over, but skips the first.
    if (stage === 6){
        stage = 1;
    } else {
        stage++;
    }
}