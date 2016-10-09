var SCREEN_WIDTH = 360;
var SCREEN_HEIGHT = 640;
var GAME_AREA_WIDTH = SCREEN_WIDTH;
var GAME_AREA_HEIGHT = SCREEN_HEIGHT * 0.85;
var FPS = 60;

phina.main(function() {

  phina.display.DisplayScene.defaults.$extend({
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: "transparent",
  });
  
  phina.display.Label.defaults.fontFamily = "main";
  phina.display.Label.defaults.fill = "white";

  var app = passion.Application();
  app.enableStats();
  app.run();

  app.replaceScene(phina.game.ManagerScene({
    scenes: [

      {
        className: "phina.game.LoadingScene",
        arguments: {
          assets: passion.Assets.get({ assetType: "common" }),
        },
      },

      {
        className: "passion.GameScene",
      },

    ]
  }));

});

phina.namespace(function() {

  phina.define("passion.Application", {
    superClass: "phina.display.CanvasApp",

    init: function() {
      this.superInit({
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        backgroundColor: "#114",
      });

      this.fps = FPS;
    },

  });
});

phina.namespace(function() {

  phina.define("passion.Assets", {
    _static: {
      get: function(options) {
        switch (options.assetType) {
          case "common":
            return {
              font: {
                main: "./asset/font/Baumans/Baumans-Regular.ttf",
                message: "./asset/font/YasashisaGothic.ttf",
              },
              image: {
                "test.png": "./asset/image/test.png",
                "test2.png": "./asset/image/test2.png",
                "bg.png": "./asset/image/bg.png",
                "bullets.png": "./asset/image/bullets.png",
                "texture0.png": "./asset/image/texture0.png",
                "enemy1.png": "./asset/image/enemy1.png",
              },
              vertexShader: {
                "bullets.vs": "./asset/shader/bullets.vs",
                "sprites.vs": "./asset/shader/sprites.vs",
              },
              fragmentShader: {
                "bullets.fs": "./asset/shader/bullets.fs",
                "sprites.fs": "./asset/shader/sprites.fs",
              },
              xml: {
                "simple": "./asset/bulletml/simple.bulletml",
                "test": "./asset/bulletml/test.bulletml",
              },
            };
          default:
            throw "invalid assetType: " + options.assetType;
        }
      },
    },
  });

});

phina.namespace(function() {

  phina.define("passion.Camera", {

    position: null,
    vMatrix: null,
    pMatrix: null,
    vpMatrix: null,

    init: function() {
      this.position = vec3.create();
      this.vMatrix = mat4.create();
      this.pMatrix = mat4.create();
      this.vpMatrix = mat4.create();
    },

    setPosition: function(x, y, z) {
      vec3.set(this.position, x, y, z);
      return this;
    },

    lookAt: function(x, y, z) {
      mat4.lookAt(this.vMatrix, this.position, [x, y, z], [0, 1, 0]);
      return this;
    },

    ortho: function(left, right, bottom, top, near, far) {
      mat4.ortho(this.pMatrix, left, right, bottom, top, near, far);
      return this;
    },

    perspective: function(fovy, aspect, near, far) {
      mat4.perspective(this.pMatrix, fovy, aspect, near, far);
      return this;
    },

    calcVpMatrix: function() {
      mat4.mul(this.vpMatrix, this.pMatrix, this.vMatrix);
      return this;
    },

    uniformValues: function() {
      return {
        vpMatrix: this.vpMatrix,
        cameraPosition: this.position,
      };
    }

  });
});

phina.namespace(function() {

  phina.define("passion.Danmaku", {
    _static: {
      config: null,
      setup: function(gameScene) {
        var player = gameScene.player;
        var bullets = gameScene.bullets;
        var enemies = gameScene.enemies;
        var glLayer = gameScene.glLayer;
        var bulletDrawer = glLayer.bulletDrawer;
        var enemyDrawer = glLayer.enemyDrawer;

        this.config = {
          target: player,
          createNewBullet: function(runner, spec) {
            if (spec.missile) {
              var missile = enemyDrawer.get("enemy");
              if (missile) {
                missile.spawn({
                  x: runner.x,
                  y: runner.y,
                  rotation: runner.direction,
                  scaleX: 32,
                  scaleY: 32,
                  frameX: 0,
                  frameY: 0,
                  frameW: 1 / 8,
                  frameH: 1 / 8,
                });
                missile.isMissile = true;
                missile.runner = runner;
                missile.addChildTo(glLayer);
                enemies.push(missile);
              }
            } else {
              var bullet = bulletDrawer.get();
              if (bullet) {
                bullet.spawn(runner, {
                  type: spec.type,
                  scale: 32,
                });
                bullet.addChildTo(glLayer);
                bullets.push(bullet);
              }
            }
          },
        };

        return this.config;
      },
    },

    init: function() {},
  });
});

