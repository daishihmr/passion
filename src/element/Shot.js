phina.namespace(function() {
  
  phina.define("passion.Shot", {
    superClass: "passion.Sprite",
    
    bx: 0,
    by: 0,
    
    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
      this.on("enterframe", function(e) {
        this.bx = this.x;
        this.by = this.y;
        this.controll(e.app);
      });
    },
    
    controll: function(app) {},
  });

  phina.define("passion.NormalShot", {
    superClass: "passion.Shot",
    
    _static: {
      heatByShot: 6,
      fireCount: 3,
    },
    
    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
    },
    
    spawn: function(player, index) {
      passion.Shot.prototype.spawn.call(this, {
        x: player.x + (index - 1) * 10,
        y: player.y - 30,
        rotation: -Math.PI * 0.5,
        scaleX: 48,
        scaleY: 48,
        frameX: 1 / 8,
        frameY: 1 / 8,
        frameW: 1 / 8,
        frameH: 1 / 8,
        red: 1.0,
        green: 1.0,
        blue: 1.0,
        alpha: 0.8,
      });
      return this;
    },
    
    controll: function(app) {
      this.y -= 16;
      if (this.y < GAME_AREA_HEIGHT * -0.1) {
        this.remove();
      }
    },
  });

  phina.define("passion.WideShot", {
    superClass: "passion.Shot",
    
    _static: {
      heatByShot: 6,
      fireCount: 3,
    },
    
    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
    },
    
    spawn: function(player, index) {
      passion.Shot.prototype.spawn.call(this, {
        x: player.x + (index - 1) * 10,
        y: player.y,
        rotation: -Math.PI * 0.5 + (index - 1) * 0.2,
        scaleX: 48,
        scaleY: 48,
        frameX: 1 / 8,
        frameY: 1 / 8,
        frameW: 1 / 8,
        frameH: 1 / 8,
        red: 1.0,
        green: 1.0,
        blue: 1.0,
        alpha: 0.8,
      });
      return this;
    },
    
    controll: function(app) {
      this.x += Math.cos(this.rotation) * 16;
      this.y += Math.sin(this.rotation) * 16;
      if (this.y < GAME_AREA_HEIGHT * -0.1 || this.x < GAME_AREA_WIDTH * -0.1 || GAME_AREA_WIDTH * 1.1 < this.x) {
        this.remove();
      }
    },
  });

});