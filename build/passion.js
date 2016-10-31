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
  if (location.hostname == "localhost") {
    app.enableStats();
  }
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
        className: "passion.StageAssetLoadScene",
        arguments: { stage: "testStage" },
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
                "bullets.png": "./asset/image/bullets.png",
                "bullets_erase.png": "./asset/image/bullets_erase.png",
                "texture0.png": "./asset/image/texture0.png",
              },
              vertexShader: {
                "bullets.vs": "./asset/shader/bullets.vs",
                "sprites.vs": "./asset/shader/sprites.vs",
              },
              fragmentShader: {
                "bullets.fs": "./asset/shader/bullets.fs",
                "sprites.fs": "./asset/shader/sprites.fs",
              },
              sound: {
                "home": "./asset/sound/nc136160.mp3",
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
        bulletml.Walker.random = function() {
          return gameScene.random.random();
        };

        this.config = {
          target: player,
          createNewBullet: function(runner, spec) {
            var bullet = bulletDrawer.get();
            if (bullet) {
              bullet.spawn(runner, {
                type: spec.type,
                scale: 32,
              });
              gameScene.flare("spawnBullet", { bullet: bullet });
            }
          },
        };

        return this.config;
      },

      createRunner: function(name) {
        var bulletmlDoc = phina.asset.AssetManager.get("xml", name);
        var pattern = bulletml.buildXML(bulletmlDoc.data);
        var config = passion.Danmaku.config;
        return pattern.createRunner(config);
      },
    },

    init: function() {},
  });
  
  phina.asset.AssetLoader.assetLoadFunctions["bulletml"] = phina.asset.AssetLoader.assetLoadFunctions["xml"];

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

    isHit: function(target) {
      if (!this.visible || !target.visible) return false;
      return (this.x - target.x) * (this.x - target.x) + (this.y - target.y) * (this.y - target.y) < 5 * 5;
    },

    _accessor: {
      visible: {
        get: function() {
          return this.instanceData[this.index + 6] == 1;
        },
        set: function(v) {
          this.instanceData[this.index + 6] = v ? 1 : 0;
        },
      },
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

  phina.define("passion.BulletEraseEffect", {
    superClass: "passion.Sprite",

    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
      this.on("enterframe", function(e) {
        if (e.app.ticker.frame % 2 === 0) {
          this.frameX += 1 / 8;
          if (this.frameX >= 1.0) {
            this.remove();
          }
        }
      });
    },

    spawn: function(options) {
      passion.Sprite.prototype.spawn.call(this, {}.$extend(options, {
        frameX: 0,
        frameY: 1 / 8,
        frameW: 1 / 8,
        frameH: 1 / 8,
        scaleX: 64,
        scaleY: 64,
        alpha: 1.0,
      }));
      return this;
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

    motionRunner: null,
    attackRunner: null,

    /**
     * -1: pooling
     * 0: wait (muteki)
     * 1: not entered (muteki)
     * 2: entered
     * 3: killed or removing (muteki)
     * @type {Number}
     */
    status: -1,

    hp: 0,
    active: false,
    hitRadius: 0,

    waitTime: 0,

    bx: 0,
    by: 0,

    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
      this.on("removed", function() {
        // this.clear("everyframe");
        this.clear("damaged");
        this.clear("killed");
        this.tweener.clear();
        this.motionRunner = null;
        this.attackRunner = null;
        this.status = -1;
        this.waitTime = 0;
      });
      this.on("enterframe", function() {
        if (this.status === 0) {
          this.waitTime -= 1;
          if (this.waitTime <= 0) {
            this.status = 1;
          }
          return;
        } else if (this.status === 1) {
          if (this.hitRadius < this.x && this.x < GAME_AREA_WIDTH - this.hitRadius && this.hitRadius < this.y && this.y < GAME_AREA_HEIGHT - this.hitRadius) {
            this.status = 2;
          }
        } else if (this.status === 2 || this.status === 3) {
          if (this.x < -this.hitRadius || GAME_AREA_WIDTH + this.hitRadius < this.x || this.y < -this.hitRadius || GAME_AREA_HEIGHT + this.hitRadius < this.y) {
            this.remove();
            return;
          }
        }

        if (this.motionRunner) {
          this.bx = this.x;
          this.by = this.y;
          this.motionRunner.update();
          this.x = this.motionRunner.x;
          this.y = this.motionRunner.y;
          if (this.rot) {
            this.rotation = this.motionRunner.direction - Math.PI * 0.5;
          }
        }
        if (!this.rot || this.y < passion.Danmaku.config.target.y) {
          if (this.attackRunner) {
            this.attackRunner.x = this.x;
            this.attackRunner.y = this.y;
            this.attackRunner.update();
          }
        }
        // this.flare("everyframe");
      });
    },

    spawn: function(options) {
      // console.log("enemy spawn", options);

      passion.Sprite.prototype.spawn.call(this, options);
      this.hp = options.hp || 0;
      this.hitRadius = options.hitRadius || 24;

      if (options.motion) {
        this.motionRunner = passion.Danmaku.createRunner(options.motion);
        this.motionRunner.x = this.x;
        this.motionRunner.y = this.y;
      }
      if (options.attack) {
        this.attackRunner = passion.Danmaku.createRunner(options.attack);
        this.attackRunner.x = this.x;
        this.attackRunner.y = this.y;
      }

      this.hp = options.hp;
      this.status = 0;
      this.waitTime = options.wait || 0;
      this.rot = options.rot || false;

      this.on("damage", function(e) {
        var shot = e.shot;
        this.hp -= shot.power;
        if (this.hp <= 0) {
          this.flare("killed");
        }
      });
      this.on("killed", function(e) {
        this.remove();
      });

      return this;
    },

    isHit: function(target) {
      if (!target.visible || this.status != 2 || this.hp <= 0) return false;
      return (this.x - target.x) * (this.x - target.x) + (this.y - target.y) * (this.y - target.y) < this.hitRadius * this.hitRadius;
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
    shotDrawer: null,
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
      this.shotDrawer = passion.SpritDrawer(gl, extInstancedArrays, w, h);
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
      this.shotDrawer.update(app);
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
      this.enemyDrawer.render(ou);
      this.shotDrawer.render(ou);
      this.playerDrawer.render(ou);
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
      quality: 0.75,
      // quality: 1.0,
    },
  });

});

