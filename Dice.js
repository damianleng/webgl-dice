"use strict";

var canvas;
var gl;

var numPositions  = 36;

var texSize = 64;

var program;
var flag = false;
var random = false;
var count = 0;

var start = 0;

var positionsArray = [];
var colorsArray = [];
var texCoordsArray = [];
var modelViewMatrix, projectionMatrix;
var normalsArray = [];

var texture;
var textures = [];

var dr = 180.0 * Math.PI/180.0;

var random_number = [
    vec3(0, 0, 0),  // yield 1 
    vec3(180, 0, 0), // yield 2
    vec3(90, 90, 90), // yield 3 
    vec3(0, 270, 0), // yield 4
    vec3(90, 0, 0), // yield 5
    vec3(270, 0, 0) // yield 6 
]


var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];


var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;
var theta = vec3(0.0, 0.0, 0.0);

var thetaLoc;

var images = [];
var imageNames = ["texImage1", "texImage2", "texImage3", "texImage4", "texImage5", "texImage6"];

var lightPosition = vec4(1.0, 1.0, 1.0, 0.0);
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);
var materialShininess = 100.0;

function configureTexture( images ) {
    for(var i = 0; i < images.length; i++){
        texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
             gl.RGB, gl.UNSIGNED_BYTE, images[i]);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                          gl.NEAREST_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.uniform1i(gl.getUniformLocation(program, "uTextureMap"), 0);
        textures.push(texture);
    }
}

function quad(a, b, c, d) {
    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = cross(t1, t2);
    normal = vec3(normal);

    positionsArray.push(vertices[a]);
    texCoordsArray.push(texCoord[0]);
    normalsArray.push(normal);
    positionsArray.push(vertices[b]);
    texCoordsArray.push(texCoord[1]);
    normalsArray.push(normal);
    positionsArray.push(vertices[c]);
    texCoordsArray.push(texCoord[2]);
    normalsArray.push(normal);
    positionsArray.push(vertices[a]);
    texCoordsArray.push(texCoord[0]);
    normalsArray.push(normal);
    positionsArray.push(vertices[c]);
    texCoordsArray.push(texCoord[2]);
    normalsArray.push(normal);
    positionsArray.push(vertices[d]);
    texCoordsArray.push(texCoord[3]);
    normalsArray.push(normal);
}


function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 4, 5, 6, 7 ); 
    quad( 2, 3, 7, 6 );
    quad( 5, 4, 0, 1 ); 
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 ); 
}


window.onload = function init() {

    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    colorCube();

    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var normalLoc = gl.getAttribLocation(program, "aNormal");
    gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLoc);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);

    var texCoordLoc = gl.getAttribLocation(program, "aTexCoord");
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLoc);

    for(var i = 0; i<6; i++){
        var image = document.getElementById(imageNames[i]);
        images.push(image);
    }

    configureTexture(images);

    thetaLoc = gl.getUniformLocation(program, "uTheta");

    document.getElementById("Roll").onclick = function(){
        random = true;
        count = 0;
        theta = vec3(0, 0, 0);
    }

    document.getElementById("xButton").onclick = function(){
        axis = xAxis;
    }

    document.getElementById("yButton").onclick = function(){
        axis = yAxis;
    }

    document.getElementById("zButton").onclick = function(){
        axis = zAxis;
    }

    document.getElementById("toggleButton").onclick = function(){
        flag = !flag;
    }

    document.getElementById("increaseButton").onclick = function(){
        theta[0] += dr;
        theta[1] += dr;
        theta[2] += dr;
    }

    document.getElementById("decreaseButton").onclick = function(){
        theta[0] -= dr;
        theta[1] -= dr;
        theta[2] -= dr;
    }


    window.onkeydown = function(event){
        var key = String.fromCharCode(event.keyCode)
        switch(key){
            case 'X':
                axis = xAxis;
                break;
            case 'Y':
                axis = yAxis;
                break;
            case 'Z':
                axis = zAxis;
                break;
            case 'T':
                flag = !flag;
                break;
            case 'S':
                random = true;
                count = 0;
                theta = vec3(0, 0, 0);
                break;
        }
    }

   
    projectionMatrix = ortho(-1, 1, -1, 1, -100, 100);

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProduct"),
    ambientProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProduct"),
        diffuseProduct );
    gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProduct"),
        specularProduct );
    gl.uniform4fv(gl.getUniformLocation(program, "uLightPosition"),
        lightPosition );
    
    gl.uniform1f(gl.getUniformLocation(program,
        "uShininess"), materialShininess);

    gl.uniformMatrix4fv( gl.getUniformLocation(program, "uProjectionMatrix"),
       false, flatten(projectionMatrix));

    render();

}

function randrange(min, max){
    return Math.floor(Math.random() * (max - min) + min);
}

var render = function() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if(flag) theta[axis] += 2.0;

    var number = randrange(0, 6);

    if(random) {
        theta[0] += 30;
        theta[1] += 30;
        theta[2] += 30;
        count++;
        if(count == 200){
            random = false;
            theta = random_number[number]
            count = 0;
        }
    }

    gl.uniform3fv(thetaLoc, theta);
    modelViewMatrix = mat4();
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[xAxis], vec3(1, 0, 0)));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[yAxis], vec3(0, 1, 0)));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[zAxis], vec3(0, 0, 1)));

    gl.uniformMatrix4fv(gl.getUniformLocation(program,
        "uModelViewMatrix"), false, flatten(modelViewMatrix));

    for(var i=0; i<6; i++){
        gl.bindTexture(gl.TEXTURE_2D, textures[i]);
        gl.drawArrays(gl.TRIANGLES, 6*i, 6)
    }
    
    requestAnimationFrame(render);
}


