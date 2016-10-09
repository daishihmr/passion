phina.namespace(function() {

  phina.define("passion.GameScene", {
    superClass: "phina.display.DisplayScene",

    gameManager: null,
    enemies: null,
    bullets: null,

    init: function() {
      this.superInit();

      this.gameManager = passion.GameManager();
      this.enemies = [];
      this.bullets = [];

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

      var self = this;
      var glLayer = this.glLayer;
      var bulletDrawer = glLayer.bulletDrawer;

      glLayer.effectDrawer.addObjType("effect", {
        texture: "texture0.png",
        additiveBlending: true,
        count: 200,
      });
      glLayer.topEffectDrawer.addObjType("effect", {
        texture: "texture0.png",
        count: 2,
      });
      glLayer.enemyDrawer.addObjType("enemy", {
        className: "passion.Enemy",
        texture: "enemy1.png",
        count: 50,
      });

      passion.Background.setup(glLayer, "bg.png", 1069);
      var player = this.player = passion.Player.setup(glLayer);
      
      passion.Danmaku.setup(this);

      var enemy = glLayer.enemyDrawer.get("enemy");
      enemy.spawn({
        scaleX: 32,
        scaleY: 32,
        x: 100,
        y: 100,
        frameX: 0,
        frameY: 0,
        frameW: 1 / 4,
        frameH: 1 / 4,
        red: 2,
        green: 2,
        blue: 2,
      });
      enemy.addChildTo(glLayer);
      enemy.startAttack("test");
      this.enemies.push(enemy);

      var enemy = glLayer.enemyDrawer.get("enemy");
      enemy.spawn({
        scaleX: 32,
        scaleY: 32,
        x: 160,
        y: 100,
        frameX: 0,
        frameY: 0,
        frameW: 1 / 4,
        frameH: 1 / 4,
        red: 2,
        green: 2,
        blue: 2,
      });
      enemy.addChildTo(glLayer);
      enemy.startAttack("test");
      this.enemies.push(enemy);

      var enemy = glLayer.enemyDrawer.get("enemy");
      enemy.spawn({
        scaleX: 32,
        scaleY: 32,
        x: 220,
        y: 100,
        frameX: 0,
        frameY: 0,
        frameW: 1 / 4,
        frameH: 1 / 4,
        red: 2,
        green: 2,
        blue: 2,
      });
      enemy.addChildTo(glLayer);
      enemy.startAttack("test");
      this.enemies.push(enemy);
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
