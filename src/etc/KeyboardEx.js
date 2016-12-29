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
