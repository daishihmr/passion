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
    // vs shot
    damageRadius: 0,
    // vs player
    attackRadius: 0,

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
          if (this.damageRadius < this.x && this.x < GAME_AREA_WIDTH - this.damageRadius && this.damageRadius < this.y && this.y < GAME_AREA_HEIGHT - this.damageRadius) {
            this.status = 2;
          }
        } else if (this.status === 2 || this.status === 3) {
          if (this.x < -this.damageRadius || GAME_AREA_WIDTH + this.damageRadius < this.x || this.y < -this.damageRadius || GAME_AREA_HEIGHT + this.damageRadius < this.y) {
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
          this.rotation = this.moveRunner.direction - Math.PI * 0.5;
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
      this.damageRadius = options.damageRadius || 48;
      this.attackRadius = options.attackRadius || 24;

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

      this.status = 0;
      this.waitTime = options.wait || 0;

      return this;
    },

  });
});
