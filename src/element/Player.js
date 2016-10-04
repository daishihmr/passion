phina.namespace(function() {
  
  phina.define("passion.Player", {
    superClass: "passion.Sprite",
    
    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
      this.on("enterframe", function(e) {
        this.controll(e.app);
      });
    },
    
    spawn: function() {
      passion.Sprite.prototype.spawn.call(this, {
        scaleX: 5,
        scaleY: 5,
        frameX: 0,
        frameY: 0,
        frameW: 1,
        frameH: 1,
      });
      return this;
    },
    
    controll: function(app) {
      var p = app.pointer;
      var dp = p.deltaPosition;
      
      if (p.getPointing()) {
        this.x += dp.x * 2;
        this.y += dp.y * 2;
        
        this.x = Math.clamp(this.x, 5, GAME_AREA_WIDTH - 5);
        this.y = Math.clamp(this.y, 5, GAME_AREA_HEIGHT - 5);
      }
    },

  });
});