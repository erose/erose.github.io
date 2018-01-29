var KruskalCount = React.createClass({
  getInitialState: function(){
    return {
      words: this.getBibleText().split(' '),
      highlightedWordIndexes: [],
    };
  },

  getBibleText: function(){
    return "In the beginning God created the heaven and the Earth. And the earth was without form and void and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters. And God said, 'Let there be light', and there was light.";
  },

  render: function(){
    return React.DOM.div(
      {},
      this.state.words.map((word, index) => {
        return React.createElement(
          Word,
          {
            word: word,
            index: index,
            key: index,

            isHighlighted: this.state.highlightedWordIndexes.includes(index),
            
            onMouseOverWord: this.onMouseOverWord,
            onMouseLeaveWord: this.onMouseLeaveWord,
          }
        );
      }),
    );
  },

  onMouseOverWord: function(index){
    this.setState({
      highlightedWordIndexes: this.chainStartingFrom(index),
    });
  },

  /**
   * Returns the chain of words you get by following the Kruskal algorithm, starting at the given
   * index. Returns a list of integers.
   */
  chainStartingFrom: function(index){
    var result = [];

    var current = index;
    while (current < this.state.words.length) {
      result.push(current);

      var word = this.state.words[current];
      current += word.length;
    }

    return result;
  },

  onMouseLeaveWord: function(){
    this.setState({ highlightedWordIndexes: [], });
  },
});

var Word = React.createClass({
  // propTypes: {
  //   word: React.PropTypes.string,
  //   index: React.PropTypes.number,
  //   isHighlighted: React.propTypes.bool,

  //   onMouseOverWord: React.PropTypes.func,
  //   onMouseLeaveWord: React.PropTypes.func,
  // },

  render: function(){
    var style = {
      margin: 2,
      display: 'inline-block', // Why is this necessary?
      backgroundColor: this.props.isHighlighted ? 'lightBlue' : null,
    };

    return React.DOM.span(
      {
        style: style,
        onMouseEnter: (_event) => { this.props.onMouseOverWord(this.props.index); },
        onMouseLeave: (_event) => { this.props.onMouseLeaveWord(); },
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
