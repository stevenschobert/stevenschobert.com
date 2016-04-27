(function() {
  'use strict';

  var Promise = require('bluebird'),
      _ = require('lodash'),
      cradle = require('cradle'),
      secureAttrs = require('./keylime_secure_attrs');

  module.exports = function createCouchAdapter(options) {
    var conn = new(cradle.Connection)(options.url, parseInt(options.port, 10), (options.username && options.password) ? {
          auth: {
            username: options.username,
            password: options.password
          }
        } : {}),
        db = conn.database(options.database),
        exists = Promise.promisify(db.exists).bind(db),
        create = Promise.promisify(db.create).bind(db),
        save = Promise.promisify(db.save).bind(db),
        remove = Promise.promisify(db.remove).bind(db),
        view = Promise.promisify(db.view).bind(db);

    return function couchAdapter(Model) {
      var CHECKED_DB_EXISTS = false,
          CREATED_VIEW_FOR_MODEL = false,

          forceExists = function forceExists() {
            if (CHECKED_DB_EXISTS) {
              return Promise.resolve(true);
            }

            return exists()
            .then(function(doesExist) {
              if (!doesExist) {
                return create();
              }
              return true;
            })
            .then(function() {
              CHECKED_DB_EXISTS = true;
              return true;
            });
          },

          forceView = function forceView() {
            if (CREATED_VIEW_FOR_MODEL) {
              return Promise.resolve(true);
            }

            return save('_design/'+Model.name, {
              all: {
                map: 'function(doc) {\nif (doc.model_name && doc.model_name === \''+Model.name+'\') {\nemit(doc._id, doc);\n}\n}'
              }
            })
            .then(function() {
              CREATED_VIEW_FOR_MODEL = true;
            });
          },

          prep = function prepForQuery() {
            return forceExists()
            .then(function() {
              return forceView();
            });
          };


      Model
        .attrHelper('serialize', function addSerializer(attr, value) {
          if (_.isFunction(value)) {
            attr.serializer = value;
          } else {
            attr.serializer = function autoSerializer() {
              return value;
            };
          }
        })
        .attrHelper('deserialize', function addDeserializer(attr, value) {
          if (_.isFunction(value)) {
            attr.deserializer = value;
          } else {
            attr.deserializer = function autoDeserializer() {
              return value;
            };
          }
        })

        .method('_serialize', function serializeModel() {
          var toSave = _.omit(_.cloneDeep(this), _.functions(this));

          _.forIn(Model.attrs(), function(attr, name) {
            if (_.isUndefined(attr.serializer)) {
              toSave[name] = this[name];
            } else {
              toSave[name] = _.isFunction(attr.serializer) ? attr.serializer(this[name]) : attr.serializer;
            }

            if (_.isUndefined(toSave[name])) {
              delete toSave[name];
            }
          }, this);

          return toSave;
        })

        .method('_deserialize', function deserializeModel() {
          _.forIn(Model.attrs(), function(attr, name) {
            if (!_.isUndefined(attr.deserializer)) {
              this[name] = _.isFunction(attr.deserializer) ? attr.deserializer(this[name]) : attr.deserializer;
            }
          }, this);

          return this;
        });

      Model
        .use(secureAttrs())
        .attr('id', null)
          .serialize(undefined)
        .attr('model_name', Model.name)
          .hidden()
        .attr('_rev', null)
          .hidden()
          .serialize(undefined)

        .method('save', function saveModel() {
          return prep().bind(this)
          .then(function() {
            return (this.id && this._rev) ? save(this.id, this._rev, this._serialize()) : save(this._serialize());
          })
          .then(function(res) {
            this.id = res.id;
            this._rev = res.rev;
            return this;
          });
        })

        .method('remove', function removeModel() {
          return prep().bind(this)
          .then(function() {
            return remove(this.id, this._rev);
          });
        });

      Model.find = function findModel(id) {
        return prep()
        .then(function() {
          return view(Model.name+'/all', {key: id});
        })
        .then(function(docs) {
          var first;
          if (_.isEmpty(docs)) {
            return null;
          }
          first = _.first(docs);
          return new Model(_.merge({id: first.id}, first.value))._deserialize();
        });
      };

      Model.all = function allModels() {
        return prep()
        .then(function() {
          return view(Model.name+'/all');
        })
        .map(function(doc) {
          return new Model(_.merge({id: doc.id}, doc.value))._deserialize();
        });
      };

      Model.where = function modelsWhere() {
        var topArgs = arguments;

        return prep()
        .then(function() {
          return Model.all();
        })
        .then(function(models) {
          return _.partial(_.filter, models).apply(null, topArgs);
        });
      };
    };
  };
}());
