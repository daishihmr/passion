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
