phina.namespace(() => {
  
  phina.define("passion.NormalShot2", {
    superClass: "passion.Shot",

    _static: {
      setup: passion.Shot.commonSetup,
      count: 18,
      heatByShot: 8,
      fireCount: 5,
      additiveBlending: false,
      hitEffect: {
        className: "passion.BulletEraseEffect",
        texture: "bullets_erase.png",
        count: 18,
      },
    },

    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
      this.power = 1;
    },

    spawn: function(player, index, gameScene) {
      this.superMethod("spawn", {
        x: player.x + [-2, 2, -1, 1, 0][index] * 10,
        y: player.y - 30 + [1, 1, 0, 0, -1][index] * 10,
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
      this.y -= 20;
      if (this.y < GAME_AREA_HEIGHT * -0.1) {
        this.remove();
      }
    },

    onhit: function(e) {
      this.remove();
    },
  });

});
