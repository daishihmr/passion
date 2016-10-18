phina.namespace(function() {

  phina.define("passion.GameScene", {
    superClass: "phina.display.DisplayScene",

    gameManager: null,

    shots: null,
    enemies: null,
    bullets: null,

    init: function() {
      this.superInit();

      var self = this;

      var gameManager = this.gameManager = passion.GameManager();

      var shots = this.shots = [];
      var enemies = this.enemies = [];
      var bullets = this.bullets = [];

      this.fromJSON({
        children: {
          bg: {
            className: "phina.display.Sprite",
            arguments: this.drawBgTexture(),
            originX: 0,
            originY: 0,
          },
          glLayer: {
            className: "passion.GLLayer",
          },
          uiLayer: {
            className: "passion.UILayer",
            arguments: this.gameManager,
          },
        },
      });

      var glLayer = this.glLayer;

      glLayer.effectDrawer.addObjType("effect", {
        texture: "texture0.png",
        additiveBlending: true,
        count: 200,
      });
      glLayer.topEffectDrawer.addObjType("effect", {
        texture: "texture0.png",
        count: 2,
      });

      // 背景
      passion.Background.setup(glLayer, "bg.png", 1069);

      // 自機
      var player = this.player = passion.Player.setup(glLayer).addChildTo(glLayer);

      // ショット
      var shotClassName = "passion.NormalShot";
      glLayer.shotDrawer.addObjType("shot", {
        className: shotClassName,
        texture: "bullets.png",
        count: 50,
      });
      var ShotClass = phina.using(shotClassName);
      player.heatByShot = ShotClass.heatByShot;
      player.on("fireShot", function(e) {
        for (var i = 0; i < ShotClass.fireCount; i++) {
          var s = glLayer.shotDrawer.get("shot");
          if (s) {
            s.spawn(this, i).addChildTo(glLayer);
            shots.push(s);
          }
        }
      });

      // 敵
      glLayer.enemyDrawer.addObjType("enemy", {
        className: "passion.Enemy",
        texture: "enemy1.png",
        count: 50,
      });

      // 弾
      passion.Danmaku.setup(this);
      
      this.on("enterframe", function(e) {
        if (e.app.keyboard.getKeyDown("s")) {
         e.app.stop(); 
        }
      });
    },

    update: function(app) {
      var es = this.enemies;
      for (var i = 0; i < es.length; i++) {
        es[i].flare("everyframe", {
          player: this.player,
          enemies: this.enemies,
        });
      }
    },

    drawBgTexture: function() {
      var bgTexture = phina.graphics.Canvas();
      bgTexture.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
      bgTexture.clearColor("hsla(190, 100%, 95%, 0.05)");
      (150).times(function(i, j) {
        var y = (SCREEN_HEIGHT * 1.5) / j * i;
        bgTexture.strokeStyle = "hsla(190, 100%, 95%, 0.1)";
        bgTexture.strokeLines(
          SCREEN_WIDTH * 0.0, y - 10,
          SCREEN_WIDTH * 0.1, y - 10,
          SCREEN_WIDTH * 0.2, y + 20,
          SCREEN_WIDTH * 0.5, y + 20,
          SCREEN_WIDTH * 0.6, y - 30,
          SCREEN_WIDTH * 0.7, y - 30,
          SCREEN_WIDTH * 0.8, y - 50,
          SCREEN_WIDTH * 1.0, y - 50
        );
        bgTexture.strokeStyle = "hsla(190, 100%, 65%, 0.1)";
        y += 1;
        bgTexture.strokeLines(
          SCREEN_WIDTH * 0.0, y - 10,
          SCREEN_WIDTH * 0.1, y - 10,
          SCREEN_WIDTH * 0.2, y + 20,
          SCREEN_WIDTH * 0.5, y + 20,
          SCREEN_WIDTH * 0.6, y - 30,
          SCREEN_WIDTH * 0.7, y - 30,
          SCREEN_WIDTH * 0.8, y - 50,
          SCREEN_WIDTH * 1.0, y - 50
        );
        bgTexture.strokeStyle = "hsla(190, 100%, 35%, 0.1)";
        y += 1;
        bgTexture.strokeLines(
          SCREEN_WIDTH * 0.0, y - 10,
          SCREEN_WIDTH * 0.1, y - 10,
          SCREEN_WIDTH * 0.2, y + 20,
          SCREEN_WIDTH * 0.5, y + 20,
          SCREEN_WIDTH * 0.6, y - 30,
          SCREEN_WIDTH * 0.7, y - 30,
          SCREEN_WIDTH * 0.8, y - 50,
          SCREEN_WIDTH * 1.0, y - 50
        );
      });
      return bgTexture;
    },

  });
});
