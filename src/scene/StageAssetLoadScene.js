phina.namespace(function() {

  phina.define("passion.StageAssetLoadScene", {
    superClass: "phina.display.DisplayScene",

    init: function(options) {
      this.superInit(options);

      this.fromJSON({
        children: {
          bg0: {
            className: "phina.display.Sprite",
            arguments: passion.GameSceneBg.drawBgTexture(),
            originX: 0,
            originY: 0,
          },
          bg1: {
            className: "passion.UIFrame",
            arguments: {
              fill: "black",
              stroke: null,
              width: SCREEN_WIDTH * 0.9,
              height: SCREEN_HEIGHT * 0.1,
            },
            x: SCREEN_WIDTH * 0.5,
            y: SCREEN_HEIGHT * 0.5,
          },
          label: {
            className: "phina.display.Label",
            arguments: {
              text: "",
            },
            x: SCREEN_WIDTH * 0.5,
            y: SCREEN_HEIGHT * 0.5,
            alpha: 0,
          },
        },
      });

      this.step0(options.stage);
    },

    update: function(app) {
      var t = Math.floor(app.ticker.frame * 0.1) % 4;
      var s = "downloading";
      t.times(function() { s += "." });
      s.paddingRight("downloading".length + 3, " ");
      this.label.text = s;
    },

    step0: function(stageName) {
      var loader = phina.asset.AssetLoader();
      loader.load({
        json: { "stage": "./asset/stage/" + stageName + ".json" }
      });
      this.label.tweener.fadeIn(1000);
      loader.on("load", function() {
        this.step1();
      }.bind(this));

      // this.label.text = "step0";
    },

    step1: function() {
      var stageData = phina.asset.AssetManager.get("json", "stage").data;
      // console.log(stageData);

      var enemies = {};
      stageData.enemies.forEach(function(enemy) {
        enemies[enemy + ".enemy"] = "./asset/enemy/" + enemy + ".json";
      });
      
      var sounds = {};
      stageData.bgm.forEach(function(b, idx) {
        sounds["bgm" + idx] = "./asset/sound/" + b.bgm + ".mp3";
      });

      var loader = phina.asset.AssetLoader();
      loader.load({
        json: enemies,
        sound: sounds,
        image: { "bg": "./asset/image/" + stageData.bg + ".png" },
      });
      loader.on("load", function() {
        this.step2(stageData);
      }.bind(this));

      // this.label.text = "step1";
    },

    step2: function(stageData) {
      var textures = {};
      stageData.enemies
        .map(function(enemy) {
          return phina.asset.AssetManager.get("json", enemy + ".enemy").data;
        })
        .map(function(enemyData) {
          // console.log(enemyData);
          return enemyData.texture;
        })
        .uniq()
        .forEach(function(texture) {
          textures[texture] = "./asset/image/" + texture + ".png";
        });

      var loader = phina.asset.AssetLoader();
      loader.load({
        image: textures,
      });
      loader.on("load", function() {
        this.step3(stageData);
      }.bind(this));

      // this.label.text = "step2";
    },

    step3: function(stageData) {
      var xmls = {};
      stageData.enemies
        .map(function(enemy) {
          return phina.asset.AssetManager.get("json", enemy + ".enemy").data;
        })
        .forEach(function(enemyData) {
          if (enemyData.motion) {
            xmls["motion/" + enemyData.motion] = "./asset/motion/" + enemyData.motion + ".xml";
          }
          if (enemyData.attack) {
            xmls["attack/" + enemyData.attack] = "./asset/attack/" + enemyData.attack + ".xml";
          }
        });
      stageData.timeline.forEach(function(task) {
        if (task.arguments.motion) {
          xmls["motion/" + task.arguments.motion] = "./asset/motion/" + task.arguments.motion + ".xml";
        }
        if (task.arguments.attack) {
          xmls["attack/" + task.arguments.attack] = "./asset/attack/" + task.arguments.attack + ".xml";
        }
        if (task.arguments.enemy) {
          if (task.arguments.enemy.motion) {
            xmls["motion/" + task.arguments.enemy.motion] = "./asset/motion/" + task.arguments.enemy.motion + ".xml";
          }
          if (task.arguments.enemy.attack) {
            xmls["attack/" + task.arguments.enemy.attack] = "./asset/attack/" + task.arguments.enemy.attack + ".xml";
          }
        }
      });

      var loader = phina.asset.AssetLoader();
      loader.load({
        xml: xmls,
      });
      loader.on("load", function() {
        this.step4();
      }.bind(this));

      // this.label.text = "step3";
    },

    step4: function() {
      this.label.tweener.clear().fadeOut(100);
      this.bg1.tweener.fadeOut(500).call(function() {
        this.app.popScene();
      }.bind(this));
    },

  });
});
