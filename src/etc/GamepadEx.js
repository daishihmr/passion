phina.namespace(() => {

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
      const stick = this.getStickDirection();

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
          const count = this._leftCount;
          const current = this.getKey("left") || this.getStickDirection().x < -0.5;
          return current && (count == 1 || (40 < count && count % 6 == 0));
        }
      },
      rightPressing: {
        get: function() {
          const count = this._rightCount;
          const current = this.getKey("right") || 0.5 < this.getStickDirection().x;
          return current && (count == 1 || (40 < count && count % 6 == 0));
        }
      },
      upPressing: {
        get: function() {
          const count = this._upCount;
          const current = this.getKey("up") || this.getStickDirection().y < -0.5;
          return current && (count == 1 || (40 < count && count % 6 == 0));
        }
      },
      downPressing: {
        get: function() {
          const count = this._downCount;
          const current = this.getKey("down") || 0.5 < this.getStickDirection().y;
          return current && (count == 1 || (40 < count && count % 6 == 0));
        }
      },
    }

  });

});
