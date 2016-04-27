(function() {
  'use strict';

  module.exports = function renderNotFoundMiddleware(app, pimmInstance, controller) {
    return function renderNotFound(request) {
      return request.call(app).then(function(response) {
        if (response.status === 404) {
          return pimmInstance._controller_manager.methodForSignature(controller)(request);
        }
        return response;
      });
    };
  };
}());
