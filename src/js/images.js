(function() {
  "use strict";

  $(document).ready(function() {
    $("[data-image=\"magnify\"]").magnificPopup({
      type: "image",
      retina: {
        ratio: 2
      }
    });
  });
}());