phina.namespace(function() {

  phina.define("passion.Background", {
    superClass: "passion.Sprite",

    _static: {
      setup: function(glLayer, texture) {
        var texSrc = phina.asset.AssetManager.get("image", texture);
        var height = texSrc.domElement.height * GAME_AREA_WIDTH / texSrc.domElement.width;
        var tex = phina.graphics.Canvas().setSize(512, 512);
        tex.context.drawImage(texSrc.domElement, 0, 0, 512, 512);
        phina.asset.AssetManager.set("image", texture + "_bg", tex);

        glLayer.bgDrawer.addObjType("bg", {
          className: "passion.Background",
          texture: texture + "_bg",
          count: 2,
        });

        var bg1 = glLayer.bgDrawer.get("bg");
        bg1.spawn(height);
        bg1.x = GAME_AREA_WIDTH / 2;
        bg1.y = GAME_AREA_HEIGHT / 2;
        bg1.addChildTo(glLayer);

        var bg2 = glLayer.bgDrawer.get("bg");
        bg2.spawn(height);
        bg2.x = GAME_AREA_WIDTH / 2;
        bg2.y = GAME_AREA_HEIGHT / 2 - height;
        bg2.addChildTo(glLayer);
      },
    },

    height: 0,

    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
      this.on("enterframe", function() {
        this.y += 3;
        if (this.y > GAME_AREA_HEIGHT / 2 + this.height) {
          this.y -= this.height * 2;
        }
      });
    },

    spawn: function(height) {
      this.height = height;
      passion.Sprite.prototype.spawn.call(this, {
        scaleX: GAME_AREA_WIDTH,
        scaleY: this.height,
        frameX: 0,
        frameY: 0,
        frameW: 1,
        frameH: 1,
        red: 0.5,
        green: 0.5,
        blue: 0.5,
      });
      return this;
    },

  });
});

phina.namespace(function() {

  phina.define("passion.Bullet", {
    superClass: "phina.app.Element",

    id: -1,
    instanceData: null,
    runner: null,

    x: 0,
    y: 0,
    age: 0,

    power: 0,

    _active: false,
    
    radius: 20,

    init: function(id, instanceData, instanceStride) {
      this.superInit();
      this.id = id;
      this.instanceData = instanceData;

      this.index = id * instanceStride;
    },

    spawn: function(runner, option) {
      var instanceData = this.instanceData;
      var index = this.index;

      this.runner = runner;
      this.x = runner.x;
      this.y = runner.y;
      this.age = 0;
      instanceData[index + 0] = this.x;
      instanceData[index + 1] = this.y;
      instanceData[index + 2] = runner.direction; // rotation
      instanceData[index + 3] = option.scale; // scale
      instanceData[index + 4] = option.type % 8; // frame.x
      instanceData[index + 5] = ~~(option.type / 8); // frame.y
      instanceData[index + 6] = 1; // visible
      instanceData[index + 7] = 1; // brightness
      instanceData[index + 8] = 0.2 + ~~(option.type / 8) % 2; // auraColor.r
      instanceData[index + 9] = 0.2 + 0; // auraColor.g
      instanceData[index + 10] = 0.2 + ~~(option.type / 8) % 2 + 1; // auraColor.b

      var self = this;
      runner.onVanish = function() {
        self.remove();
      };

      return this;
    },

    activate: function() {
      this._active = true;
      this.flare("activated");
      return this;
    },

    inactivate: function() {
      this._active = false;
      this.flare("inactivated");
      return this;
    },

    onremoved: function() {
      this.instanceData[this.index + 6] = 0;
    },

    update: function(app) {
      var instanceData = this.instanceData;
      var index = this.index;
      var runner = this.runner;

      runner.update();
      this.x = runner.x;
      this.y = runner.y;

      if (this.x < -50 || GAME_AREA_WIDTH + 50 < this.x || this.y < -50 || GAME_AREA_HEIGHT + 50 < this.y) {
        this.remove();
        return;
      }

      instanceData[index + 0] = this.x;
      instanceData[index + 1] = this.y;
      instanceData[index + 7] = 1.5 + Math.sin(this.age * 0.2) * 0.6;

      this.age += 1;
    },

    hitPlayer: function(player) {
      // TODO
      this.remove();
    },
  });

});

