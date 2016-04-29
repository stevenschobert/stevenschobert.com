(function() {
  'use strict';

  var images = document.querySelectorAll('.text-block p > img');

  if (images.length > 0) {
    [].forEach.call(images, function(image) {
      image.parentNode.setAttribute('class', 'full-image');
    });
  }
}());
