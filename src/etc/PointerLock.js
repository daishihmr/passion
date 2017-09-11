phina.namespace(() => {

  phina.define("passion.PointerLock", {
    superClass: "phina.util.EventDispatcher",

    domElement: null,

    init: function(domElement) {
      this.superInit();
      this.domElement = domElement;

      this.domElement.requestPointerLock = this.domElement.requestPointerLock || this.domElement.mozRequestPointerLock || (() => {});
      this.domElement.exitPointerLock = this.domElement.exitPointerLock || this.domElement.mozExitPointerLock || (() => {});

      if ("onpointerlockchange" in this.domElement) {
        this.domElement.addEventListener("pointerlockchange", e => {
          this.flare("change");
        }, false);
      } else {
        this.domElement.addEventListener("mozpointerlockchange", e => {
          this.flare("change");
        }, false);
      }
    },

    // https://developer.mozilla.org/ja/docs/API/Pointer_Lock_API
    lock: function() {
      this.domElement.requestPointerLock();
    },

    exit: function() {
      this.domElement.exitPointerLock();
    },

  });

  phina.define("passion.LockedMouse", {
    superClass: "phina.input.Input",

    init: function(domElement) {
      this.superInit(domElement);
    },
  });

});