phina.namespace(function() {
  phina.define("passion.BulletDrawer", {
    superClass: "phigl.InstancedDrawable",

    instanceData: null,

    pool: null,
    _count: 300,

    init: function(gl, ext, w, h) {
      this.superInit(gl, ext);

      var shader = phigl.Program(gl)
        .attach("bullets.vs")
        .attach("bullets.fs")
        .link();

      this
        .setProgram(shader)
        .setDrawMode(gl.TRIANGLE_STRIP)
        .setIndexValues([0, 1, 2, 3])
        .setAttributes("position", "uv")
        .setAttributeDataArray([{
          unitSize: 2,
          data: [
            //
            -0.5, +0.5,
            //
            +0.5, +0.5,
            //
            -0.5, -0.5,
            //
            +0.5, -0.5,
          ]
        }, {
          unitSize: 2,
          data: [
            //
            0, 32 / 256,
            //
            32 / 256, 32 / 256,
            //
            0, 0,
            //
            32 / 256, 0,
          ]
        }, ])
        .setInstanceAttributes(
          "instancePosition",
          "instanceRotation",
          "instanceScale",
          "instanceFrame",
          "instanceVisible",
          "instanceBrightness",
          "instanceAuraColor"
        )
        .setUniforms(
          "vpMatrix",
          "texture",
          "globalScale"
        );

      var instanceUnit = this.instanceStride / 4;
      
      var texture = phigl.Texture(gl, "bullets.png");

      this.uniforms.texture.setValue(0).setTexture(texture);
      this.uniforms.globalScale.setValue(1.0);

      var instanceData = this.instanceData = [];
      for (var i = 0; i < this._count; i++) {
        instanceData.push(
          // position
          0, 0,
          // rotation
          0,
          // scale
          1,
          // frame
          0, 0,
          // visible
          0,
          // brightness
          0,
          // auraColor
          0, 0, 0
        );
      }
      this.setInstanceAttributeData(instanceData);

      var self = this;
      this.pool = Array.range(0, this._count)
        .map(function(id) {
          return passion.Bullet(id, instanceData, instanceUnit)
            .on("removed", function() {
              self.pool.add(this);
            });
        })
        .toPool(function(lhs, rhs) {
          return lhs.id - rhs.id;
        });
    },

    get: function() {
      return this.pool.get();
    },

    update: function(app) {
      this.setInstanceAttributeData(this.instanceData);
    },

    render: function(uniforms) {
      var gl = this.gl;
      // gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      // gl.disable(gl.DEPTH_TEST);

      this.uniforms.globalScale.value = 1.0;
      if (uniforms) {
        uniforms.forIn(function(key, value) {
          if (this.uniforms[key]) this.uniforms[key].value = value;
        }.bind(this));
      }

      this.draw(this._count);
    },
  });

});

 phina.namespace(function() {

   phina.define("passion.CircleButton", {
     superClass: "phina.display.Shape",

     init: function(options) {
       this.superInit({}.$extend(options, {
         width: options.radius * 2,
         height: options.radius * 2,
       }));

       this.interactive = true;
       this.boundingType = "circle";
       this.radius = options.radius;
       this.backgroundColor = "transparent";
       this.fill = "hsla(190, 100%, 60%, 0.4)";
       this.stroke = "hsla(190, 100%, 60%, 0.9)";
       this.strokeWidth = 2;
       this.fromJSON({
         children: {
           text: {
             className: "phina.display.Label",
             arguments: {
               text: options.text,
               fontSize: options.fontSize || 24,
               // fontWeight: "bold",
               fontFamily: "main",
             },
             fill: "hsla(190, 100%, 95%, 0.8)",
             strokeWidth: 0,
           },
         },
       });
     },

     postrender: function(canvas) {
       var c = canvas.context;

       c.strokeStyle = "hsla(190, 100%, 60%, 0.8)";

       c.beginPath();
       c.arc(0, 0, this.radius * 0.65, 0, Math.PI * 2, false);
       c.lineWidth = 1;
       c.fill();
       c.stroke();

       c.beginPath();
       c.arc(0, 0, this.radius * 0.75, 0, Math.PI * 2, false);
       c.lineWidth = 3;
       c.stroke();

       c.strokeStyle = "hsla(190, 100%, 60%, 0.8)";
       for (var a = 0, b; a < Math.PI * 2;) {
         b = Math.randfloat(1.0, 2.0);
         c.beginPath();
         c.arc(0, 0, this.radius * 0.90, a, a + b, false);
         c.lineWidth = 1;
         c.stroke();
         a += b * 1.5;
       }

       c.strokeStyle = "hsla(190, 100%, 60%, 0.8)";
       for (var a = 0, b; a < Math.PI * 2;) {
         b = Math.randfloat(1.0, 2.0);
         c.beginPath();
         c.arc(0, 0, this.radius * 1.00, a, a + b, false);
         c.lineWidth = 1;
         c.stroke();
         a += b * 1.5;
       }
     },

     onpointstart: function(e) {
       this.scaleX = 1.2;
       this.scaleY = 1.2;
     },

     onpointend: function(e) {
       this.scaleX = 1.0;
       this.scaleY = 1.0;
       if (this.hitTest(e.pointer.x, e.pointer.y)) {
         this.flare("clicked");
       }
     },

   });
 });

phina.namespace(function() {

  phina.define("passion.Enemy", {
    superClass: "passion.Sprite",

    runner: null,

    hp: 0,
    active: false,
    // vs shot
    damageRadius: 0,
    // vs player
    attackRadius: 0,

    isMissile: false,
    isEntered: false,

    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
      this.on("removed", function() {
        this.clear("everyframe");
        this.clear("damaged");
        this.clear("killed");
        this.tweener.clear();
        this.stopAttack();
        this.isMissile = false;
        this.isEntered = false;
      });
      this.on("enterframe", function() {
        if (this.isEntered) {
          if (this.x < -this.damageRadius || GAME_AREA_WIDTH + this.damageRadius < this.x || this.y < -this.damageRadius || GAME_AREA_HEIGHT + this.damageRadius < this.y) {
            this.remove();
            return;
          }
        } else {
          if (this.damageRadius < this.x && this.x < GAME_AREA_WIDTH - this.damageRadius && this.damageRadius < this.y && this.y < GAME_AREA_HEIGHT - this.damageRadius) {
            this.isEntered = true;
          }
        }

        if (this.runner) {
          this.runner.x = this.x;
          this.runner.y = this.y;
          this.runner.update();
          if (this.isMissile) {
            this.x = this.runner.x;
            this.y = this.runner.y;
          }
        }
      });
    },

    spawn: function(options) {
      passion.Sprite.prototype.spawn.call(this, options);
      this.hp = options.hp || 0;
      this.damageRadius = options.damageRadius || 48;
      this.attackRadius = options.attackRadius || 24;
      return this;
    },

    startAttack: function(bulletmlName) {
      var bulletmlDoc = phina.asset.AssetManager.get("xml", bulletmlName);
      var pattern = bulletml.buildXML(bulletmlDoc.data);
      var config = passion.Danmaku.config;
      this.runner = pattern.createRunner(config);
    },

    stopAttack: function() {
      this.runner = null;
    },

  });
});

