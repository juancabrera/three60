var three60 = function three60() {

  "use strict";

  var self = this;

  self.debug              = true;
  self.container          = null;
  self.canvas           = null;
  self.canvasContext    = null;
  self.containerName      = null;
  self.fileName           = null;
  self.totalFrames        = null;
  self.framesLoaded       = 0;
  self.frameIndex         = 1;
  self.lastFrameIndex     = 1;
  self.dragging           = false;
  self.lastScreenX        = 0;
  self.inertiaInterval    = null;
  self.direction          = null;
  self.frameSpeed         = 0;
  self.inertiaFrameSpeed  = 0;
  self.timeInertia        = 0;
  self.inertiaDuration    = 0;
  self.imageObjects       = [];
  self.RAFrunning         = false;
  self.imageFrame         = false;

  // initialize
  self.init = function(container, fileName, totalFrames) {
    self.container = document.querySelector("#" + container);
    self.canvas = document.getElementById(container);
    self.canvasContext = self.canvas.getContext("2d");
    self.fileName = fileName;
    self.totalFrames = totalFrames - 1;
    self.frameIndex = totalFrames;
    self.containerName = container;
    Math.easeOutCirc = function(b, d, a, c) {
      return a * Math.sqrt(1 - (b = b / c - 1) * b) + d
    };
    window.requestAnimFrame = (function() {
      return window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function(callback) {
        window.setTimeout(callback, 1000 / 60);
      };
    })();

    // TODO: add loader.
    self.setCanvasDimension();
    self.loadFrames();
  };

  self.loadFrames = function() {
    for (var i = 0; i <= self.totalFrames; i++) {
      self.imageObjects[i] = new Image();

      if(i <= 9) {
        self.imageObjects[i].src = self.fileName.replace("{i}", "0" + i.toString());
      }else {
        self.imageObjects[i].src = self.fileName.replace("{i}", i);
      }
      self.imageObjects[i].onload = function() {
        self.framesLoaded++;
        if (self.framesLoaded === self.totalFrames) {
          self.canvasContext.drawImage(this, 0, 0);
          self.loadComplete();
        }
      };
    }
  };

  self.setCanvasDimension = function() {
    var frame = new Image();
    frame.src = self.fileName.replace("{i}", '00');
    frame.onload = function() {
      self.canvas.width = frame.width;
      self.canvas.height = frame.height;
    }
  };

  self.loadComplete = function() {
    var imgFrame;

    // TODO: remove loader.
    self.attachHandlers();
  };

  self.attachHandlers = function() {
    // handlers for mobile
    if (typeof document.ontouchstart !== "undefined" && typeof document.ontouchmove !== "undefined" && typeof document.ontouchend !== "undefined" && typeof document.ontouchcancel !== "undefined") {
      self.canvas.addEventListener("touchstart", function(e) {
        e.preventDefault();
        self.down(e.touches[0].pageX);
      });
      self.canvas.addEventListener("touchmove", function(e) {
        e.preventDefault();
        self.move(e.touches[0].pageX);
      });
      self.canvas.addEventListener("touchend", function(e) {
        e.preventDefault();
        self.up();
      });
      self.canvas.addEventListener("touchcancel", function(e) {
        e.preventDefault();
        self.up();
      });
    }

    // handlers for desktop
    self.container.addEventListener("mousedown", function(e) {
      e.preventDefault();
      self.down(e.screenX);
    });
    self.container.addEventListener("mousemove", function(e) {
      e.preventDefault();
      self.move(e.screenX);
    });
    self.container.addEventListener("mouseup", function(e) {
      e.preventDefault();
      self.up();
    });
    self.container.addEventListener("mouseout", function(e) {
      e.preventDefault();
      var relatedTarget = ("relatedTarget" in e? e.relatedTarget : e.toElement);
      if (relatedTarget) {
        if (relatedTarget.id === self.containerName) {
          return false;
        }
      }
      self.up();
    });
  };

  self.down = function(x) {
    self.dragging = true;
    self.lastScreenX = x;
    self.stopInertia();
  };

  self.move = function(x) {
    if (self.dragging) {
      self.frameSpeed = (parseInt(Math.abs(self.lastScreenX - x) * 0.05) === 0 ? 1 : parseInt(Math.abs(self.lastScreenX - x) * 0.05));
      self.lastFrameIndex = self.frameIndex;
      if (x > self.lastScreenX) {
        self.frameIndex = self.frameIndex - self.frameSpeed;
        self.direction = "left";
      } else if (x < self.lastScreenX) {
        self.direction = "right";
        self.frameIndex = self.frameIndex + self.frameSpeed;
      }
      if (self.frameIndex > self.totalFrames) {
        self.frameIndex = 1;
      }
      if (self.frameIndex < 1) {
        self.frameIndex = self.totalFrames;
      }
      if (self.lastFrameIndex !== self.lastScreenX) {
        self.updateFrames();
      }
      self.lastScreenX = x;
    }
  };

  self.up = function() {
    self.dragging = false;
    if (self.frameSpeed > 1) {
      self.inertia();
    }
  };

  self.inertia = function() {
    self.inertiaDuration = self.frameSpeed;
    self.inertiaFrameSpeed = 0;
    if (!self.RAFrunning) {
      requestAnimFrame(self.inertiaRAF);
    }
    self.RAFrunning = true;
  };

  self.inertiaRAF = function() {
    self.timeInertia += 0.04;
    self.frameSpeed = self.inertiaDuration - parseInt(Math.easeOutCirc(self.timeInertia, 0, self.inertiaDuration, self.inertiaDuration));
    self.inertiaFrameSpeed += self.inertiaDuration - Math.easeOutCirc(self.timeInertia, 0, self.inertiaDuration, self.inertiaDuration);
    if (self.inertiaFrameSpeed >= 1) {
      self.lastFrameIndex = self.frameIndex;
      if (self.direction === "right") {
        self.frameIndex = self.frameIndex + Math.floor(self.inertiaFrameSpeed);
      } else {
        self.frameIndex = self.frameIndex - Math.floor(self.inertiaFrameSpeed);
      }
      if (self.frameIndex > self.totalFrames) {
        self.frameIndex = 1;
      }
      if (self.frameIndex < 1) {
        self.frameIndex = self.totalFrames;
      }
      self.inertiaFrameSpeed = 0;
      self.updateFrames();
    }

    if (self.timeInertia > self.inertiaDuration || self.frameSpeed < 1) {
      self.stopInertia();
    } else {
      requestAnimFrame(self.inertiaRAF);
    }
  };

  self.stopInertia = function() {
    self.timeInertia = 0;
    self.inertiaDuration = 0;
    self.RAFrunning = false;
  };

  self.updateFrames = function() {
    self.imageFrame = new Image();
    if(self.frameIndex <= 9) {
      self.imageFrame.src = self.fileName.replace("{i}", "0" + self.frameIndex);
    } else {
      self.imageFrame.src = self.fileName.replace("{i}", self.frameIndex);
    }
    self.imageFrame.onload = function() {
      self.canvasContext.clearRect(0, 0, self.canvas.width, self.canvas.height);
      self.canvasContext.drawImage(this, 0, 0);
    }
  };
};

module.exports = three60;