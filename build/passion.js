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

  phina.asset.SoundManager.volume = 0.05;
  phina.asset.SoundManager.musicVolume = 0.05;

  var app = passion.Application();
  if (location.hostname == "localhost" || location.hostname == "private.dev7.jp") {
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

      this.keyboardEx = passion.Keyboard(document);
      this.keyboardEx.on('keydown', function(e) {
        this.currentScene && this.currentScene.flare('keydown', {
          keyCode: e.keyCode,
        });
      }.bind(this));
      this.keyboardEx.on('keyup', function(e) {
        this.currentScene && this.currentScene.flare('keyup', {
          keyCode: e.keyCode,
        });
      }.bind(this));
      this.keyboardEx.on('keypress', function(e) {
        this.currentScene && this.currentScene.flare('keypress', {
          keyCode: e.keyCode,
        });
      }.bind(this));

      this.gamepadManager = passion.GamepadManager();
    },

    update: function() {
      this.keyboardEx.update();
      this.gamepadManager.update();
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
                "effect.png": "./asset/image/effect.png",
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
                "shot": "./asset/sound/sen_ge_kijuu01.mp3",
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
              bullet.spawn({
                type: spec.type,
                scale: 32,
              });
              bullet.bulletRunning.setRunner(runner);
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
      this.superMethod("spawn", {
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

    x: 0,
    y: 0,
    age: 0,

    power: 0,

    _active: false,

    radius: 20,
    
    _bulletRunning: null,

    init: function(id, instanceData, instanceStride) {
      this.superInit();
      this.id = id;
      this.instanceData = instanceData;

      this.index = id * instanceStride;
    },

    spawn: function(option) {
      var instanceData = this.instanceData;
      var index = this.index;

      this.age = 0;
      this.scale = option.scale;
      this.frameX = option.type % 8;
      this.frameY = ~~(option.type / 8);
      this.visible = true;
      this.brightness = 1;
      this.auraRed = 0.2 + ~~(option.type / 8) % 2;
      this.auraGreen = 0.2 + 0;
      this.auraBlue = 0.2 + ~~(option.type / 8) % 2 + 1;

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
      this.visible = false;
      this.bulletRunning.setRunner(null);
    },

    update: function(app) {
      var instanceData = this.instanceData;
      var index = this.index;

      this.brightness = 1.5 + Math.sin(this.age * 0.2) * 0.6;

      if (this.x < -50 || GAME_AREA_WIDTH + 50 < this.x || this.y < -50 || GAME_AREA_HEIGHT + 50 < this.y) {
        this.remove();
        return;
      }

      this.age += 1;
    },

    isHit: function(target) {
      if (!this.visible || !target.visible) return false;
      return (this.x - target.x) * (this.x - target.x) + (this.y - target.y) * (this.y - target.y) < 5 * 5;
    },

    _accessor: {
      x: {
        get: function() {
          return this.instanceData[this.index + 0];
        },
        set: function(v) {
          this.instanceData[this.index + 0] = v;
        },
      },
      y: {
        get: function() {
          return this.instanceData[this.index + 1];
        },
        set: function(v) {
          this.instanceData[this.index + 1] = v;
        },
      },
      rotation: {
        get: function() {
          return this.instanceData[this.index + 2];
        },
        set: function(v) {
          this.instanceData[this.index + 2] = v;
        },
      },
      scale: {
        get: function() {
          return this.instanceData[this.index + 3];
        },
        set: function(v) {
          this.instanceData[this.index + 3] = v;
        },
      },
      frameX: {
        get: function() {
          return this.instanceData[this.index + 4];
        },
        set: function(v) {
          this.instanceData[this.index + 4] = v;
        },
      },
      frameY: {
        get: function() {
          return this.instanceData[this.index + 5];
        },
        set: function(v) {
          this.instanceData[this.index + 5] = v;
        },
      },
      visible: {
        get: function() {
          return this.instanceData[this.index + 6] == 1;
        },
        set: function(v) {
          this.instanceData[this.index + 6] = v ? 1 : 0;
        },
      },
      brightness: {
        get: function() {
          return this.instanceData[this.index + 7];
        },
        set: function(v) {
          this.instanceData[this.index + 7] = v;
        },
      },
      auraRed: {
        get: function() {
          return this.instanceData[this.index + 8];
        },
        set: function(v) {
          this.instanceData[this.index + 8] = v;
        },
      },
      auraGreen: {
        get: function() {
          return this.instanceData[this.index + 9];
        },
        set: function(v) {
          this.instanceData[this.index + 9] = v;
        },
      },
      auraBlue: {
        get: function() {
          return this.instanceData[this.index + 10];
        },
        set: function(v) {
          this.instanceData[this.index + 10] = v;
        },
      },
    },
  });

  passion.Bullet.prototype.getter("bulletRunning", function() {
    if (!this._bulletRunning) {
      this._bulletRunning = passion.BulletRunning().attachTo(this);
    }
    return this._bulletRunning;
  });

});