phina.namespace(function() {

  phina.define("passion.GLLayer", {
    superClass: "phina.display.Layer",

    static: {
      GL_CANVAS: null,
      GL: null,
    },

    renderChildBySelf: true,
    ready: false,

    domElement: null,
    gl: null,

    camera: null,

    bgDrawer: null,
    enemyDrawer: null,
    effectDrawer: null,
    playerDrawer: null,
    bulletDrawer: null,
    topEffectDrawer: null,

    init: function() {
      this.superInit({
        width: GAME_AREA_WIDTH,
        height: GAME_AREA_HEIGHT,
      });
      this.originX = 0;
      this.originY = 0;

      if (passion.GLLayer.GL_CANVAS == null) {
        passion.GLLayer.GL_CANVAS = document.createElement("canvas");
        passion.GLLayer.GL = passion.GLLayer.GL_CANVAS.getContext("webgl");
      }

      this.domElement = passion.GLLayer.GL_CANVAS;
      this.domElement.width = this.width * passion.GLLayer.quality;
      this.domElement.height = this.height * passion.GLLayer.quality;

      var gl = this.gl = passion.GLLayer.GL;
      var extInstancedArrays = phigl.Extensions.getInstancedArrays(gl);

      gl.viewport(0, 0, this.domElement.width, this.domElement.height);
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clearDepth(1.0);
      gl.disable(gl.CULL_FACE);
      gl.enable(gl.BLEND);
      gl.disable(gl.DEPTH_TEST);

      var cw = this.domElement.width;
      var ch = this.domElement.height;
      var w = this.width;
      var h = this.height;
      var sw = Math.pow(2, ~~Math.log2(cw) + 1);
      var sh = Math.pow(2, ~~Math.log2(ch) + 1);

      this.camera = passion.Camera()
        .setPosition(w * 0.5, h * 0.5, 2000)
        .lookAt(w * 0.5, h * 0.5, 0)
        .ortho(-w * 0.5, w * 0.5, h * 0.5, -h * 0.5, 0.1, 3000)
        .calcVpMatrix();

      this.bgDrawer = passion.SpritDrawer(gl, extInstancedArrays, w, h);
      this.enemyDrawer = passion.SpritDrawer(gl, extInstancedArrays, w, h);
      this.effectDrawer = passion.SpritDrawer(gl, extInstancedArrays, w, h);
      this.playerDrawer = passion.SpritDrawer(gl, extInstancedArrays, w, h);
      this.bulletDrawer = passion.BulletDrawer(gl, extInstancedArrays, w, h);
      this.topEffectDrawer = passion.SpritDrawer(gl, extInstancedArrays, w, h);

      this.ready = true;
    },

    update: function(app) {
      if (!this.ready) return;

      this.bgDrawer.update(app);
      this.enemyDrawer.update(app);
      this.effectDrawer.update(app);
      this.playerDrawer.update(app);
      this.bulletDrawer.update(app);
      this.topEffectDrawer.update(app);
    },

    draw: function(canvas) {
      if (!this.ready) return;

      var gl = this.gl;
      var image = this.domElement;
      var cw = image.width;
      var ch = image.height;

      var ou = this.camera.uniformValues();

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      this.bgDrawer.render(ou);
      this.effectDrawer.render(ou);
      this.playerDrawer.render(ou);
      this.enemyDrawer.render(ou);
      this.bulletDrawer.render(ou);
      this.topEffectDrawer.render(ou);

      gl.flush();

      var p = passion.GLLayer.padding;
      canvas.context.drawImage(image,
        0, 0, cw, ch,
        this.width * p, this.height * p, this.width * (1 - p * 2), this.height * (1 - p * 2)
      );
    },

    _static: {
      // padding: 0.1,
      // padding: 0.05,
      padding: 0.01,
      // quality: 0.5,
      // quality: 0.75,
      quality: 1.0,
    },
  });

});

phina.namespace(function() {

  phina.define("passion.Player", {
    superClass: "passion.Sprite",

    _static: {
      setup: function(glLayer) {
        glLayer.playerDrawer.addObjType("player", {
          className: "passion.Player",
          texture: "texture0.png",
        });

        var player = glLayer.playerDrawer.get("player");
        player.spawn();
        player.addChildTo(glLayer);

        player.on("enterframe", function(e) {
          if (e.app.ticker.frame % 2 !== 0) return;

          var hex1 = glLayer.effectDrawer.get("effect");
          var hex2 = glLayer.effectDrawer.get("effect");
          var options = {
            x: player.x - 8,
            y: player.y + 15,
            scaleX: 18,
            scaleY: 18,
            frameX: 7 / 8,
            frameY: 0 / 8,
            frameW: 1 / 8,
            frameH: 1 / 8,
            red: 1.0,
            green: 1.0,
            blue: 1.0,
            alpha: 1.0,
          };
          var oefl = function() {
            this.y += 2;
            this.alpha *= 0.80;
            if (this.alpha < 0.01) {
              this.remove();
            }
          };

          if (hex1) {
            options.x = player.x - 8;
            hex1.spawn(options);
            hex1.onenterframe = oefl;
            hex1.addChildTo(glLayer);
          }

          if (hex2) {
            options.x = player.x + 8;
            hex2.spawn(options);
            hex2.onenterframe = oefl;
            hex2.addChildTo(glLayer);
          }
        });

        var aura = glLayer.effectDrawer.get("effect");
        aura.spawn({
          scaleX: 80,
          scaleY: 80,
          frameX: 0 / 8,
          frameY: 1 / 8,
          frameW: 1 / 8,
          frameH: 1 / 8,
          red: 2.0,
          green: 2.0,
          blue: 2.0,
          alpha: 0.2,
        });
        aura.addChildTo(glLayer);
        aura.on("enterframe", function() {
          this.x = player.x;
          this.y = player.y;
        });

        var centerMarker = glLayer.topEffectDrawer.get("effect");
        centerMarker.spawn({
          scaleX: 14,
          scaleY: 14,
          frameX: 7 / 8,
          frameY: 0 / 8,
          frameW: 1 / 8,
          frameH: 1 / 8,
          red: 0.4,
          green: 2.0,
          blue: 1.6,
          alpha: 1.0,
        });
        centerMarker.addChildTo(glLayer);
        centerMarker.on("enterframe", function() {
          this.x = player.x;
          this.y = player.y;
          this.rotation += 0.1;
        });

        return player;
      },
    },

    _roll: 0,

    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
      this.on("enterframe", function(e) {
        this.controll(e.app);
      });
    },

    spawn: function() {
      passion.Sprite.prototype.spawn.call(this, {
        scaleX: 75,
        scaleY: 75,
        frameX: 3 / 8,
        frameY: 0 / 8,
        frameW: 1 / 8,
        frameH: 1 / 8,
        red: 1.2,
        green: 1.2,
        blue: 1.2,
      });
      this.x = GAME_AREA_WIDTH * 0.5;
      this.y = GAME_AREA_HEIGHT * 0.9;
      return this;
    },

    controll: function(app) {
      var p = app.pointer;
      var dp = p.deltaPosition;

      if (phina.isMobile() || (!phina.isMobile() && p.getPointing())) {
        this.x += dp.x * 2;
        this.y += dp.y * 2;
        if (dp.x < 0) {
          this.roll -= 0.2;
        } else if (0 < dp.x) {
          this.roll += 0.2;
        }

        this.x = Math.clamp(this.x, 5, GAME_AREA_WIDTH - 5);
        this.y = Math.clamp(this.y, 5, GAME_AREA_HEIGHT - 5);
      }

      if (dp.x == 0) {
        this.roll *= 0.9;
        if (-0.01 < this.roll && this.roll < 0.01) {
          this.roll = 0;
        }
      }
    },

    _accessor: {
      roll: {
        get: function() {
          return this._roll;
        },
        set: function(v) {
          this._roll = Math.clamp(v, -3, 3);
          var r = ~~this._roll;
          this.frameX = (r + 3) / 8;
        },
      },
    },

  });
});

