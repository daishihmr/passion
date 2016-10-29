phina.namespace(function() {

  phina.define("passion.GameScene", {
    superClass: "phina.display.DisplayScene",

    random: null,
    gameManager: null,

    shots: null,
    enemies: null,
    bullets: null,
    items: null,

    init: function(options) {
      this.superInit(options);

      var self = this;
      var stageData = phina.asset.AssetManager.get("json", "stage").data;

      this.random = phina.util.Random(12345);
      this.gameManager = passion.GameManager(stageData);

      this.fromJSON({
        shots: [],
        enemies: [],
        bullets: [],
        items: [],
        children: {
          bg: {
            className: "phina.display.Sprite",
            arguments: passion.GameSceneBg.drawBgTexture(),
            originX: 0,
            originY: 0,
          },
          glLayer: {
            className: "passion.GLLayer",
          },
          uiLayer: {
            className: "passion.UILayer",
            arguments: this.gameManager,
            alpha: 0,
          },
        },
      });

      this.uiLayer.tweener.clear().fadeIn(500);

      var gameManager = this.gameManager;

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
      passion.Background.setup(glLayer, "bg", 1069);

      // 自機
      var player = this.player = passion.Player.setup(glLayer).addChildTo(glLayer);

      // ショット
      var shotClassName = "passion.WideShot";
      glLayer.shotDrawer.addObjType("shot", {
        className: shotClassName,
        texture: "bullets.png",
        count: 50,
      });
      var ShotClass = phina.using(shotClassName);
      player.heatByShot = ShotClass.heatByShot;
      var shots = this.shots;
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
      stageData.enemies
        .map(function(enemy) {
          return phina.asset.AssetManager.get("json", enemy + ".enemy").data;
        })
        .map(function(enemyData) {
          return enemyData.texture;
        })
        .uniq()
        .forEach(function(texture) {
          glLayer.enemyDrawer.addObjType(texture, {
            className: "passion.Enemy",
            texture: texture,
            count: 50,
          });
        });

      var enemies = this.enemies;
      gameManager.on("spawnEnemy", function(e) {
        var enemyData = phina.asset.AssetManager.get("json", e.name + ".enemy").data;
        var enemy = glLayer.enemyDrawer.get(enemyData.texture)
        if (enemy) {
          enemy.spawn({}.$extend(enemyData, e, { x: e.x * GAME_AREA_WIDTH, y: e.y * GAME_AREA_HEIGHT }));
          enemy.addChildTo(glLayer);
          enemies.push(enemy);
        }
      });

      // 弾
      passion.Danmaku.setup(this);
    },

    update: function(app) {
      this.gameManager.update(app);
      this._hitTest();
    },

    _hitTest: function() {
      this._hitTestItemPlayer();
      this._hitTestEnemyShot();
      this._hitTestEnemyPlayer();
      this._hitTestBulletPlayer();
    },

    _hitTestItemPlayer: function() {},

    _hitTestEnemyShot: function() {},

    _hitTestEnemyPlayer: function() {},

    _hitTestBulletPlayer: function() {},

    onspawnItem: function(e) {
      var item = e.item;
      item.addChildTo(this.glLayer);
      this.items.push(item);
    },

    onspawnBullet: function(e) {
      var bullet = e.bullet;
      bullet.addChildTo(this.glLayer);
      this.bullets.push(bullet);
    },

  });
});
