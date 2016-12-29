phina.namespace(function() {

  var SPEED = 20;

  phina.define("passion.Shot", {
    superClass: "passion.Sprite",

    bx: 0,
    by: 0,
    power: 0,
    age: 0,

    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
      this.on("enterframe", function(e) {
        this.bx = this.x;
        this.by = this.y;
        this.controll(e.app);
        this.age += 1;
      });
    },

    spawn: function(options) {
      this.superMethod("spawn", options);
      this.age = 0;
      return this;
    },

    controll: function(app) {},
  });

  phina.define("passion.NormalShot", {
    superClass: "passion.Shot",

    _static: {
      count: 9,
      heatByShot: 6,
      fireCount: 3,
      additiveBlending: false,
    },

    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
      this.power = 1;
    },

    spawn: function(player, index, gameScene) {
      this.superMethod("spawn", {
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

    onhit: function(e) {
      this.remove();
    },
  });

  phina.define("passion.WideShot", {
    superClass: "passion.Shot",

    _static: {
      count: 9,
      heatByShot: 6,
      fireCount: 3,
      additiveBlending: false,
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

    onhit: function(e) {
      this.remove();
    },
  });

  phina.define("passion.WideShot2", {
    superClass: "passion.Shot",

    _static: {
      count: 27,
      heatByShot: 6,
      fireCount: 9,
      additiveBlending: false,
    },

    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
      this.power = 1;
    },

    spawn: function(player, index, gameScene) {
      var d = ~~(index / 3);
      var i = index % 3;

      this.superMethod("spawn", {
        x: player.x + [-1, 1, 0][d] * 30 + [-1, 1, 0][i] * 10,
        y: player.y,
        rotation: -Math.PI * 0.5 + [-1, 1, 0][d] * 0.2,
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

    onhit: function(e) {
      this.remove();
    },
  });

  phina.define("passion.Laser", {
    superClass: "passion.Shot",

    _static: {
      count: 6,
      heatByShot: 4,
      fireCount: 1,
      additiveBlending: true,
      texture: "effect.png",
    },

    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
      this.power = 1;
    },

    spawn: function(player, index, gameScene) {
      this.player = player;
      var f = Math.randint(6, 8);
      this.superMethod("spawn", {
        x: player.x,
        y: player.y - 30,
        rotation: -Math.PI * 0.5,
        scaleX: 192,
        scaleY: 24,
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
      this.y -= SPEED;
      if (this.y < GAME_AREA_HEIGHT * -0.1) {
        this.remove();
      }
    },

    onhit: function(e) {
      this.remove();
    },
  });

});