phina.namespace(function() {
  phina.define("passion.BulletDrawer", {
    superClass: "phigl.InstancedDrawable",

    instanceData: null,

    pool: null,
    _count: 3000,

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
      this.superMethod("spawn", {}.$extend(options, {
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
    hitRadius: 0,
    expType: null,

    waitTime: 0,

    bx: 0,
    by: 0,

    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);

      this.on("spawned", function() {
        this.status = 0;
      });
      this.on("activated", function() {
        this.status = 1;
      })
      this.on("entered", function() {
        this.status = 2;
      });
      this.on("killed", function(e) {
        this.status = 3;
      });

      this.on("removed", function() {
        this.clear("damaged");
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
            this.flare("activated");
          }
        } else if (this.status === 1) {
          if (this.hitRadius < this.x && this.x < GAME_AREA_WIDTH - this.hitRadius && this.hitRadius < this.y && this.y < GAME_AREA_HEIGHT - this.hitRadius) {
            this.flare("entered");
          }
        } else if (this.status === 2 || this.status === 3) {
          if (this.x < -this.hitRadius || GAME_AREA_WIDTH + this.hitRadius < this.x || this.y < -this.hitRadius || GAME_AREA_HEIGHT + this.hitRadius < this.y) {
            this.remove();
            return;
          }
        }

        if (0 < this.status && this.status < 3) {
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
        }

        if (this.status === 2) {
          if (!this.rot || this.y < passion.Danmaku.config.target.y) {
            if (this.attackRunner) {
              this.attackRunner.x = this.x;
              this.attackRunner.y = this.y;
              this.attackRunner.update();
            }
          }
        }
      });
    },

    spawn: function(options) {
      this.superMethod("spawn", options);
      this.hp = options.hp || 0;
      this.hitRadius = options.hitRadius || 24;
      this.expType = options.expType || "small";

      if (options.motion) {
        this.motionRunner = passion.Danmaku.createRunner("motion/" + options.motion);
        this.motionRunner.x = this.x;
        this.motionRunner.y = this.y;
      }
      if (options.attack) {
        this.attackRunner = passion.Danmaku.createRunner("attack/" + options.attack);
        this.attackRunner.x = this.x;
        this.attackRunner.y = this.y;
      }

      this.hp = options.hp;
      this.waitTime = options.wait || 0;
      this.rot = options.rot || false;

      if (!options.muteki) {
        this.on("damaged", function(e) {
          var shot = e.shot;
          this.hp -= shot.power;
          if (this.hp <= 0) {
            this.flare("killed");
          }
        });
      }

      this.flare("spawned");

      return this;
    },

    playKilledEffect: function(gameScene) {
      switch (this.expType) {
        case "small":
        default:
          this.remove();
          gameScene.flare("spawnParticle", {
            className: "passion.ExplosionSmall",
            x: this.x,
            y: this.y,
          });
          break;
      }
    },

    isHit: function(target) {
      if (!target.visible || this.status != 2 || this.hp <= 0) return false;
      return (this.x - target.x) * (this.x - target.x) + (this.y - target.y) * (this.y - target.y) < this.hitRadius * this.hitRadius;
    },

  });
});

