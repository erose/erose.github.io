var w = new Worker("/static/js/markov_text_worker.js");
// All the books we are using.
var book_names = [
    "little_brother",
    "pirate_cinema",
    "for_the_win",
    "harry_potter_and_the_chamber_of_secrets",
    "scrubs",
    "enders_game",
    "hamlet"
];
// A map from book name --> whether that book is selected or not.
var is_selected = {};

function press(){
    // Entry point for the UI -- gets called when the user clicks 'generate'.
    $("#still-icon").toggle();
    $("#active-icon").toggle();

    // Fetch from the selected urls.
    urls = _.filter(Object.keys(is_selected), function(k){
        return is_selected[k];
    }).map(function(name){
        return "/static/books/" + name + ".txt";
    });
    w.postMessage([{ urls: urls }, 4000]);
}
w.onmessage = function(e){
    // Called when we recieve a message from the worker.
    var text = e.data[0];
    $("#output-text").text(text);

    $("#still-icon").toggle();
    $("#active-icon").toggle();
}

var BookButton = React.createClass({
    propTypes: {
        name: React.PropTypes.string
    },
    onClick: function(){
        this.setState({ selected: !this.state.selected });
        is_selected[this.props.name] = !(is_selected[this.props.name]);
    },
    render: function(){
        var opacity = this.state.selected ? 1 : 0.5;
        return React.DOM.button({
            onClick: this.onClick,
            style: {
                backgroundColor: 'white',
                outline: 0,
                opacity: opacity,
            }
        },
        React.DOM.img({
            src: (
                "static/images/book_covers/"
                + this.props.name
                + "_book_cover.jpg"
            ),
            style: {width: 100, height: 150, opacity: opacity}
        }));
    },
    getInitialState: function(){
        return { selected: false };
    }
});
var BookButtonContainer = React.createClass({
    propTypes: {
        names: React.PropTypes.arrayOf(React.PropTypes.string)
    },
    render: function(){
        var els = this.props.names.map(function(name){
            return React.createElement(BookButton, {
                name: name,
                key: name
            });
        });
        return React.DOM.div({}, els);
    }
});

$(function(){
    ReactDOM.render(
        React.createElement(BookButtonContainer, {names: book_names}),
        $("#book-buttons")[0]
    );
});
