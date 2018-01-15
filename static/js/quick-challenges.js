var MultiplicationProblem = React.createClass({
  getInitialState: function() {
    // Variable naming -- we multiply a * b = answer.
    return {
      a: this.randomIntegerUpTo(100),
      b: this.randomIntegerUpTo(100),
      answer: null,
    };
  },

  // Includes zero, but excludes `max`.
  randomIntegerUpTo: function(max) {
    return Math.floor(Math.random() * max);
  },

  render: function(){
    var spanAttributes = {
      style: {
        margin: '0.1rem',
      },
    };

    return React.DOM.div(
      {},
      React.DOM.span(spanAttributes, this.state.a),
      React.DOM.span(spanAttributes, '*'),
      React.DOM.span(spanAttributes, this.state.b),
      React.DOM.span(spanAttributes, '='),
      this.renderAnswerInput(),

      this.isCorrect() ? this.renderCheckMark() : null,
    );
  },

  renderAnswerInput: function() {
    var styles = {
      width: '3rem',
      color: this.isCorrect() ? 'green' : 'red',
    };

    return React.DOM.input({
      type: 'number',
      style: styles,
      onChange: this.onAnswerChange,
    });
  },

  isCorrect: function() {
    return this.state.a * this.state.b === this.state.answer;
  },

  renderCheckMark: function() {
    return React.DOM.span({}, '✔');
  },

  onAnswerChange: function(event) {
    var newAnswerText = event.target.value;
    if (newAnswerText.match(/\d+/)) {
      this.setState({
        answer: parseInt(newAnswerText)
      });
    }
  },
});

$(function(){
  ReactDOM.render(
    React.createElement(MultiplicationProblem, {}),
    document.getElementById('multiplication-problem'),
  );
});
