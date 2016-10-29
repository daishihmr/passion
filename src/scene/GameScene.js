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
      glLayer.topEffectDrawer.addObjType("bullets_erase", {
        className: "passion.BulletEraseEffect",
        texture: "bullets_erase.png",
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
      glLayer.shotDrawer.objParameters["shot"].pool.forEach(function(shot) {
        shot.on("removed", function() {
          var effect = glLayer.topEffectDrawer.get("bullets_erase");
          if (effect) {
            effect
              .spawn({
                x: this.x,
                y: this.y,
                frameY: 1 / 8,
              })
              .addChildTo(glLayer);
          }
          shots.erase(this);
        });
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
        .forEach(function(textureName) {
          glLayer.enemyDrawer.addObjType(textureName, {
            className: "passion.Enemy",
            texture: textureName,
            count: 50,
          });
          glLayer.enemyDrawer.objParameters[textureName].pool.forEach(function(enemy) {
            enemy.on("removed", function() {
              enemies.erase(this);
            });
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
      var bullets = this.bullets;
      this.on("spawnBullet", function(e) {
        var bullet = e.bullet;
        bullet.addChildTo(glLayer);
        bullets.push(bullet);
      });
      glLayer.bulletDrawer.pool.array.forEach(function(bullet) {
        bullet.on("removed", function() {
          bullets.erase(this);
        });
        bullet.on("erased", function() {
          var effect = glLayer.topEffectDrawer.get("bullets_erase");
          if (effect) {
            effect
              .spawn({
                x: this.x,
                y: this.y,
                frameY: 0,
              })
              .addChildTo(glLayer);
          }
        });
      });
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

    _hitTestEnemyShot: function() {
      var es = this.enemies.clone();
      var ss = this.shots.clone();
      for (var i = 0; i < es.length; i++) {
        var e = es[i];
        for (var j = 0; j < ss.length; j++) {
          var s = ss[j];
          if (e.isHit(s)) {
            e.flare("damage", { shot: s });
            s.flare("hit");
          }
        }
      }
    },

    _hitTestEnemyPlayer: function() {
      var es = this.enemies.clone();
      var p = this.player;
      for (var i = 0; i < es.length; i++) {
        if (es[i].isHit(p)) {
          es[i].remove();
        }
      }
    },

    _hitTestBulletPlayer: function() {
      var bs = this.bullets.clone();
      var p = this.player;
      for (var i = 0; i < bs.length; i++) {
        if (bs[i].isHit(p)) {
          bs[i].remove();
        }
      }
    },

    eraseAllBullets: function() {
      this.bullets.clone().forEach(function(bullet) {
        bullet.flare("erased");
        bullet.remove();
      });
    },

    onspawnItem: function(e) {
      var item = e.item;
      item.addChildTo(this.glLayer);
      this.items.push(item);
    },

  });
});
