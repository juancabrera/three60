function three60() {
	var self = this;

	this.debug 				= true;
	this.container 			= null;
	this.containerObj		= null;
	this.fileName			= null;
	this.totalFrames		= null;
	this.framesLoaded		= 0;
	this.frameIndex			= 1;
	this.lastFrameIndex		= 1;
	this.dragging			= false;
	this.lastScreenX		= 0
	this.inertiaInterval	= null;
	this.direction			= null;
	this.frameSpeed			= 0;
	this.timeInertia		= 0;
	this.inertiaDuration	= 0;

	// initialize
	this.init = function(container, fileName, totalFrames) {
		self.container = $('#' + container);
		self.containerObj = document.getElementById(container);
		self.fileName = fileName;
		self.totalFrames = totalFrames;

		Math.easeOutQuad = function (t, b, c, d) {
			return -c *(t/=d)*(t-2) + b;
		}

		Math.easeOutExpo = function (t, b, c, d) {
			return c * ( -Math.pow( 2, -10 * t/d ) + 1 ) + b;
		};

		Math.easeOutQuart = function (t, b, c, d) {
			t /= d;
			t--;
			return -c * (t*t*t*t - 1) + b;
		}

		self.loadFrames();
	}

	this.loadFrames = function() {
		for (i = 1; i <= self.totalFrames; i++) {
			$('<img/>').data('index', i).attr('src', self.fileName.replace('{i}', i)).load(function() {
				self.framesLoaded++;
				if (self.framesLoaded == self.totalFrames) self.loadComplete();
			});
		}
	}

	this.loadComplete = function() {
		self.container.find('.loading').remove();
		for (i = 1; i <= self.totalFrames; i++) {
			self.container.prepend('<img src="' + self.fileName.replace('{i}', i) + '" style="' + (i == 1 ? "display: block;" : "display: none;") + '" data-index="' + i + '">');
		}
		self.attachHandlers();
	}

	this.attachHandlers = function() {
		// handlers for mobile
		if (typeof document.ontouchstart !== 'undefined' && typeof document.ontouchmove !== 'undefined' && typeof document.ontouchend !== 'undefined' && typeof document.ontouchcancel !== 'undefined') {
			self.containerObj.addEventListener('touchstart', function(e) {
				e.preventDefault();
				self.down(e.touches[0].pageX);
			});

			self.containerObj.addEventListener('touchmove', function(e) {
				e.preventDefault();
				self.move(e.touches[0].pageX);
			});

			self.containerObj.addEventListener('touchend', function(e) {
				e.preventDefault();
				self.up();
			});

			self.containerObj.addEventListener('touchcancel', function(e) {
				e.preventDefault();
				self.up();
			});
		}

		// handlers for desktop
		self.container.mousedown(function(e) {
			e.preventDefault();
			self.down(e.screenX);
		});

		self.container.mousemove(function(e) {
			e.preventDefault();
			self.move(e.screenX);
		});

		self.container.mouseup(function(e) {
			e.preventDefault();
			self.up();
		});

		self.container.mouseleave(function(e) {
			e.preventDefault();
			self.up();
		});
	}

	this.down = function(x) {
		self.dragging = true;
		self.lastScreenX = x;
	}

	this.move = function(x) {
		if (self.dragging) {
			self.frameSpeed = (parseInt(Math.abs(self.lastScreenX - x) * 0.05) == 0 ? 1 : parseInt(Math.abs(self.lastScreenX - x) * 0.05));
			self.lastFrameIndex = self.frameIndex;

			if (x > self.lastScreenX) {
				self.frameIndex = self.frameIndex - self.frameSpeed;
				self.direction = 'left';
			} else if (x < self.lastScreenX) {
				self.direction = 'right';
				self.frameIndex = self.frameIndex + self.frameSpeed;
			}
			
			if (self.frameIndex > self.totalFrames) self.frameIndex = 1;
			if (self.frameIndex < 1) self.frameIndex = self.totalFrames;

			if (self.lastFrameIndex != self.lastScreenX) self.updateFrames();
			self.lastScreenX = x;
		}
	}

	this.up = function() {
		self.dragging = false;
		if (self.frameSpeed > 0) self.inertia();
	}

	this.inertia = function() {
		self.stopInertia();
		self.inertiaDuration = self.frameSpeed;
		self.inertiaInterval = setInterval(function() {
			self.timeInertia += 0.1;

			self.lastFrameIndex = self.frameIndex;
			if (self.direction == "right") self.frameIndex = self.frameIndex + self.frameSpeed; else self.frameIndex = self.frameIndex - self.frameSpeed;
			if (self.frameIndex > self.totalFrames) self.frameIndex = 1;
			if (self.frameIndex < 1) self.frameIndex = self.totalFrames;
			
			self.updateFrames();

			self.frameSpeed = self.inertiaDuration - parseInt(Math.easeOutQuad(self.timeInertia, 0, self.inertiaDuration, self.inertiaDuration));
			if (self.timeInertia > self.inertiaDuration || self.frameSpeed < 1) self.stopInertia();
		}, 1000 / 60);
	}

	this.stopInertia = function() {
		self.timeInertia = 0;
		clearInterval(self.inertiaInterval);
	}

	self.updateFrames = function() {
		self.container.find('img[data-index="' + self.lastFrameIndex + '"]').css({'display':'none'});
		self.container.find('img[data-index="' + self.frameIndex + '"]').css({'display':'block'});
	}
}

var Three60;

$(document).ready(function() {
	Three60 = new three60();
	Three60.init('three60', 'images/ipod/Seq_v04_640x378_{i}.jpg', 72);
});