phina.namespace(function() {

  phina.define("passion.ExplosionLarge", {
    superClass: "passion.ParticleEmitter",

    init: function(glLayer, drawer) {
      this.superInit(glLayer, drawer, "particle", {
        frameX: 7 / 8,
        frameY: 0 / 8,
        frameW: 1 / 8,
        frameH: 1 / 8,
        red: 1.0,
        green: 0.8,
        blue: 0.2,
        alpha: 0.8,
        scaleX: 10,
        scaleY: 10,
      });
      
      this.tweener
        .clear()
        .set({
          genPerFrame: 5,
        })
        .to({
          genPerFrame: 0,
        }, 100)
        .call(function() {
          this.remove();
        }.bind(this));
    },
    
    onspawnParticle: function(e) {
      var p = e.particle;
      var dir = Math.random() * Math.PI * 2;
      var dst = Math.randint(2, 25);
      p.tweener
        .clear()
        .to({
          x: p.x + Math.cos(dir) * dst,
          y: p.y + Math.sin(dir) * dst,
          scaleX: 50,
          scaleY: 50,
          green: 0.0,
          blue: 0.0,
          alpha: 0
        }, 400)
        .call(function() {
          this.remove();
        }.bind(p));
    },

  });
});

phina.namespace(function() {

  phina.define("passion.ExplosionSmall", {
    superClass: "passion.ParticleEmitter",

    init: function(glLayer, drawer) {
      this.superInit(glLayer, drawer, "particle", {
        frameX: 7 / 8,
        frameY: 0 / 8,
        frameW: 1 / 8,
        frameH: 1 / 8,
        red: 1.0,
        green: 0.8,
        blue: 0.2,
        alpha: 0.8,
        scaleX: 10,
        scaleY: 10,
      });
      
      this.tweener
        .clear()
        .set({
          genPerFrame: 5,
        })
        .to({
          genPerFrame: 0,
        }, 150)
        .call(function() {
          this.remove();
        }.bind(this));
    },
    
    onspawnParticle: function(e) {
      var p = e.particle;
      var dir = Math.random() * Math.PI * 2;
      var dst = Math.randint(2, 25);
      p.tweener
        .clear()
        .to({
          x: p.x + Math.cos(dir) * dst,
          y: p.y + Math.sin(dir) * dst,
          scaleX: 50,
          scaleY: 50,
          green: 0.0,
          blue: 0.0,
          alpha: 0
        }, 400, "easeOutQuad")
        .call(function() {
          this.remove();
        }.bind(p));
    },

  });
});

phina.namespace(function() {

  phina.define("passion.GLLayer", {
    superClass: "phina.display.Layer",

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
      GL_CANVAS: null,
      GL: null,
      // padding: 0.1,
      // padding: 0.05,
      padding: 0.02,
      // quality: 0.5,
      // quality: 0.75,
      quality: 1.0,
    },
  });

});

phina.namespace(function() {

  var c = 0;

  phina.define("passion.LaserMazzleFlash", {
    superClass: "passion.Sprite",

    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
    },

    spawn: function(options) {
      this.superMethod("spawn", options.$safe({
        frameX: 5 / 8,
        frameY: 1 / 8,
        frameW: 1 / 8,
        frameH: 1 / 8,
        scaleX: 160 + Math.sin(c) * 30,
        scaleY: 160 + Math.sin(c) * 30,
        alpha: 0.1,
        rotation: (-90).toRadian(),
      }));
      this.tweener
        .clear()
        .to({
          alpha: 0
        }, 300)
        .call(function() {
          this.remove();
        }.bind(this));

      c += 0.4;

      return this;
    },

  });
});

phina.namespace(function() {

  phina.define("passion.ParticleEmitter", {
    superClass: "phina.app.Element",

    x: 0,
    y: 0,

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
        var particle = this.drawer.get(this.objName);
        if (particle) {
          particle
            .spawn({}.$extend(this.spawnOptions, {
              x: this.x,
              y: this.y,
            }))
            .addChildTo(this.glLayer);
          this.flare("spawnParticle", { particle: particle });
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
        // this.clear("enterframe");
        this.tweener.clear();
      });
    },

  });

});

