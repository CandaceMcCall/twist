"use strict";

var canvas;
var gl;
var theta = 90 * 2 * Math.PI/360;
var thetaLoc;
var fillType = 1;

var points = [];

var numTimesToSubdivide = 5;

window.onload = function init()
{
	canvas = document.getElementById( "gl-canvas" );

	gl = WebGLUtils.setupWebGL( canvas );
	if ( !gl ) { alert( "WebGL isn't available" ); }
	points = [];

	// initialize triangle.
	/*
	 * To get triangle to be centered at origin,
	 * one way is to use polar coordinates,
	 * x = rcos(theta), y = sin(theta).
	 * An equilateral triangle has 3 angles totalling
	 * 180, so 180/3 = 60.   If we bisect each of
	 * those and find midpoint of triangle, we have
	 * 3 triangles with 30,30,120.  Now let r = the
	 * length of each of those bisecting edges,
	 * rotate triangle so first vertex starts at
	 * angle 0, rcos(0) = r, sin(0) = 0, (r,0).
	 * First vertex, is (r,0).   Next vertex,
	 * counter-clockswise is theta = 120 degrees
	 * which is 120/360(2PI)=2PI/3, so (rcos(2PI/3),
	 * rsin(2PI/3).   Last vertex is another 120
	 * degrees so (rcos(4PI/3),rsin(4PI/3)).
	 * (Note: theta is a generic term for angle)
	 */
	var r = 0.50;


	var vertices = [
		//vec2( -1, -1 ),
		//vec2(  0,  1 ),
		//vec2(  1, -1  )
		//vec2( -.5, -.5 ),
		//vec2(  0,  .5 ),
		//vec2(  .5, -.5 )
		vec2( r*Math.cos(Math.PI*4/3), r*Math.sin(Math.PI*4/3)),
		vec2( r*Math.cos(Math.PI*2/3), r*Math.sin(Math.PI*2/3)),
		vec2(  r, 0 )
			];

	divideTriangle( vertices[0], vertices[1], vertices[2],
			numTimesToSubdivide);

	//
	//  Configure WebGL
	//
	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

	//  Load shaders and initialize attribute buffers

	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram( program );

	// Load the data into the GPU

	var bufferId = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

	// Associate out shader variables with our data buffer

	var vPosition = gl.getAttribLocation( program, "vPosition" );
	gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );

	thetaLoc = gl.getUniformLocation( program, "theta" );
	document.getElementById("tess-slider").onchange = function(target) {
		console.log("slider pressed");
		numTimesToSubdivide = parseInt(event.target.value);
        	init();
	};
	document.getElementById("angle-slider").onchange = function(target) {
		console.log("angle pressed");
		var degrees = parseInt(event.target.value);
		console.log(degrees);
		theta = degrees * 2 * Math.PI/360;
        	init();
	};
	document.getElementById("fill-slider").onchange = function(target) {
		fillType = parseInt(event.target.value);
		console.log("fill Type"+fillType);
        	init();
	};

	render();
};

function triangle( a, b, c )
{
	if (fillType == 1) {
		points.push( a, b, b, c, c, a );
	} else {
		points.push( a, b, c );
	}
}

function divideTriangle( a, b, c, count )
{

	// check for end of recursion

	if ( count === 0 ) {
		triangle( a, b, c );
	}
	else {

		//bisect the sides

		var ab = mix( a, b, 0.5 );
		var ac = mix( a, c, 0.5 );
		var bc = mix( b, c, 0.5 );

		--count;

		// three new triangles

		divideTriangle( a, ab, ac, count );
		divideTriangle( c, ac, bc, count );
		divideTriangle( b, bc, ab, count );

		// then one in the middle
		divideTriangle( ab, ac, bc, count );
	}
}

function render()
{
	gl.uniform1f(thetaLoc, theta);
	gl.clear( gl.COLOR_BUFFER_BIT );
	console.log("render "+fillType);
	if (fillType == 1) {
		gl.drawArrays( gl.LINES, 0, points.length );
	} else {
		gl.drawArrays( gl.TRIANGLES, 0, points.length );
	}
}
