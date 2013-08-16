three60.js
=======
A super simple Javascript method that creates a nice spinneable 360 with inertia. It works fine on mobile and desktop.

### Usage
#### HTML
 ```html
<div id="ipods">
	<div class="loading"></div>
</div>
 ```
#### Javascript
 ```javascript
var iPods;
iPods = new three60();
iPods.init('ipods', 'images/ipod/Seq_v04_640x378_{i}.jpg', 72);
 ```
The first argument is the container id, the second is the path to the pool of images and the third one is the total number of images (or frames). The "{i}" in the second parameter represents the number on the image's name, in this case it's from 1 to 72.

### Demo
[http://juancabrera.github.io/three60/](http://juancabrera.github.io/three60/)