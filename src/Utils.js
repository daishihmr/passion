phina.namespace(() => {

  phina.define("passion.Utils", {
    _static: {
      sep: function(num) {
        return ("" + Math.floor(num)).replace(/(\d)(?=(\d{3})+$)/g , '$1,');
      },
    },
    init: function() {},
  });
  
  phina.accessory.Tweener.$method("clone", function() {
    return phina.accessory.Tweener(this.target);
  });

});