phina.namespace(function() {

  phina.define("passion.SpritDrawer", {
    superClass: "phigl.InstancedDrawable",

    objTypes: null,
    objParameters: null,

    init: function(gl, ext, w, h) {
      this.superInit(gl, ext);

      this.objTypes = [];
      this.objParameters = {};

      var shader = phigl.Program(gl)
        .attach("sprites.vs")
        .attach("sprites.fs")
        .link();

      this
        .setProgram(shader)
        .setDrawMode(gl.TRIANGLE_STRIP)
        .setIndexValues([0, 1, 2, 3])
        .setAttributes("position", "uv")
        .setAttributeDataArray([{
          unitSize: 2,
          data: [
            //
            -0.5, +0.5,
            //
            +0.5, +0.5,
            //
            -0.5, -0.5,
            //
            +0.5, -0.5,
          ]
        }, {
          unitSize: 2,
          data: [
            //
            0, 1,
            //
            1, 1,
            //
            0, 0,
            //
            1, 0,
          ]
        }, ])
        .setInstanceAttributes(
          "instanceVisible",
          "instancePosition",
          "instanceRotation",
          "instanceScale",
          "instanceFrame",
          "instanceColor"
        )
        .setUniforms(
          "vpMatrix",
          "texture",
          "globalScale"
        );

      var instanceStride = this.instanceStride / 4;

      this.uniforms.globalScale.setValue(1.0);
    },

    addObjType: function(objName, options) {
      options = {}.$extend({
        className: "passion.Sprite",
        count: 1,
        texture: null,
        additiveBlending: false,
      }, options);

      if (!this.objTypes.contains(objName)) {
        var self = this;
        var instanceStride = this.instanceStride / 4;

        this.objTypes.push(objName);
        var objParameter = this.objParameters[objName] = {
          count: options.count,
          instanceVbo: phigl.Vbo(this.gl, this.gl.DYNAMIC_DRAW),
          texture: phigl.Texture(this.gl, options.texture),
          pool: null,
          additiveBlending: options.additiveBlending,
          instanceData: Array.range(options.count).map(function(i) {
            return [
              // visible
              0,
              // position
              0, 0,
              // rotation
              0,
              // scale
              0, 0,
              // frame
              0, 0, 0, 0,
              // rgba
              0, 0, 0, 0,
            ];
          }).flatten(),
        };

        var ObjClass = phina.using(options.className);
        objParameter.pool = Array.range(options.count).map(function(id) {
          return ObjClass(id, objParameter.instanceData, instanceStride)
            .on("removed", function() {
              objParameter.pool.push(this);
            });
        });
      }
    },

    get: function(objName) {
      return this.objParameters[objName].pool.shift();
    },

    update: function() {},

    render: function(uniforms) {
      if (this.objTypes.length === 0) return;

      var gl = this.gl;
      // gl.enable(gl.BLEND);
      // gl.disable(gl.DEPTH_TEST);

      this.uniforms.globalScale.value = 1.0;

      if (uniforms) {
        uniforms.forIn(function(key, value) {
          if (this.uniforms[key]) this.uniforms[key].value = value;
        }.bind(this));
      }
      var self = this;
      this.objTypes.forEach(function(objName) {
        var objParameter = self.objParameters[objName];

        if (objParameter.additiveBlending) {
          gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        } else {
          gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        }

        self.setInstanceAttributeVbo(
          objParameter.instanceVbo.set(objParameter.instanceData)
        );
        self.uniforms.texture.setValue(0).setTexture(objParameter.texture);
        self.draw(objParameter.count);
      });
    },
  });

});

