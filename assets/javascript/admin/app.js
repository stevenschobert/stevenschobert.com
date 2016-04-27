(function() {
  'use strict';

  var App = Ember.Application.create();

  /**
   * App-level Settings
   */
  App.ApplicationAdapter = DS.RESTAdapter.extend({
    namespace: 'api'
  });

  App.Router.map(function() {
    this.resource('posts', function() {
      this.resource('post', {path: '/:id'});
      this.resource('new_post', {path: '/new'});
    });
  });


  /**
   * Controllers
   */
  App.ApplicationController = Ember.ObjectController.extend({
    navExpanded: false,
    actions: {
      toggleNav: function() {
        this.set('navExpanded', !this.get('navExpanded'));
      }
    }
  });

  App.PostsController = Ember.ArrayController.extend({
    needs: 'post',
    sortProperties: ['published_at'],
    sortAscending: false,
  });

  App.PostController = Ember.ObjectController.extend({
    isNotDirty: Ember.computed.not('content.isDirty'),
    viewingPost: false,

    actions: {
      cancelEdit: function() {
        var post = this.get('model');
        if (window.confirm('Are you sure you want to discard your changes?')) {
          post.rollback();
        }
      },

      trashPost: function() {
        var post = this.get('model');
        if (window.confirm('Are you sure you want to trash this post?')) {
          this.transitionTo('posts');
          return post.destroyRecord().catch(function(err) {
            window.alert('Could not delete post!\n\nError: '+err.responseText);
          }.bind(this));
        }
      },

      savePost: function() {
        var post = this.get('model');
        return post.save().catch(function(err) {
          window.alert('Could not save post!\n\nError: '+err.responseText);
        });
      },

      publishPost: function() {
        var post = this.get('model');
        post.set('published', true);
        return this.send('savePost');
      },

      unpublishPost: function() {
        var post = this.get('model');
        if (window.confirm('Are you sure you want to unpublish this post?')) {
          post.set('published', false);
          return this.send('savePost');
        }
      }
    }
  });

  /**
   * Routes
   */
  App.IndexRoute = Ember.Route.extend({
    beforeModel: function() {
      this.transitionTo('posts');
    }
  });

  App.PostsRoute = Ember.Route.extend({
    model: function() {
      return this.store.find('post');
    },

    actions: {
      didTransition: function() {
        this.controllerFor('application').set('navExpanded', false);
      }
    }
  });

  App.PostRoute = Ember.Route.extend({
    model: function(params) {
      return this.store.find('post', params.id);
    },

    actions: {
      didTransition: function() {
        this.controller.set('viewingPost', true);
      },

      willTransition: function() {
        this.controller.set('viewingPost', false);
      }
    }
  });

  App.NewPostRoute = Ember.Route.extend({
    model: function() {
      var newpost = this.store.createRecord('post', {title: 'New Post', published: false});
      return newpost.save().catch(function(err) {
        newpost.destroyRecord();
        window.alert('Could not create a new post!\n\nError: '+err.responseText);
        return false;
      });
    },
    afterModel: function(post) {
      if (post) {
        this.transitionTo('post', post);
      } else {
        this.transitionTo('posts');
      }
    }
  });


  /**
   * Models
   */
  App.Post = DS.Model.extend({
    title: DS.attr('string'),
    published: DS.attr('boolean'),
    published_at: DS.attr('date'),
    color: DS.attr('string'),
    slug: DS.attr('string'),
    description: DS.attr('string'),
    body: DS.attr('string', {defaultValue: ''}),

    hasCustomSlug: function() {
      if (this.get('published')) {
        return true;
      }

      return paramCase(this.get('title')) !== this.get('slug');
    }.property('slug', 'published'),

    computedSlug: function() {
      return paramCase(this.get('title'));
    }.property('title'),

    valueSlug: function(key, value, previousValue) {
      if (arguments.length > 1) {
        this.set('slug', value);
      }

      if (this.get('hasCustomSlug')) {
        return this.get('slug');
      }

      return '';
    }.property('hasCustomSlug', 'slug'),

    titleChanged: function() {
      if (!this.get('hasCustomSlug')) {
        this.set('slug', paramCase(this.get('title')));
      }
    }.observes('title')
  });


  /**
   * Utilities
   */
  Ember.Handlebars.helper('prettyDate', function(date) {
    return moment(date).format('MMM D YYYY');
  });

  App.MarkdownEditorComponent = Ember.Component.extend({
    tagName: 'textarea',
    _initEditor: function() {
      var el = this.$().get(0);
      var editor = new Editor({element: el});

      editor.codemirror.setValue(this.get('value'));

      editor.codemirror.on('change', function(instance) {
        Ember.run(function() {
          this.set('value', instance.getValue());
        }.bind(this));
      }.bind(this));

      this.set('editor', editor);
    }.on('didInsertElement'),

    updateValue: function() {
      if (this.get('editor').codemirror.getValue() !== this.get('value')) {
        this.get('editor').codemirror.setValue(this.get('value'));
      }
    }.observes('value')
  });

  function paramCase(string) {
    string = string || '';
    return string.toLowerCase().replace(/[\s\.]/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  window.App = App;
}());