phina.namespace(function() {

  phina.define("passion.Player", {
    superClass: "passion.Sprite",

    _static: {
      setup: function(glLayer, spec) {
        glLayer.playerDrawer.addObjType("player", {
          className: "passion.Player",
          texture: "texture0.png",
        });

        var player = glLayer.playerDrawer.get("player");
        player.spawn(spec);

        player.on("enterframe", function(e) {
          if (e.app.ticker.frame % 2 !== 0) return;

          var hex1 = glLayer.effectDrawer.get("particle");
          var hex2 = glLayer.effectDrawer.get("particle");
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

        var aura = glLayer.effectDrawer.get("particle");
        aura.spawn({
          x: player.x,
          y: player.y,
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

        var centerMarker = glLayer.topEffectDrawer.get("particle");
        centerMarker.spawn({
          x: player.x,
          y: player.y,
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
    
    hp: 0,

    _roll: 0,
    heat: 0,
    heatByShot: 0,

    fireable: true,
    controllable: true,
    mutekiTime: 0,

    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
      this.on("enterframe", function(e) {
        this.controll(e.app);
        if (this.mutekiTime > 0) this.mutekiTime -= 1;
      });
    },

    spawn: function(spec) {
      this.superMethod("spawn", {
        x: GAME_AREA_WIDTH * 0.5,
        y: GAME_AREA_HEIGHT * 0.9,
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
      
      this.hp = spec.hp;

      return this;
    },

    controll: function(app) {
      if (this.controllable) {
        var p = app.pointer;
        var dp = p.deltaPosition;

        if (phina.isMobile() || p.getPointing()) {
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
      }

      if (!this.controllable || dp.x == 0) {
        this.roll *= 0.9;
        if (-0.01 < this.roll && this.roll < 0.01) {
          this.roll = 0;
        }
      }

      if (this.fireable) {
        var touch = (!phina.isMobile() && p.getPointing()) || (phina.isMobile() && app.pointers.length > 0);
        if (touch && this.heat <= 0) {
          this.flare("fireShot");
          this.heat = this.heatByShot;
        }
      }

      this.heat -= 1;
    },

    ondamaged: function(e) {
      if (this.mutekiTime > 0) return;

      var another = e.another;
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

  var commonSetup = function(shotClassName, glLayer, player, shots, gameScene) {
    var ShotClass = this;
    glLayer.shotDrawer.addObjType("shot", {
      className: shotClassName,
      texture: ShotClass.texture || "bullets.png",
      additiveBlending: ShotClass.additiveBlending || false,
      count: ShotClass.count || 9,
    });

    // 着弾エフェクト
    if (ShotClass.hitEffect) {
      glLayer.topEffectDrawer.addObjType("hitEffect", ShotClass.hitEffect);
    }

    // 発射口エフェクト
    if (ShotClass.mazzleFlashEffect) {
      glLayer.effectDrawer.addObjType("mazzleFlashEffect", ShotClass.mazzleFlashEffect);
    }

    var shotPool = glLayer.shotDrawer.objParameters["shot"].pool;
    player.heatByShot = ShotClass.heatByShot;
    player.on("fireShot", function(e) {
      if (shotPool.length >= ShotClass.fireCount) {
        for (var i = 0; i < ShotClass.fireCount; i++) {
          var s = glLayer.shotDrawer.get("shot");
          if (s) {
            s.spawn(this, i, gameScene).addChildTo(glLayer);
            shots.push(s);
          }
        }
        // TODO 効果音
        // phina.asset.SoundManager.play("shot");
      }
    });

    shotPool.forEach(function(shot) {
      if (ShotClass.hitEffect) {
        shot.on("hit", function() {
          var effect = glLayer.topEffectDrawer.get("hitEffect");
          if (effect) {
            effect
              .spawn({
                x: this.x,
                y: this.y,
              })
              .addChildTo(glLayer);
          }
        });
      }
      shot.on("removed", function() {
        shots.erase(this);
      });
    });

    if (ShotClass.mazzleFlashEffect) {
      player.on("fireShot", function(e) {
        var effect = glLayer.effectDrawer.get("mazzleFlashEffect");
        if (effect) {
          effect
            .spawn({
              x: this.x,
              y: this.y - 30,
            })
            .addChildTo(glLayer);
        }
      });
    }
  };

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
      setup: commonSetup,
      count: 9,
      heatByShot: 8,
      fireCount: 3,
      additiveBlending: false,
      hitEffect: {
        className: "passion.BulletEraseEffect",
        texture: "bullets_erase.png",
        count: 9,
      },
    },

    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
      this.power = 1;
    },

    spawn: function(player, index, gameScene) {
      this.superMethod("spawn", {
        x: player.x + [-1, 1, 0][index] * 10,
        y: player.y - 30 + [0, 0, -1][index] * 10,
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

  phina.define("passion.NormalShot2", {
    superClass: "passion.Shot",

    _static: {
      setup: commonSetup,
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

  phina.define("passion.WideShot", {
    superClass: "passion.Shot",

    _static: {
      setup: commonSetup,
      count: 9,
      heatByShot: 6,
      fireCount: 3,
      additiveBlending: false,
      hitEffect: {
        className: "passion.BulletEraseEffect",
        texture: "bullets_erase.png",
        count: 9,
      },
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

      this.dx = Math.cos(this.rotation) * 20;
      this.dy = Math.sin(this.rotation) * 20;
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
      setup: commonSetup,
      count: 27,
      heatByShot: 6,
      fireCount: 9,
      additiveBlending: false,
      hitEffect: {
        className: "passion.BulletEraseEffect",
        texture: "bullets_erase.png",
        count: 27,
      },
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

      this.dx = Math.cos(this.rotation) * 20;
      this.dy = Math.sin(this.rotation) * 20;
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
      setup: commonSetup,
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
      }
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

    age: 0,

    _bulletRunning: null,

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

      // var index = this.index;
      // var instanceData = this.instanceData;

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

      this.age = 0;

      return this;
    },

    update: function(app) {
      this.age += 1;
    },

    onremoved: function() {
      this.visible = false;
      this.bulletRunning.setRunner(null);
      this.tweener.clear();
    },

    _accessor: {
      visible: {
        get: function() {
          return this.instanceData[this.index + 0] === 1;
        },
        set: function(v) {
          this.instanceData[this.index + 0] = v ? 1 : 0;
        },
      },
      x: {
        get: function() {
          return this.instanceData[this.index + 1];
        },
        set: function(v) {
          this.instanceData[this.index + 1] = v;
        },
      },
      y: {
        get: function() {
          return this.instanceData[this.index + 2];
        },
        set: function(v) {
          this.instanceData[this.index + 2] = v;
        },
      },
      rotation: {
        get: function() {
          return this.instanceData[this.index + 3];
        },
        set: function(v) {
          this.instanceData[this.index + 3] = v;
        },
      },
      scaleX: {
        get: function() {
          return this.instanceData[this.index + 4];
        },
        set: function(v) {
          this.instanceData[this.index + 4] = v;
        },
      },
      scaleY: {
        get: function() {
          return this.instanceData[this.index + 5];
        },
        set: function(v) {
          this.instanceData[this.index + 5] = v;
        },
      },
      frameX: {
        get: function() {
          return this.instanceData[this.index + 6];
        },
        set: function(v) {
          this.instanceData[this.index + 6] = v;
        },
      },
      frameY: {
        get: function() {
          return this.instanceData[this.index + 7];
        },
        set: function(v) {
          this.instanceData[this.index + 7] = v;
        },
      },
      frameW: {
        get: function() {
          return this.instanceData[this.index + 8];
        },
        set: function(v) {
          this.instanceData[this.index + 8] = v;
        },
      },
      frameH: {
        get: function() {
          return this.instanceData[this.index + 9];
        },
        set: function(v) {
          this.instanceData[this.index + 9] = v;
        },
      },
      red: {
        get: function() {
          return this.instanceData[this.index + 10];
        },
        set: function(v) {
          this.instanceData[this.index + 10] = v;
        },
      },
      green: {
        get: function() {
          return this.instanceData[this.index + 11];
        },
        set: function(v) {
          this.instanceData[this.index + 11] = v;
        },
      },
      blue: {
        get: function() {
          return this.instanceData[this.index + 12];
        },
        set: function(v) {
          this.instanceData[this.index + 12] = v;
        },
      },
      alpha: {
        get: function() {
          return this.instanceData[this.index + 13];
        },
        set: function(v) {
          this.instanceData[this.index + 13] = v;
        },
      },
    },
  });

  passion.Sprite.prototype.getter("bulletRunning", function() {
    if (!this._bulletRunning) {
      this._bulletRunning = passion.BulletRunning().attachTo(this);
    }
    return this._bulletRunning;
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
              text: "HYPER",
              fontSize: 15,
              radius: GAME_AREA_WIDTH * 0.09,
            },
            x: GAME_AREA_WIDTH * 0.12,
            y: GAME_AREA_HEIGHT * 0.92,
          },
          readyLabels: {
            className: "phina.display.DisplayElement",
            x: GAME_AREA_WIDTH * 0.5,
            y: GAME_AREA_HEIGHT * 0.5,
            children: "Ready".split("").map(function(c, i) {
              return {
                className: "phina.display.Label",
                arguments: {
                  text: c,
                  align: "center",
                  baseline: "middle",
                  fontSize: 60,
                },
                x: ("Ready".length * -0.5 + i + 0.5) * 60 * 0.56,
              };
            }),
            visible: false,
          },
          goLabel: {
            className: "phina.display.Label",
            arguments: {
              text: "GO!!",
              align: "center",
              baseline: "middle",
              fontSize: 60,
            },
            x: GAME_AREA_WIDTH * 0.5,
            y: GAME_AREA_HEIGHT * 0.5,
            visible: false,
          }
        },
      });

      var self = this;
      gameManager.on("updateScore", function() {
        self.scoreBg.scoreLabel.text = passion.Utils.sep(this.score);
        if (this.highScore < this.score) {
          self.scoreBg.highscoreLabel.text = passion.Utils.sep(this.highScore);
        }
      });
      gameManager.on("damaged", function(e) {});
    },

    showReadyGo: function(callback) {
      this.readyLabels.visible = true;
      this.goLabel.visible = true;

      this.readyLabels.children.forEach(function(label, i) {
        label.tweener
          .set({
            scaleX: 4,
            scaleY: 4,
            alpha: 0,
          })
          .wait(i * 200)
          .to({
            scaleX: 1,
            scaleY: 1,
            alpha: 1
          }, 200)
          .wait(500 + ("Ready".length - i) * 200)
          .to({
            scaleX: 0,
            scaleY: 0,
            alpha: 0,
          }, 100);
      });
      this.goLabel.tweener
        .set({
          scaleX: 0,
          scaleY: 0,
          alpha: 0,
        })
        .wait(900 + "Ready".length * 200)
        .to({
          scaleX: 1,
          scaleY: 1,
          alpha: 1
        }, 200)
        .wait(500)
        .to({
          scaleX: 5,
          scaleY: 5,
          alpha: 0,
        }, 200)
        .call(function() {
          this.readyLabels.visible = false;
          this.goLabel.visible = false;
          callback();
        }.bind(this));
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

  phina.define("passion.BulletRunning", {
    superClass: "phina.accessory.Accessory",

    runner: null,

    init: function() {
      this.superInit();
    },
    
    setRunner: function(runner) {
      this.runner = runner;
      return this;
    },

    onattached: function() {
      if (this.runner) {
        this.target.x = this.runner.x;
        this.target.y = this.runner.y;
        this.target.rotation = this.runner.direction;
        this.runner.onVanish = function() {
          this.remove();
        }.bind(this.target);
      }
    },

    update: function(app) {
      if (this.runner) {
        this.runner.update();
        this.target.x = this.runner.x;
        this.target.y = this.runner.y;
        this.target.rotation = this.runner.direction;
      }
    },

  });
});

phina.namespace(function() {

  phina.define("passion.GamepadManager", {
    superClass: "phina.input.GamepadManager",

    init: function() {
      this.superInit();
    },

    get: function(index) {
      index = index || 0;

      if (!this.gamepads[index]) {
        this._created.push(index);
        this.gamepads[index] = passion.Gamepad(index);
      }

      return this.gamepads[index];
    },

  });

  phina.define("passion.Gamepad", {
    superClass: "phina.input.Gamepad",

    beforeStickX: 0,
    beforeStickY: 0,

    _leftCount: 0,
    _rightCount: 0,
    _upCount: 0,
    _downCount: 0,

    init: function(index) {
      this.superInit(index);
    },

    _updateState: function(gamepad) {
      this.superMethod("_updateState", gamepad);
      this._updateEvery();
    },
    _updateStateEmpty: function() {
      this.superMethod("_updateStateEmpty");
      this._updateEvery();
    },

    _updateEvery: function() {
      var stick = this.getStickDirection();

      if (this.getKeyUp("left") || this.beforeStickX < -0.5 && -0.5 <= stick.x) {
        this._leftCount = 0;
      } else if (this.getKey("left") || stick.x < -0.5) {
        this._leftCount += 1;
      }
      if (this.getKeyUp("right") || 0.5 < this.beforeStickX && stick.x <= 0.5) {
        this._rightCount = 0;
      } else if (this.getKey("right") || 0.5 < stick.x) {
        this._rightCount += 1;
      }
      if (this.getKeyUp("up") || this.beforeStickY < -0.5 && -0.5 <= stick.y) {
        this._upCount = 0;
      } else if (this.getKey("up") || stick.y < -0.5) {
        this._upCount += 1;
      }
      if (this.getKeyUp("down") || 0.5 < this.beforeStickY && stick.y <= 0.5) {
        this._downCount = 0;
      } else if (this.getKey("down") || 0.5 < stick.y) {
        this._downCount += 1;
      }

      this.beforeStickX = stick.x;
      this.beforeStickY = stick.y;
    },

    _accessor: {
      leftPressing: {
        get: function() {
          var count = this._leftCount;
          var current = this.getKey("left") || this.getStickDirection().x < -0.5;
          return current && (count == 1 || (40 < count && count % 6 == 0));
        }
      },
      rightPressing: {
        get: function() {
          var count = this._rightCount;
          var current = this.getKey("right") || 0.5 < this.getStickDirection().x;
          return current && (count == 1 || (40 < count && count % 6 == 0));
        }
      },
      upPressing: {
        get: function() {
          var count = this._upCount;
          var current = this.getKey("up") || this.getStickDirection().y < -0.5;
          return current && (count == 1 || (40 < count && count % 6 == 0));
        }
      },
      downPressing: {
        get: function() {
          var count = this._downCount;
          var current = this.getKey("down") || 0.5 < this.getStickDirection().y;
          return current && (count == 1 || (40 < count && count % 6 == 0));
        }
      },
    }

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

  phina.define("passion.Keyboard", {
    superClass: "phina.input.Keyboard",

    _leftCount: 0,
    _rightCount: 0,
    _upCount: 0,
    _downCount: 0,

    init: function(domElement) {
      this.superInit(domElement);
    },

    update: function() {
      this.superMethod("update");

      if (this.getKeyUp("left")) {
        this._leftCount = 0;
      } else if (this.getKey("left")) {
        this._leftCount += 1;
      }
      if (this.getKeyUp("right")) {
        this._rightCount = 0;
      } else if (this.getKey("right")) {
        this._rightCount += 1;
      }
      if (this.getKeyUp("up")) {
        this._upCount = 0;
      } else if (this.getKey("up")) {
        this._upCount += 1;
      }
      if (this.getKeyUp("down")) {
        this._downCount = 0;
      } else if (this.getKey("down")) {
        this._downCount += 1;
      }
    },

    _accessor: {
      leftPressing: {
        get: function() {
          var count = this._leftCount;
          var current = this.getKey("left");
          return current && (count == 1 || (40 < count && count % 6 == 0));
        }
      },
      rightPressing: {
        get: function() {
          var count = this._rightCount;
          var current = this.getKey("right");
          return current && (count == 1 || (40 < count && count % 6 == 0));
        }
      },
      upPressing: {
        get: function() {
          var count = this._upCount;
          var current = this.getKey("up");
          return current && (count == 1 || (40 < count && count % 6 == 0));
        }
      },
      downPressing: {
        get: function() {
          var count = this._downCount;
          var current = this.getKey("down");
          return current && (count == 1 || (40 < count && count % 6 == 0));
        }
      },
    },
    
    _static: phina.input.Keyboard._static,

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

    init: function(stageData, random) {
      this.superInit();
      this.timeline = stageData.timeline;
      this.waitTo = -1;
    },

    update: function(app) {
      while ((this.waitTo === this.frame || this.waitTo === -1) && this.timeline.length > 0) {
        this.waitTo = -1;
        var task = this.timeline.shift();

        // console.log("[task] " + this.frame + " " + task.type);

        this[task.type](task.arguments);
      }

      this.frame += 1;
    },

    startBgm: function(arg) {
      // var music = phina.asset.SoundManager.playMusic("bgm" + arg.bgm, 0, true);
      // if (arg.loopEnd) {
      //   music.loopStart = arg.loopStart;
      //   music.loopEnd = arg.loopEnd;
      // }
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

    gameManager: null,
    status: -1,

    shots: null,
    enemies: null,
    bullets: null,
    items: null,

    init: function(options) {
      this.superInit(options);

      var gameScene = this;
      var stageData = phina.asset.AssetManager.get("json", "stage").data;

      var r = phina.util.Random(12345);
      var randomFunc = function() {
        return r.random();
      };
      bulletml.Walker.random = randomFunc;

      this.gameManager = passion.GameManager(stageData, randomFunc);

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

      glLayer.effectDrawer.addObjType("particle", {
        texture: "texture0.png",
        additiveBlending: true,
        count: 200,
      });
      glLayer.topEffectDrawer.addObjType("BulletEraseEffect", {
        className: "passion.BulletEraseEffect",
        texture: "bullets_erase.png",
        count: 200,
      });
      glLayer.topEffectDrawer.addObjType("particle", {
        className: "passion.Particle",
        texture: "texture0.png",
        count: 200,
        additiveBlending: true,
      });

      // 背景
      passion.Background.setup(glLayer, "bg", 1069);

      // 自機
      var playerSpec = {
        hp: 100,
      };
      this.player = passion.Player.setup(glLayer, playerSpec).addChildTo(glLayer);

      // ショット
      var shotClassName = "passion.Laser";
      var ShotClass = phina.using(shotClassName);
      ShotClass.setup(shotClassName, glLayer, this.player, this.shots, gameScene);

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
            enemy.on("killed", function() {
              this.playKilledEffect(gameScene);
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
          var effect = glLayer.topEffectDrawer.get("BulletEraseEffect");
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

      this.uiLayer.showReadyGo(function() {
        gameScene.status = 0;
      });
    },

    update: function(app) {
      switch (this.status) {
        case 0:
          this.gameManager.update(app);
          this._hitTest();
          break;
      }

      var kb = app.keyboardEx;
      var gp = app.gamepadManager.get();
      if (gp.leftPressing || kb.leftPressing) console.log("left" + Date.now());
      if (gp.rightPressing || kb.rightPressing) console.log("right" + Date.now());
      if (gp.upPressing || kb.upPressing) console.log("up" + Date.now());
      if (gp.downPressing || kb.downPressing) console.log("down" + Date.now());
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
            e.flare("damaged", { shot: s });
            s.flare("hit", { enemy: e });
          }
        }
      }
    },

    _hitTestEnemyPlayer: function() {
      var es = this.enemies.clone();
      var p = this.player;
      for (var i = 0; i < es.length; i++) {
        var e = es[i];
        if (e.isHit(p)) {
          p.flare("damaged", { another: e });
        }
      }
    },

    _hitTestBulletPlayer: function() {
      var bs = this.bullets.clone();
      var p = this.player;
      for (var i = 0; i < bs.length; i++) {
        var b = bs[i];
        if (b.isHit(p)) {
          p.flare("damaged", { another: b });
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

    onspawnParticle: function(e) {
      var EmitterClass = phina.using(e.className);
      var emitter = EmitterClass(this.glLayer, this.glLayer.topEffectDrawer);
      emitter.x = e.x;
      emitter.y = e.y;
      emitter.addChildTo(this.glLayer);
    }

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

phina.namespace(function() {

  phina.define("passion.Utils", {
    _static: {
      sep: function(num) {
        return ("" + Math.floor(num)).replace(/(\d)(?=(\d{3})+$)/g , '$1,');
      },
    },
    init: function() {},
  });
  
  phina.accessory.Tweener.$method("clone", function() {
    return phina.accessory.Tweener(this.target);
  });

});

//# sourceMappingURL=passion.js.map