phina.namespace(function() {

  phina.define("passion.Sprite", {
    superClass: "phina.app.Element",

    id: -1,
    instanceData: null,

    visible: true,

    x: 0,
    y: 0,
    rotation: 0,
    scale: 0,

    frameX: 0,
    frameY: 0,
    frameW: 0,
    frameH: 0,

    red: 1.0,
    green: 1.0,
    blue: 1.0,
    alpha: 1.0,

    age: 0,

    init: function(id, instanceData, instanceStride) {
      this.superInit();
      this.id = id;
      this.instanceData = instanceData;
      this.index = id * instanceStride;
    },

    spawn: function(options) {
      options.$safe({
        visible: true,
        x: 0,
        y: 0,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        frameX: 0,
        frameY: 0,
        frameW: 1 / 8,
        frameH: 1 / 8,
        red: 1.0,
        green: 1.0,
        blue: 1.0,
        alpha: 1.0,
      });

      var index = this.index;
      var instanceData = this.instanceData;

      this.visible = options.visible;
      this.x = options.x;
      this.y = options.y;
      this.rotation = options.rotation;
      this.scaleX = options.scaleX;
      this.scaleY = options.scaleY;
      this.frameX = options.frameX;
      this.frameY = options.frameY;
      this.frameW = options.frameW;
      this.frameH = options.frameH;
      this.red = options.red;
      this.green = options.green;
      this.blue = options.blue;
      this.alpha = options.alpha;

      instanceData[index + 0] = this.visible ? 1 : 0; // visible
      instanceData[index + 1] = this.x; // position.x
      instanceData[index + 2] = this.y; // position.y
      instanceData[index + 3] = this.rotation; // rotation
      instanceData[index + 4] = this.scaleX; // scale
      instanceData[index + 5] = this.scaleY; // scale
      instanceData[index + 6] = this.frameX; // frame.x
      instanceData[index + 7] = this.frameY; // frame.y
      instanceData[index + 8] = this.frameW; // frame.w
      instanceData[index + 9] = this.frameH; // frame.h
      instanceData[index + 10] = this.red; // red
      instanceData[index + 11] = this.green; // green
      instanceData[index + 12] = this.blue; // blue
      instanceData[index + 13] = this.alpha; // alpha

      this.age = 0;

      return this;
    },

    update: function(app) {
      var index = this.index;
      var instanceData = this.instanceData;

      instanceData[index + 0] = this.visible ? 1 : 0; // visible
      instanceData[index + 1] = this.x; // position.x
      instanceData[index + 2] = this.y; // position.y
      instanceData[index + 3] = this.rotation; // rotation
      instanceData[index + 4] = this.scaleX; // scale
      instanceData[index + 5] = this.scaleY; // scale
      instanceData[index + 6] = this.frameX; // frame.x
      instanceData[index + 7] = this.frameY; // frame.y
      instanceData[index + 8] = this.frameW; // frame.w
      instanceData[index + 9] = this.frameH; // frame.h
      instanceData[index + 10] = this.red; // red
      instanceData[index + 11] = this.green; // green
      instanceData[index + 12] = this.blue; // blue
      instanceData[index + 13] = this.alpha; // alpha

      this.age += 1;
    },

    onremoved: function() {
      this.visible = false;
      this.instanceData[this.index + 0] = 0;
    },
  });

});

phina.namespace(function() {

  phina.define("passion.UIFrame", {
    superClass: "phina.display.Shape",

    init: function(options) {
      this.superInit(options);
      this.backgroundColor = "transparent";
      this.strokeWidth = 2;
    },

    prerender: function(canvas) {
      var c = canvas.context;

      c.beginPath();
      c.moveTo(-this.width / 2 + 10, -this.height / 2);
      c.lineTo(this.width / 2 - 5, -this.height / 2);
      c.lineTo(this.width / 2, -this.height / 2 + 5);
      c.lineTo(this.width / 2, this.height / 2 - 10);
      c.lineTo(this.width / 2 - 10, this.height / 2);
      c.lineTo(-this.width / 2 + 35, this.height / 2);
      c.lineTo(-this.width / 2 + 30, this.height / 2 - 5);
      c.lineTo(-this.width / 2, this.height / 2 - 5);
      c.lineTo(-this.width / 2, 10 - this.height / 2);
      c.closePath();

      var sg = c.createLinearGradient(this.height / 2, -this.width / 2, -this.height / 2, this.width / 2);
      sg.addColorStop(0.00, "hsla(190, 100%, 30%, 0.8)");
      sg.addColorStop(0.38, "hsla(190, 100%, 30%, 0.8)");
      sg.addColorStop(0.48, "hsla(190, 100%, 80%, 0.8)");
      sg.addColorStop(0.52, "hsla(190, 100%, 80%, 0.8)");
      sg.addColorStop(0.62, "hsla(190, 100%, 30%, 0.8)");
      sg.addColorStop(1.00, "hsla(190, 100%, 30%, 0.8)");
      this.stroke = sg;

      var fg = c.createLinearGradient(this.height / 2, -this.width / 2, -this.height / 2, this.width / 2);
      fg.addColorStop(0.00, "hsla(210, 100%, 30%, 0.2)");
      fg.addColorStop(0.38, "hsla(210, 100%, 30%, 0.2)");
      fg.addColorStop(0.48, "hsla(210, 100%, 80%, 0.2)");
      fg.addColorStop(0.52, "hsla(210, 100%, 80%, 0.2)");
      fg.addColorStop(0.62, "hsla(210, 100%, 30%, 0.2)");
      fg.addColorStop(1.00, "hsla(210, 100%, 30%, 0.2)");
      this.fill = fg;
    },

    postrender: function(canvas) {
      var c = canvas.context;

      c.beginPath();
      c.moveTo(-this.width / 2 + 10 - 3, -this.height / 2 - 3);
      c.lineTo(this.width / 2 - 5 + 3, -this.height / 2 - 3);
      c.lineTo(this.width / 2 + 3, -this.height / 2 + 5 - 3);
      c.lineTo(this.width / 2 + 3, this.height / 2 - 10 + 3);
      c.lineTo(this.width / 2 - 10 + 3, this.height / 2 + 3);
      c.lineTo(-this.width / 2 + 35 - 3, this.height / 2 + 3);
      c.lineTo(-this.width / 2 + 30 - 3, this.height / 2 - 5 + 3);
      c.lineTo(-this.width / 2 - 3, this.height / 2 - 5 + 3);
      c.lineTo(-this.width / 2 - 3, -this.height / 2 + 10 - 3);
      c.closePath();

      c.lineWidth = 1;
      c.stroke();
    },

  });
});

