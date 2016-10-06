phina.namespace(function() {
  
  phina.define("passion.GameManager", {
    superClass: "phina.util.EventDispatcher",
    
    score: 0,
    highScore: 0,
    
    init: function() {
      this.superInit();
    },

  });
});
