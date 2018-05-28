var InputTags = React.createClass({
  getInitialState: function() {
    return {
        availableTags: new Set(['happy', 'sad']),
        selectedTags: new Set([]),
    };
  },

  render: function(){
    return React.DOM.div(
      {
        style: {
          width: '50%',
          margin: 'auto',
        }
      },
      React.DOM.div(
        {},
        this.renderSelectedTagsContainer(),
        this.renderSubmitButton(),
        this.renderAvailableTagsContainer(),
      )
    );
  },

  renderSelectedTagsContainer: function() {
    // TODO: Duplication.
    var styles = { display: 'flex', justifyContent: 'center', marginBottom: '2rem', }
    return React.DOM.div(
      { style: styles },
      this.renderSelectedTags(Array.from(this.state.selectedTags))
    );
  },

  renderSelectedTags: function(tagsToRender) {
    var tagColor = 'lightGreen';
    var tagAttributes = {
      style: {
        backgroundColor: 'lightGreen',
        margin: '0.25rem',
        padding: '0.25rem',

        border: '0.1rem solid ' + tagColor,
        borderRadius: '0.5rem',
      },
    };

    var tagTexts = Array.from(tagsToRender);
    tagTexts.sort();

    return tagTexts.map(function(tagText) {
      return React.DOM.span(tagAttributes, tagText);
    });
  },

  renderSubmitButton: function() {
    var _this = this;

    var onClickFunction = function() {
      var tagTexts = Array.from(_this.state.selectedTags);
      var url = 'https://mood-tracker-backend.herokuapp.com/create_event';
      debugger;

      $.post(url, JSON.stringify({ tags: tagTexts }), function() {
        alert('Success!');
      });
    };

    return React.DOM.div(
      {},
      React.DOM.input({ type: 'button', value: 'Submit', onClick: onClickFunction, })
    );
  },

  renderAvailableTagsContainer: function() {
    // TODO: Duplication.
    var styles = { display: 'flex', justifyContent: 'center', marginTop: '2rem', }
    return React.DOM.div(
      { style: styles },
      this.renderAvailableTags(Array.from(this.state.availableTags))
    );
  },

  renderAvailableTags: function(tagsToRender) {
    var _this = this;

    var tagAttributes = {
      style: {
        backgroundColor: 'lightGrey',
        margin: '0.25rem',
        padding: '0.25rem',

        border: '0.1rem solid lightGrey',
        borderRadius: '0.5rem',

        cursor: 'pointer',
      },
    };

    var tagTexts = Array.from(tagsToRender);
    tagTexts.sort();

    return tagTexts.map(function(tagText) {
      var onClickFunction = function() { _this.onTagClicked(tagText); };
      var attributes = Object.assign({}, tagAttributes, { onClick: onClickFunction });
      
      return React.DOM.span(attributes, tagText);
    });
  },

  onTagClicked: function(clickedTagText) {
    var newAvailableTags = new Set(
      _.filter(
        Array.from(this.state.availableTags),
        function(otherTagText) { return otherTagText !== clickedTagText; }
      )
    );
    var newSelectedTags = new Set(Array.from(this.state.selectedTags).concat(clickedTagText));

    this.setState({
      availableTags: newAvailableTags,
      selectedTags: newSelectedTags,
    })
  },
});

$(function(){
  ReactDOM.render(
    React.createElement(InputTags, {}),
    document.getElementById('input-tags'),
  );
});