phina.namespace(function() {

  phina.define("passion.ParticleEmitter", {
    superClass: "phina.display.Element",

    x: 0,
    y: 0,

    glLayer: null,
    drawer: null,
    objName: null,
    spawnOptions: null,

    genPerFrame: 0,

    init: function(glLayer, drawer, objName, spawnOptions) {
      this.superInit();
      this.glLayer = glLayer;
      this.drawer = drawer;
      this.objName = objName;
      this.spawnOptions = spawnOptions;
    },

    update: function(app) {
      for (var i = 0; i < this.genPerFrame; i++) {
        var p = this.drawer.get(this.objName);
        if (p) {
          p.spawn({}.$extend(this.spawnOptions, {
            x: this.x,
            y: this.y,
          }));
          p.addChildTo(this.glLayer);
        } else {
          break;
        }
      }
    },
  });

  phina.define("passion.Particle", {
    superClass: "passion.Sprite",

    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
      this.on("removed", function() {
        this.clear("enterframe");
        this.tweener.clear();
      });
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
        centerMarker.addChildTo(player);
        centerMarker.on("enterframe", function() {
          this.x = player.x;
          this.y = player.y;
          this.rotation += 0.1;
        });

        return player;
      },
    },

    _roll: 0,
    heat: 0,
    heatByShot: 0,

    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
      this.on("enterframe", function(e) {
        this.controll(e.app);
      });
    },

    spawn: function() {
      passion.Sprite.prototype.spawn.call(this, {
        scaleX: 64,
        scaleY: 64,
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
        this.y = Math.clamp(this.y, 40, GAME_AREA_HEIGHT - 5);
      }

      if (dp.x == 0) {
        this.roll *= 0.9;
        if (-0.01 < this.roll && this.roll < 0.01) {
          this.roll = 0;
        }
      }
      
      if (app.pointers.length > 0 && this.heat <= 0) {
        this.flare("fireShot");
        this.heat = this.heatByShot;
      }

      this.heat -= 1;
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
  
  var SPEED = 20;
  
  phina.define("passion.Shot", {
    superClass: "passion.Sprite",
    
    bx: 0,
    by: 0,
    power: 0,
    
    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
      this.on("enterframe", function(e) {
        this.bx = this.x;
        this.by = this.y;
        this.controll(e.app);
      });
    },
    
    controll: function(app) {},
    
    onhit: function(e) {
      this.remove();
    },
  });

  phina.define("passion.NormalShot", {
    superClass: "passion.Shot",
    
    _static: {
      heatByShot: 6,
      fireCount: 3,
    },
    
    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
      this.power = 1;
    },
    
    spawn: function(player, index) {
      passion.Shot.prototype.spawn.call(this, {
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
  });

  phina.define("passion.WideShot", {
    superClass: "passion.Shot",
    
    _static: {
      heatByShot: 6,
      fireCount: 3,
    },
    
    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
      this.power = 1;
    },
    
    spawn: function(player, index) {
      passion.Shot.prototype.spawn.call(this, {
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
            // visible: false,
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
                visible: false,
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
                visible: false,
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
            x: GAME_AREA_WIDTH * 0.12,
            y: GAME_AREA_HEIGHT * 0.92,
            // y: GAME_AREA_HEIGHT * 1.085,
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

  phina.define("passion.GameSceneBg", {
    _static: {
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
    },

    init: function() {},
  });

});

phina.namespace(function() {

  phina.define("passion.GameManager", {
    superClass: "phina.util.EventDispatcher",

    score: 0,
    highScore: 0,

    frame: 0,
    waitTo: 0,

    timeline: null,

    init: function(stageData) {
      this.superInit();
      this.timeline = stageData.timeline;
      this.waitTo = -1;
    },

    update: function(app) {
      while ((this.waitTo === this.frame || this.waitTo === -1) && this.timeline.length > 0) {
        this.waitTo = -1;
        var task = this.timeline.shift();

        console.log("[task] " + this.frame + " " + task.type);

        this[task.type](task.arguments);
      }

      this.frame += 1;
    },

    startBgm: function(arg) {

    },

    stopBgm: function() {},

    wait: function(arg) {
      this.waitTo = this.frame + arg.time;
    },

    enemy: function(arg) {
      this.flare("spawnEnemy", arg);
    },

    enemyGroup: function(arg) {
      var enemy;
      if (typeof(arg.enemy) == "string") {
        enemy = { name: enemy };
      } else {
        enemy = arg.enemy;
      }
      for (var i = 0; i < arg.count; i++) {
        this.flare("spawnEnemy", {}.$extend(enemy, {
          x: (arg.x || 0) + (arg.dx || 0) * i,
          y: (arg.y || 0) + (arg.dy || 0) * i,
          wait: (arg.wait || 0) + (arg.dwait || 0) * i,
        }));
      }
    },

    warning: function(arg) {},

    boss: function(arg) {},

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
            className: "phina.display.RectangleShape",
            arguments: {
              fill: "black",
              stroke: null,
              width: SCREEN_WIDTH,
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

      var stageName = options.stage;

      var loader = phina.asset.AssetLoader();
      loader.load({
        json: { "stage": "./asset/stage/" + stageName + ".json" }
      });
      this.label.tweener.fadeIn(1000);
      loader.on("load", function() {
        this.step1();
      }.bind(this));

      this.label.text = "step0";
    },

    update: function(app) {
      var t = Math.floor(app.ticker.frame * 0.1) % 4;
      var s = "downloading";
      t.times(function() { s += "." });
      s.paddingRight("downloading".length + 3, " ");
      // this.label.text = s;
    },

    step1: function() {
      var stageData = phina.asset.AssetManager.get("json", "stage").data;
      // console.log(stageData);

      var enemies = {};
      stageData.enemies.forEach(function(enemy) {
        enemies[enemy + ".enemy"] = "./asset/enemy/" + enemy + ".json";
      });

      var loader = phina.asset.AssetLoader();
      loader.load({
        json: enemies,
        sound: { "bgm": "./asset/sound/" + stageData.bgm + ".mp3" },
        image: { "bg": "./asset/image/" + stageData.bg + ".png" },
      });
      loader.on("load", function() {
        this.step2(stageData);
      }.bind(this));

      this.label.text = "step1";
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

      this.label.text = "step2";
    },

    step3: function(stageData) {
      var xmls = {};
      stageData.enemies
        .map(function(enemy) {
          return phina.asset.AssetManager.get("json", enemy + ".enemy").data;
        })
        .forEach(function(enemyData) {
          if (enemyData.motion) {
            xmls[enemyData.motion] = "./asset/bulletml/" + enemyData.motion + ".xml";
          }
          if (enemyData.attack) {
            xmls[enemyData.attack] = "./asset/bulletml/" + enemyData.attack + ".xml";
          }
        });
      stageData.timeline.forEach(function(task) {
        if (task.arguments.motion) {
          xmls[task.arguments.motion] = "./asset/bulletml/" + task.arguments.motion + ".xml";
        }
        if (task.arguments.attack) {
          xmls[task.arguments.attack] = "./asset/bulletml/" + task.arguments.attack + ".xml";
        }
        if (task.arguments.enemy) {
          if (task.arguments.enemy.motion) {
            xmls[task.arguments.enemy.motion] = "./asset/bulletml/" + task.arguments.enemy.motion + ".xml";
          }
          if (task.arguments.enemy.attack) {
            xmls[task.arguments.enemy.attack] = "./asset/bulletml/" + task.arguments.enemy.attack + ".xml";
          }
        }
      });
      
      var loader = phina.asset.AssetLoader();
      loader.load({
        xml: xmls,
      });
      loader.on("load", function() {
        this.label.tweener.clear().fadeOut(100);
        this.bg1.tweener.fadeOut(500).call(function() {
          this.app.popScene();
        }.bind(this));
      }.bind(this));

      this.label.text = "step3";
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
