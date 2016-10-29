phina.namespace(function() {
  
  var SPEED = 20;
  
  phina.define("passion.Shot", {
    superClass: "passion.Sprite",
    
    bx: 0,
    by: 0,
    power: 0,
    
    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
      this.on("enterframe", function(e) {
        this.bx = this.x;
        this.by = this.y;
        this.controll(e.app);
      });
    },
    
    controll: function(app) {},
    
    onhit: function(e) {
      this.remove();
    },
  });

  phina.define("passion.NormalShot", {
    superClass: "passion.Shot",
    
    _static: {
      heatByShot: 6,
      fireCount: 3,
    },
    
    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
      this.power = 1;
    },
    
    spawn: function(player, index) {
      passion.Shot.prototype.spawn.call(this, {
        x: player.x + [-1, 1, 0][index] * 10,
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
      this.y -= SPEED;
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
      this.power = 1;
    },
    
    spawn: function(player, index) {
      passion.Shot.prototype.spawn.call(this, {
        x: player.x + [-1, 1, 0][index] * 20,
        y: player.y,
        rotation: -Math.PI * 0.5 + [-1, 1, 0][index] * 0.2,
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
      
      this.dx = Math.cos(this.rotation) * SPEED;
      this.dy = Math.sin(this.rotation) * SPEED;
      return this;
    },
    
    controll: function(app) {
      this.x += this.dx;
      this.y += this.dy;
      if (this.y < GAME_AREA_HEIGHT * -0.1 || this.x < GAME_AREA_WIDTH * -0.1 || GAME_AREA_WIDTH * 1.1 < this.x) {
        this.remove();
      }
    },
  });

});
