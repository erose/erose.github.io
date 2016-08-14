var w = new Worker("/static/js/markov_text_worker.js");
// All the books we are using.
var books = [
    {title: "Little Brother", slug: "little_brother", author: "Cory Doctorow"},
    {title: "Pirate Cinema", slug: "pirate_cinema", author: "Cory Doctorow"},
    {title: "For The Win", slug: "for_the_win", author: "Cory Doctorow"},
    {
        title: "Harry Potter and the Chamber of Secrets",
        slug: "harry_potter_and_the_chamber_of_secrets",
        author: "J.K. Rowling"
    },
    {
        title: "Scrubs (The Complete First Season)",
        slug: "scrubs",
        author: "Bill Lawrence"
    },
    {
        title: "Ender's Game",
        slug: "enders_game",
        author: "Orson Scott Card"
    },
    {title: "Hamlet", slug: "hamlet", author: "William Shakespeare"}
];
// A map from book slugs --> whether that book is selected or not.
var is_selected = {};

var BookButton = React.createClass({
    propTypes: {
        title: React.PropTypes.string,
        slug: React.PropTypes.string,
        author: React.PropTypes.string
    },
    onClick: function(){
        this.setState({ selected: !this.state.selected });
        is_selected[this.props.slug] = !(is_selected[this.props.slug]);
    },
    getTitleText: function(){
        return this.props.title + " by " + this.props.author;
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
                + this.props.slug
                + "_book_cover.jpg"
            ),
            title: this.getTitleText(),
            style: {width: 100, height: 150, opacity: opacity}
        }));
    },
    getInitialState: function(){
        return { selected: false };
    }
});
var BookButtonContainer = React.createClass({
    propTypes: {
        books: React.PropTypes.arrayOf(React.PropTypes.object)
    },
    render: function(){
        var els = this.props.books.map(function(book){
            return React.createElement(BookButton, {
                title: book.title,
                author: book.author,
                slug: book.slug,
                key: book.slug
            });
        });
        return React.DOM.div({}, els);
    }
});
var OutputArea = React.createClass({
    getInitialState: function(){
        return { spinning: false, title: "" };
    },
    componentWillMount: function(){
        // Set onmessage at component creation time.
        w.onmessage = this.finish;
    },
    start: function(){
        this.setState({ spinning: true });

        // Fetch from the selected urls.
        urls = _.filter(Object.keys(is_selected), function(k){
            return is_selected[k];
        }).map(function(name){
            return "/static/books/" + name + ".txt";
        });
        w.postMessage([{ urls: urls }, 4000, 10]);
    },
    finish: function(e){
        var text = e.data[0];
        $("#output-text").text(text);
        this.setState({ spinning: false, title: this.getTitle() });
    },
    getTitle: function(){
        titles = [];
        _.each(books, function(book){
            if (is_selected[book.slug]){
                titles.push(book.title);
            };
        });
        titles = _.shuffle(titles);

        result = titles[0];
        _.each(titles.slice(1), function(title){
            var splits = result.split(" ");
            splits[_.random(0, splits.length - 1)] = title;
            result = splits.join(" ");
        });
        return result;
    },
    render: function(){
        return React.DOM.div({ style: { textAlign: 'center' } },
            React.DOM.button({
                onClick: this.start,
                style: { borderRadius: 5, float: 'left' }
            },
                React.DOM.img({
                    className: 'arrow',
                    src: this.state.spinning ?
                        "/static/icons/rotating_arrow.gif"
                        :
                        "/static/icons/arrow.gif",
                    style: { width: 20, height: 20 }
                })
            ),
            React.DOM.div({
                style: {
                    display: 'inline',
                    fontSize: '1.5em',
                    fontFamily: "'Linden Hill', Georgia, serif"
                }
            },
                this.state.title
            ),
            React.DOM.pre({
                id: 'output-text',
                placeholder: 'Output:',
                style: {
                    width: '100%',
                    whiteSpace: 'pre-wrap',
                    textAlign: 'left'
                }
            })
        );
    }
})

$(function(){
    ReactDOM.render(
        React.createElement(BookButtonContainer, {books: books}),
        $("#book-buttons")[0]
    );
    ReactDOM.render(
        React.createElement(OutputArea, {}),
        $("#output-area")[0]
    )
});
