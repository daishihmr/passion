phina.namespace(function() {

  phina.define("passion.Utils", {
    _static: {
      sep: function(num) {
        return ("" + Math.floor(num)).replace(/(\d)(?=(\d{3})+$)/g , '$1,');
      },
    },
    init: function() {},
  });

});
