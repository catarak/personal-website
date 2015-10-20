'use strict';

var positions = require('./positions.js');
  
  var scene, camera, renderer;

  var container, HEIGHT,
    WIDTH, fieldOfView, aspectRatio,
    nearPlane, farPlane, stats,
    geometry, particleCount,
    i, h, color, size,
    materials = [],
    mouseX = 0,
    mouseY = 0,
    prevMouseX = 0,
    prevMouseY = 0,
    mouseVelocity = 0,
    windowHalfX, windowHalfY, cameraZ,
    fogHex, fogDensity, parameters = {},
    parameterCount, particles,
    particleSprings = [],
    currentTime = new Date().getTime(),
    lastTime = new Date().getTime();

    var DISPLACEMENT      = 0.15;
    var SPRING_STRENGTH   = 0.0005;
    var DAMPEN            = 0.998;

  var CAMERA_MAX = 700;

  init();
  animate();

  function init() {

    //HEIGHT = window.innerHeight;
    HEIGHT = 230;
    WIDTH = window.innerWidth;
    windowHalfX = WIDTH / 2;
    windowHalfY = HEIGHT / 2;

    fieldOfView = 75;
    aspectRatio = WIDTH / HEIGHT;
    nearPlane = 1;
    farPlane = 4000;

  cameraZ = farPlane / 2; 
  fogHex = 0x000000;      
  fogDensity = 0.0007;    

  camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
  camera.position.z = cameraZ;

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(fogHex, fogDensity);

  container = document.getElementById('animation-container');
  //document.body.appendChild(container);
    document.body.style.margin = 0;
    document.body.style.overflow = 'hidden';

  geometry = new THREE.Geometry();

  particleCount = 12000; 

  for (i = 0; i < particleCount; i++) {
    var j = i % positions.length;
    var vertex = new THREE.Vector3();

    vertex.x = 2*positions[j].x -720 + Math.random()*40 - 20;
    vertex.y = Math.abs(2*positions[j].y) - 170 + Math.random()*40 - 20;
    vertex.z = Math.random() * 100 + 1200;
    //vertex.randomOffset = Math.random()*2*Math.PI;

    geometry.vertices.push(vertex);

    // var k = i % positionsLast.length
    // var vertexLast = new THREE.Vector3();
    // vertexLast.x = 2*positionsLast[k].x -1220 + Math.random()*40 - 20;
    // vertexLast.y = Math.abs(2*positionsLast[k].y) -450 + Math.random()*40 - 20;
    // vertexLast.z = Math.random() * 100 + 1200;
    // geometry.vertices.push(vertexLast);

  }

  geometry.dynamic = true;


  parameters = [[[1, 1, 0.5], 5], [[0.95, 1, 0.5], 4], [[0.90, 1, 0.5], 3], [[0.85, 1, 0.5], 2], [[0.80, 1, 0.5], 1]];
  parameterCount = parameters.length;

  for (i = 0; i < parameterCount; i++) {

    color = parameters[i][0];
    size  = parameters[i][1];

    materials[i] = new THREE.PointsMaterial({
      size:size,
      map: THREE.ImageUtils.loadTexture('images/particle3.png'),
      transparent: true,
    });

    particles = new THREE.Points(geometry, materials[i]);
    scene.add(particles);
  }

  renderer = new THREE.WebGLRenderer();         
  renderer.setPixelRatio(window.devicePixelRatio);  
  renderer.setSize(WIDTH, HEIGHT);          

  container.appendChild(renderer.domElement);   

    //Stats, if I ever want to bring this back for debugging purposes
    // stats = new Stats();
    // stats.domElement.style.position = 'absolute';
    // stats.domElement.style.top = '0px';
    // stats.domElement.style.right = '0px';
    // container.appendChild( stats.domElement );

    /* Event Listeners */

    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('touchstart', onDocumentTouchStart, false);
    document.addEventListener('touchmove', onDocumentTouchMove, false);

  }

  function animate() {
    requestAnimationFrame(animate);
    render();
    //stats.update();
  }

  function render() {
    var time = Date.now() * 0.00005;

    //camera.position.x += (mouseX - camera.position.x) * 0.01;
    //camera.position.y += (- mouseY - camera.position.y) * 0.01;
    currentTime = new Date().getTime();
    camera.position.x = CAMERA_MAX * Math.sin(currentTime/2000);

    camera.lookAt(scene.position);
    //checkIntersection();
    //updateVertices();
    particles.geometry.verticesNeedUpdate = true;

    renderer.render(scene, camera);   
  }

  function onDocumentMouseMove(e) {
    mouseX = e.clientX - windowHalfX;
    mouseY = e.clientY - windowHalfY; 
    // lastTime = currentTime;
    // currentTime = new Date().getTime();
    // prevMouseX = mouseX;
    // prevMouseY = mouseY;   
    // mouseX = ( event.clientX / window.innerWidth ) * 2 - 1;
    // mouseY = - ( event.clientY / window.innerHeight ) * 2 + 1;
    // var mouseVelocityX = (mouseX - prevMouseX)*window.innerWidth/((currentTime - lastTime)/1000);
    // var mouseVelocityY = (mouseY - prevMouseY)*window.innerHeight/((currentTime - lastTime)/1000);
    // mouseVelocity = new THREE.Vector2( mouseVelocityX, mouseVelocityY );
    // checkIntersection();
  }

  /*  Mobile users?  I got your back homey  */

  function onDocumentTouchStart(e) {

    if (e.touches.length === 1) {

      e.preventDefault();
      mouseX = e.touches[0].pageX - windowHalfX;
      mouseY = e.touches[0].pageY - windowHalfY;
    }
  }

  function onDocumentTouchMove(e) {

    if (e.touches.length === 1) {

      e.preventDefault();
      mouseX = e.touches[ 0 ].pageX - windowHalfX;
      mouseY = e.touches[ 0 ].pageY - windowHalfY;
    }
  }

  function onWindowResize() {

    WIDTH = window.innerWidth;
    windowHalfX = window.innerWidth / 2;

    if (window.innerHeight < HEIGHT) {
      windowHalfY = window.innerHeight / 2;
    }
    else {
      windowHalfY = HEIGHT / 2;
    }

    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
    renderer.setSize(WIDTH, HEIGHT);
  }


  //if one day i get this cool spring interaction working
  function checkIntersection() {
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2( mouseX, mouseY );
    //console.log("mouseX: " + mouseX, "mouseY: " + mouseY);
    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects( scene.children );
    for (var i = 0; i < intersects.length; i+=2) {
      var index = intersects[i].index;
      var particle = particles.geometry.vertices[index];

      //add this particle to the list of oscillators and then keep moving it
      particle.initialForce = new THREE.Vector3(mouseVelocity.x, mouseVelocity.y, 0);
      particle.velocity.add(new THREE.Vector3(mouseVelocity.x, mouseVelocity.y, 0).multiplyScalar(DISPLACEMENT));
      
      //inital movement to the vertex
      particle.add(new THREE.Vector3(mouseVelocity.x, mouseVelocity.y, 0)).multiplyScalar((currentTime - lastTime)/1000);
      
      particle.isMoving = true;
    }
  }

  function updateVertices() {
    for (var i = 0; i < particles.geometry.vertices.length; i++) {
      var vertex = particles.geometry.vertices[i];
      var time = new Date().getTime() / 1000;
      vertex.add(new THREE.Vector3(0.4*Math.cos(time+vertex.randomOffset), 0.4*Math.sin(time+vertex.randomOffset), 0));
    }
  }



