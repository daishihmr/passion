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
