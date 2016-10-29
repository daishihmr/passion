phina.namespace(function() {

  phina.define("passion.Enemy", {
    superClass: "passion.Sprite",

    moveRunner: null,
    bulletRunner: null,

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
        this.moveRunner = null;
        this.bulletRunner = null;
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

        if (this.moveRunner) {
          this.bx = this.x;
          this.by = this.y;
          this.moveRunner.update();
          this.x = this.moveRunner.x;
          this.y = this.moveRunner.y;
          if (this.rot) {
            this.rotation = this.moveRunner.direction - Math.PI * 0.5;
          }
        }
        if (this.bulletRunner) {
          this.bulletRunner.x = this.x;
          this.bulletRunner.y = this.y;
          this.bulletRunner.update();
        }
        // this.flare("everyframe");
      });
    },

    spawn: function(options) {
      // console.log("enemy spawn", options);

      passion.Sprite.prototype.spawn.call(this, options);
      this.hp = options.hp || 0;
      this.hitRadius = options.hitRadius || 24;

      if (options.moveRunner) {
        this.moveRunner = passion.Danmaku.createRunner(options.moveRunner);
        this.moveRunner.x = this.x;
        this.moveRunner.y = this.y;
      }
      if (options.bulletRunner) {
        this.bulletRunner = passion.Danmaku.createRunner(options.bulletRunner);
        this.bulletRunner.x = this.x;
        this.bulletRunner.y = this.y;
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