phina.namespace(function() {

  phina.define("passion.UIHeadLabel", {
    superClass: "phina.display.Shape",

    init: function(options) {
      this.superInit(options);
      this.backgroundColor = "transparent";
      this.stroke = "hsla(190, 100%, 60%, 1.0)";
      this.strokeWidth = 1;
      this.fromJSON({
        children: {
          text: {
            className: "phina.display.Label",
            arguments: {
              text: options.text,
              fontSize: options.fontSize || 24,
              // fontWeight: "bold",
              fontFamily: options.fontFamily || "main",
              align: options.align || "center",
            },
            fill: "hsla(190, 100%, 95%, 0.8)",
            strokeWidth: 0,
          },
        },
      });
    },

    prerender: function(canvas) {
      var c = canvas.context;
      var fg = c.createLinearGradient(0, -this.height / 2, 0, this.height / 2);
      fg.addColorStop(0.00, "hsla(190, 100%, 50%, 0.2)");
      fg.addColorStop(0.40, "hsla(190, 100%, 30%, 0.2)");
      fg.addColorStop(0.60, "hsla(190, 100%, 30%, 0.2)");
      fg.addColorStop(1.00, "hsla(190, 100%, 50%, 0.2)");
      this.fill = fg;
    },

    postrender: function(canvas) {
      var c = canvas.context;

      c.beginPath();
      c.moveTo(-this.width / 2, this.height / 2);
      c.lineTo(-this.width / 2, -this.height / 2 + 10);
      c.lineTo(-this.width / 2 + 10, -this.height / 2);
      c.lineTo(this.width / 2, -this.height / 2);
      c.lineTo(this.width / 2, this.height / 2 - 10);
      c.lineTo(this.width / 2 - 10, this.height / 2);
      c.closePath();
      c.fill();

      c.beginPath();
      c.moveTo(-this.width / 2, this.height / 2);
      c.lineTo(-this.width / 2, -this.height / 2 + 10);
      c.lineTo(-this.width / 2 + 10, -this.height / 2);
      c.stroke();

      c.beginPath();
      c.moveTo(this.width / 2, -this.height / 2);
      c.lineTo(this.width / 2, this.height / 2 - 10);
      c.lineTo(this.width / 2 - 10, this.height / 2);
      c.stroke();
    },

  });
});

phina.namespace(function() {

  phina.define("passion.UIHead2Label", {
    superClass: "phina.display.Shape",

    init: function(options) {
      this.superInit(options);
      this.backgroundColor = "transparent";
      this.strokeWidth = 1;
      this.fromJSON({
        children: {
          text: {
            className: "phina.display.Label",
            arguments: {
              text: options.text,
              fontSize: options.fontSize || 24,
              // fontWeight: "bold",
              fontFamily: options.fontFamily || "main",
              align: options.align || "center",
            },
            fill: "hsla(190, 100%, 95%, 0.8)",
            strokeWidth: 0,
          },
        },
      });
    },

    prerender: function(canvas) {
      var c = canvas.context;

      var fg = c.createLinearGradient(0, -this.height / 2, 0, this.height / 2);
      fg.addColorStop(0.00, "hsla(190, 100%, 50%, 0.2)");
      fg.addColorStop(0.40, "hsla(190, 100%, 30%, 0.2)");
      fg.addColorStop(0.60, "hsla(190, 100%, 30%, 0.2)");
      fg.addColorStop(1.00, "hsla(190, 100%, 50%, 0.2)");
      this.fill = fg;

      var sg = c.createLinearGradient(-this.width / 2, 0, this.width / 2, 0);
      sg.addColorStop(0.00, "hsla(190, 100%, 60%, 0.0)");
      sg.addColorStop(0.30, "hsla(190, 100%, 60%, 1.0)");
      sg.addColorStop(0.70, "hsla(190, 100%, 60%, 1.0)");
      sg.addColorStop(1.00, "hsla(190, 100%, 60%, 0.0)");
      this.stroke = sg;
    },

    postrender: function(canvas) {
      var c = canvas.context;

      c.beginPath();
      c.moveTo(-this.width / 2, this.height / 2);
      c.lineTo(-this.width / 2, -this.height / 2);
      c.lineTo(this.width / 2, -this.height / 2);
      c.lineTo(this.width / 2, this.height / 2);
      c.closePath();
      c.fill();

      c.beginPath();
      c.moveTo(-this.width / 2, this.height / 2);
      c.lineTo(this.width / 2, this.height / 2);
      c.stroke();

      c.beginPath();
      c.moveTo(-this.width / 2, -this.height / 2);
      c.lineTo(this.width / 2, -this.height / 2);
      c.stroke();
    },

  });
});

