// three60.js

// FIX ME: find best solution to scope on .inertiaRAF()
var _self;

class Three60 {
	constructor(container, fileName, totalFrames) {
    this.container          = document.querySelector('#' + container);
    this.containerObj       = document.getElementById(container);
    this.containerName      = container;
    this.fileName           = fileName;
    this.totalFrames        = totalFrames;
    this.framesLoaded       = 0;
    this.frameIndex         = 1;
    this.lastFrameIndex     = 1;
    this.dragging           = false;
    this.lastScreenX        = 0;
    this.inertiaInterval    = null;
    this.direction          = null;
    this.frameSpeed         = 0;
    this.inertiaFrameSpeed  = 0;
    this.timeInertia        = 0;
    this.inertiaDuration    = 0;
    this.imageObjects       = Array();
    this.RAFrunning         = false;

    _self = this;

    this.init();
  }

  init() {
    Math.easeOutQuad = function (t, b, c, d) {
      return -c *(t/=d)*(t-2) + b;
    }

    Math.easeOutQuart = function (t, b, c, d) {
      t /= d;
      t--;
      return -c * (t*t*t*t - 1) + b;
    }

    Math.easeOutExpo = function (t, b, c, d) {
      return c * ( -Math.pow( 2, -10 * t/d ) + 1 ) + b;
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

    this.loadFrames();
  }

  loadFrames() {
    // var _self = this;

    for (var i = 1; i <= this.totalFrames; i++) {
      this.imageObjects [i] = new Image();
      this.imageObjects[i].src = this.fileName.replace('{i}', i);
      this.imageObjects[i].onload = function() {
        _self.framesLoaded++;
        if (_self.framesLoaded == _self.totalFrames) _self.loadComplete();
      }
    }
  }

  loadComplete() {
    var imgFrame;
    
    this.container.querySelector(".loading").className = "hide"
    for (var i = 1; i <= this.totalFrames; i++) {
      imgFrame = document.createElement('img');
      imgFrame.setAttribute('src', this.fileName.replace('{i}', i));
      imgFrame.setAttribute('style', i == 1 ? "display: block;" : "display: none;");
      imgFrame.setAttribute('data-index', i);
      this.container.appendChild(imgFrame);
    }
    this.attachHandlers();
  }

  attachHandlers() {
    // var _self = this;

    // handlers for mobile
    if (typeof document.ontouchstart !== 'undefined' && typeof document.ontouchmove !== 'undefined' && typeof document.ontouchend !== 'undefined' && typeof document.ontouchcancel !== 'undefined') {
      this.containerObj.addEventListener('touchstart', function(e) {
        e.preventDefault();
        _self.down(e.touches[0].pageX);
      });

      this.containerObj.addEventListener('touchmove', function(e) {
        e.preventDefault();
        _self.move(e.touches[0].pageX);
      });

      this.containerObj.addEventListener('touchend', function(e) {
        e.preventDefault();
        _self.up();
      });

      this.containerObj.addEventListener('touchcancel', function(e) {
        e.preventDefault();
        _self.up();
      });
    }

    // handlers for desktop
    this.container.addEventListener('mousedown', function(e) {
      e.preventDefault();
      _self.down(e.screenX);
    });

    this.container.addEventListener('mousemove', function(e) {
      e.preventDefault();
      _self.move(e.screenX);
    });

    this.container.addEventListener('mouseup', function(e) {
      e.preventDefault();
      _self.up();
    });

    _self.container.addEventListener('mouseout', function(e) {
      e.preventDefault();

      var relatedTarget = ('relatedTarget' in e? e.relatedTarget : e.toElement);
      if (relatedTarget.nodeName == "IMG" || relatedTarget.id == _self.containerName) return false;
      _self.up();
    });
  }

  down(x) {
    this.dragging = true;
    this.lastScreenX = x;
    this.stopInertia();
  }

  move(x) {
    if (this.dragging) {
      this.frameSpeed = (parseInt(Math.abs(this.lastScreenX - x) * 0.05) == 0 ? 1 : parseInt(Math.abs(this.lastScreenX - x) * 0.05));
      this.lastFrameIndex = this.frameIndex;

      if (x > this.lastScreenX) {
        this.frameIndex = this.frameIndex - this.frameSpeed;
        this.direction = 'left';
      } else if (x < this.lastScreenX) {
        this.direction = 'right';
        this.frameIndex = this.frameIndex + this.frameSpeed;
      }
      
      if (this.frameIndex > this.totalFrames) this.frameIndex = 1;
      if (this.frameIndex < 1) this.frameIndex = this.totalFrames;

      if (this.lastFrameIndex != this.lastScreenX) this.updateFrames();
      this.lastScreenX = x;
    }
  }

  up() {
    this.dragging = false;
    if (this.frameSpeed > 1) this.inertia();
  }

  inertia() {
    var _self = this;

    this.inertiaDuration = this.frameSpeed;
    this.inertiaFrameSpeed = 0;

    if (!this.RAFrunning) requestAnimFrame(this.inertiaRAF);
    this.RAFrunning = true;
  }

  inertiaRAF() {
    _self.timeInertia += 0.04;
    _self.frameSpeed = _self.inertiaDuration - parseInt(Math.easeOutQuart(_self.timeInertia, 0, _self.inertiaDuration, _self.inertiaDuration));
    _self.inertiaFrameSpeed += _self.inertiaDuration - Math.easeOutQuart(_self.timeInertia, 0, _self.inertiaDuration, _self.inertiaDuration);

    if (_self.inertiaFrameSpeed >= 1) {
      _self.lastFrameIndex = _self.frameIndex;
      if (_self.direction == "right") _self.frameIndex = _self.frameIndex + Math.floor(_self.inertiaFrameSpeed); else _self.frameIndex = _self.frameIndex - Math.floor(_self.inertiaFrameSpeed);
      if (_self.frameIndex > _self.totalFrames) _self.frameIndex = 1;
      if (_self.frameIndex < 1) _self.frameIndex = _self.totalFrames;
      _self.inertiaFrameSpeed = 0;
      _self.updateFrames();
    }

    if (_self.timeInertia > _self.inertiaDuration || _self.frameSpeed < 1) _self.stopInertia(); else requestAnimFrame(_self.inertiaRAF);
  }

  stopInertia() {
    this.timeInertia = 0;
    this.inertiaDuration = 0;
    this.RAFrunning = false;
  }

  updateFrames() {
    this.container.querySelector('img[data-index="' + this.lastFrameIndex + '"]').style.display = "none"
    this.container.querySelector('img[data-index="' + this.frameIndex + '"]').style.display = "block"    
  }
}

var three60 = function(container, fileName, totalFrames) {
  return new Three60(container, fileName, totalFrames);
}

export default three60;