var KruskalCount = React.createClass({
  getBibleText: function(){
    return "In the beginning God created the heaven and the Earth. And the earth was without form and void and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters. And God said, 'Let there be light', and there was light.";
  },

  getInitialState: function(){
    return {
      wordObjects: this.getBibleText().split(' ').map(
        function(word, index){
          return { word: word, number: index };
        }
      ),
      highlightedWordNumbers: [],
    };
  },

  onWordMousedOver: function(number){
    this.setState({ highlightedWordNumbers: this.chainStartingFrom(number), });
  },

  /**
   * Returns the chain of words you get by following the Kruskal algorithm, starting at the given
   * index. Returns a list of integers.
   */
  chainStartingFrom: function(number){
    var result = [];

    var current = number;
    while (current < this.state.wordObjects.length) {
      result.push(current);

      var wordObject = this.state.wordObjects[current];
      current += wordObject.word.length;
    }

    return result;
  },

  onWordMouseLeave: function(){
    this.setState({ highlightedWordNumbers: [], });
  },

  render: function(){
    var f = this.onWordMousedOver;
    var g = this.onWordMouseLeave;
    var highlightedWordNumbers = this.state.highlightedWordNumbers;

    return React.DOM.div(
      {},
      this.state.wordObjects.map(function(wordObject, number){
        return React.createElement(
          Word,
          {
            word: wordObject.word,
            number: wordObject.number,
            isHighlighted: highlightedWordNumbers.includes(wordObject.number),
            
            onWordMousedOver: f,
            onWordMouseLeave: g,
          }
        );
      }),
    );
  },
});

var Word = React.createClass({
  // props: word
  // props: number
  // props: isHighlighted
  // props: onWordMousedOver
  // props: onMouseLeave

  render: function(){
    var style = {
      margin: 2,
      display: 'inline-block', // Why is this necessary?
      backgroundColor: this.props.isHighlighted ? 'lightBlue' : null,
    };

    return React.DOM.span(
      {
        style: style,
        onMouseEnter: function(_event){
          this.props.onWordMousedOver(this.props.number);
        }.bind(this),
        onMouseLeave: function(_event){
          this.props.onWordMouseLeave();
        }.bind(this),
      },
      this.props.word,
    );
  },
})

$(function(){
  ReactDOM.render(
    React.createElement(KruskalCount, {}),
    document.getElementById('kruskal-count'),
  );
});
