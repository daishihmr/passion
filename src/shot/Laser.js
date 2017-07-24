phina.namespace(() => {
  
  phina.define("passion.Laser", {
    superClass: "passion.Shot",

    _static: {
      setup: passion.Shot.commonSetup,
      count: 20,
      heatByShot: 1,
      fireCount: 1,
      additiveBlending: true,
      texture: "effect.png",
      mazzleFlashEffect: {
        className: "passion.LaserMazzleFlash",
        texture: "effect.png",
        count: 20,
        additiveBlending: true,
        x: 0,
        y: -10,
      }
    },

    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
      this.power = 1;
    },

    spawn: function(player, index, gameScene) {
      this.player = player;
      const f = Math.randint(6, 8);
      this.superMethod("spawn", {
        x: player.x,
        y: player.y - 30,
        rotation: -Math.PI * 0.5,
        scaleX: 84,
        scaleY: 84,
        frameX: (f % 8) / 8,
        frameY: ~~(f / 8) / 8,
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
      this.x = this.player.x;
      this.y -= 30;
      this.scaleX = Math.min(this.scaleY + 80, 250);
      this.scaleY = Math.max(this.scaleY - 32, 16);
      if (this.y < GAME_AREA_HEIGHT * -0.1) {
        this.remove();
      }
    },

    onhit: function(e) {
      if (e.enemy.hp > 0) {
        this.remove();
      }
    },
  });

});
