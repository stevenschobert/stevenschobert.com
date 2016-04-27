(function() {
  'use strict';

  var keylime = require('keylime');
  var marked = require('marked');
  var highlight = require('highlight.js');
  var Promise = require('bluebird');

  var MarkdownRenderer = keylime('MarkdownRenderer');

  marked.setOptions({
    highlight: function(code, lang) {
      return highlight.highlightAuto(code, [lang]).value;
    }
  });
  marked = Promise.promisify(marked);

  MarkdownRenderer
    .attr('markdown')
    .attr('html')
    .method('render', function render() {
      return marked(this.markdown).bind(this)
      .then(function(content) {
        this.html = content;
        return this;
      });
    });

  module.exports = MarkdownRenderer;
}());