phina.namespace(function() {

  phina.define("passion.UILayer", {
    superClass: "phina.display.DisplayElement",

    init: function(gameManager) {
      this.superInit();
      this.fromJSON({
        originX: 0,
        originY: 0,
        children: {
          damage: {
            className: "phina.display.Sprite",
            arguments: this.damageTexture(),
            originX: 0,
            originY: 0,
            alpha: 0.0,
            x: GAME_AREA_WIDTH * passion.GLLayer.padding,
            y: GAME_AREA_HEIGHT * passion.GLLayer.padding,
          },
          scoreBg: {
            className: "passion.UIFrame",
            arguments: {
              width: SCREEN_WIDTH * 0.96,
              height: SCREEN_HEIGHT * 0.05,
            },
            x: SCREEN_WIDTH * 0.00,
            y: SCREEN_HEIGHT * 0.00,
            originX: 0,
            originY: 0,
            children: {
              scoreLabel: {
                className: "phina.display.Label",
                arguments: {
                  text: "9,991,234,567,890",
                  align: "right",
                  baseline: "middle",
                  fontSize: SCREEN_HEIGHT * 0.035,
                },
                x: SCREEN_WIDTH * 0.96,
                y: SCREEN_HEIGHT * 0.038,
              },
              hi: {
                className: "phina.display.Label",
                arguments: {
                  text: "HI",
                  align: "left",
                  baseline: "middle",
                  fontSize: SCREEN_HEIGHT * 0.025,
                },
                x: SCREEN_WIDTH * 0.04,
                y: SCREEN_HEIGHT * 0.035,
              },
              highscoreLabel: {
                className: "phina.display.Label",
                arguments: {
                  text: "9,991,234,567,890",
                  align: "right",
                  baseline: "middle",
                  fontSize: SCREEN_HEIGHT * 0.025,
                },
                x: SCREEN_WIDTH * 0.44,
                y: SCREEN_HEIGHT * 0.035,
              },
            },
          },
          bombButton: {
            className: "passion.CircleButton",
            arguments: {
              text: "BOMB",
              fontSize: 15,
              radius: GAME_AREA_WIDTH * 0.09,
            },
            x: GAME_AREA_WIDTH * 0.10,
            y: GAME_AREA_HEIGHT * 0.93,
          },
          messageWindow: {
            className: "passion.UIFrame",
            arguments: {
              width: SCREEN_WIDTH * 0.96,
              height: SCREEN_HEIGHT * 0.14,
            },
            x: SCREEN_WIDTH * 0.0,
            y: SCREEN_HEIGHT * 0.84,
            originX: 0,
            originY: 0,
            children: {
              nameLabel: {
                className: "passion.UIHead2Label",
                arguments: {
                  text: "オペ子",
                  width: SCREEN_WIDTH * 0.30,
                  height: SCREEN_HEIGHT * 0.03,
                  fontSize: 18,
                  fontFamily: "main, message",
                },
                x: SCREEN_WIDTH * 0.20,
                y: SCREEN_HEIGHT * 0.034,
              },
              mesasgeLabel: {
                className: "phina.display.Label",
                arguments: {
                  text: "WARNING!!\n今までにない強大な力が近づいてきます！\n気をつけてください！！",
                  align: "left",
                  baseline: "top",
                  fontSize: 16,
                  lineHeight: 1.1,
                  fontFamily: "main, message",
                },
                x: SCREEN_WIDTH * 0.05,
                y: SCREEN_HEIGHT * 0.076,
              },
            },
          },
          test: {
            className: "phina.display.Sprite",
            arguments: "test2.png",
            x: SCREEN_WIDTH * 1.0,
            y: SCREEN_HEIGHT * 0.84,
            originX: 1,
            originY: 1,
            visible: false,
          },
        },
      });

      var self = this;
      gameManager.on("updateScore", function() {
        self.scoreBg.scoreLabel.text = passion.Utils.sep(this.score);
        if (this.highScore < this.score) {
          self.scoreBg.highscoreLabel.text = passion.Utils.sep(this.highScore);
        }
      });
      gameManager.on("damage", function(e) {});
    },

    damageTexture: function() {
      var c = phina.graphics.Canvas();
      var p = passion.GLLayer.padding;
      c.setSize(GAME_AREA_WIDTH * (1 - p * 2), GAME_AREA_HEIGHT * (1 - p * 2));
      c.clearColor("transparent");
      var g = c.context.createRadialGradient(c.width / 2, c.height / 2, 0, c.width / 2, c.height / 2, c.height / 2)
      g.addColorStop(0, "rgba(255, 0, 0, 0.0)");
      g.addColorStop(1, "rgba(255, 0, 0, 1.0)");
      c.fillStyle = g;
      c.fillRect(0, 0, c.width, c.height);
      return c;
    },

  });
});

phina.namespace(function() {
  
  phina.define("passion.GameManager", {
    superClass: "phina.util.EventDispatcher",
    
    score: 0,
    highScore: 0,
    
    init: function() {
      this.superInit();
    },

  });
});

phina.namespace(function() {

  phina.define("passion.Pool", {

    array: null,
    dirty: null,
    comparator: null,

    init: function(array, comparator) {
      this.array = array || [];
      this.comparator = comparator || function(lhs, rhs) {
        return lhs - rhs;
      };
      this.dirty = true;
    },

    add: function(obj) {
      this.array.push(obj);
      this.dirty = true;
    },

    get: function() {
      if (this.dirty) {
        this.array.sort(this.comparator);
        this.dirty = false;
      }
      return this.array.shift();
    },
  });

  Array.prototype.$method("toPool", function(comparator) {
    return passion.Pool(this, comparator);
  });

});

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

phina.namespace(function() {

  phina.define("passion.Utils", {
    _static: {
      sep: function(num) {
        return ("" + Math.floor(num)).replace(/(\d)(?=(\d{3})+$)/g , '$1,');
      },
    },
    init: function() {},
  });

});

//# sourceMappingURL=passion.js.map
