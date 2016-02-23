three60()
=========
A simple Javascript method that creates a smooth spinnable 360 with inertia for mobile and desktop.

### Usage
#### HTML
 ```html
<canvas id="hat"></canvas>
 ```
Note: three60 will set the dimensions to the canvas element.
#### Javascript
 ```javascript
var hat;
hat = new three60();
hat.init("hat", "./hat/frame-{i}.jpg", 72);
 ```
The first argument is the canvas id, the second is the path of the pool of images and the third one is the total number of images (or frames). The "{i}" in the second parameter represents the number on the image's name, in this case it's from 1 to 72.


### License
MIT Copyright (c) [codeculture](http://www.codeculture.de)