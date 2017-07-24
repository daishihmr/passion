phina.namespace(() => {
  
  phina.define("passion.WideShot", {
    superClass: "passion.Shot",

    _static: {
      setup: passion.Shot.commonSetup,
      count: 9,
      heatByShot: 6,
      fireCount: 3,
      additiveBlending: false,
      hitEffect: {
        className: "passion.BulletEraseEffect",
        texture: "bullets_erase.png",
        count: 9,
      },
    },

    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
      this.power = 1;
    },

    spawn: function(player, index, gameScene) {
      this.superMethod("spawn", {
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

      this.dx = Math.cos(this.rotation) * 20;
      this.dy = Math.sin(this.rotation) * 20;
      return this;
    },

    controll: function(app) {
      this.x += this.dx;
      this.y += this.dy;
      if (this.y < GAME_AREA_HEIGHT * -0.1 || this.x < GAME_AREA_WIDTH * -0.1 || GAME_AREA_WIDTH * 1.1 < this.x) {
        this.remove();
      }
    },

    onhit: function(e) {
      this.remove();
    },
  });

});
