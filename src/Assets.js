phina.namespace(() => {

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
