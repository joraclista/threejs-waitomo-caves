    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0x240505);

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;


    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);


    document.body.appendChild(renderer.domElement);


    //var controls = new THREE.OrbitControls(camera);

    camera.position.set(-28, -10, 181);


    var stars = new THREE.Group();
    var lights = new THREE.Group();
    var waves = [];
    wavesMove = 1/10;
    var geometryPlane;

    for(var i = 0; i < 40 ; i++) {
        var randX = getRandomInt(-250, 250);
        var randZ = getRandomInt(-10, 100);
        createStar(randX, 20 , randZ);

    }
    for(var i = 0; i < 5 ; i++) {
        var randX = getRandomInt(-150, -120);
        var randZ = getRandomInt(70, 100);
        // createStar(randX, 0 , randZ, 5, 35);
    }
    for(var i = 0; i < 5 ; i++) {
        var randX = getRandomInt(120, 150);
        var randZ = getRandomInt(70, 100);
        // createStar(randX, 0 , randZ, 5, 35);
    }
    scene.add(stars);
    scene.add(lights);

    createRiver();
    createCeiling();
    createSceneLights();

    //controls.update();


    function animate() {
        requestAnimationFrame( animate );

        for(var i = 0; i < stars.children.length; i++) {
            updateStarPosition(i);
        }

        for(var i = 0; i < waves.length; i++) {
            updateWavesPosition(i);
        }
        wavesMove = wavesMove + 1/5;
        wavesMove = wavesMove % 31;
        //controls.update();
        renderer.render( scene, camera );
    }
    animate();

    function createStar(x, y, z, intense = 2, distance = 20) {
        //star light

        var geometryStar = new THREE.SphereGeometry(0.3, 16, 16);
        var materialStar = new THREE.MeshBasicMaterial({ color: 0xffffff });
        var star = new THREE.Mesh(geometryStar, materialStar);
        star.position.x = x;
        star.position.y = y;
        star.position.z = z

        var starLight = new THREE.PointLight(0xffffff, intense, distance);
        starLight.position.copy(star.position);
        starLight.position.y += 0.5;;

        var velX = (Math.random() + 0.1) * 0.1 * (Math.random() < 0.5 ? -1 : 1);
        var velY = (Math.random() + 0.1) * 0.1 * (Math.random() < 0.5 ? -1 : 1);
        star.vel = new THREE.Vector2(velX, velY);

        stars.add(star);
        lights.add(starLight);


    }

    function createRiver() {
        geometryPlane = new THREE.PlaneGeometry(500, 500, 200, 1);
        geometryPlane.dynamic = true;
        var m = new THREE.Matrix4();
        m.makeRotationX(Math.PI * -0.5);
        geometryPlane.applyMatrix(m);
        var k = 0;
        var delta = 1;
        for(var i = 0; i < geometryPlane.vertices.length; i++) {
            var vector = geometryPlane.vertices[i];

            var modI = i / 2 % (Math.PI * 2);
            vector.y = Math.sin(modI);
            waves.push(vector);
        }
        var materialPlane = new THREE.MeshPhongMaterial({
            color: 0x368cb2,
            emissive: 0x2f0808,
            side: THREE.DoubleSide
        });
        var plane = new THREE.Mesh(geometryPlane, materialPlane);
        plane.position.y = -50;
        scene.add(plane);
    }


    function createCeiling() {
        var geometryTerrain = new THREE.PlaneGeometry(500, 500, 300, 300);
        var m = new THREE.Matrix4();
        m.makeRotationX(Math.PI * -0.5);


        geometryTerrain.applyMatrix(m);

        var len = geometryTerrain.vertices.length;

        for(var i = 0; i < len; i++) {
            var vector = geometryTerrain.vertices[i];
            var ratio = noise.simplex3(vector.x * 0.03, vector.z * 0.03, 0);
            var k = getRandomInt(10, 15);

            if (vector.x < -100 || vector.x > 100) k = getRandomInt(40, 43);
            if (vector.x < -150 || vector.x > 150) k = getRandomInt(60, 70);
            // if (i > len * 0.7) k = getRandomInt(30, 35);
            vector.y = ratio * k;
        }
        var materialTerrain = new THREE.MeshPhongMaterial({
            color: 0x682525, emissive1: 0x2d0c0c, side: THREE.DoubleSide
        });
        var terrain = new THREE.Mesh(geometryTerrain, materialTerrain);
        terrain.position.y = 30;
        scene.add(terrain);
    }

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
    }

    function updateStarPosition(index) {

        stars.children[index].position.x += stars.children[index].vel.x;
        stars.children[index].position.z += stars.children[index].vel.y;
    //  var ratio = noise.simplex3(star.position.x*0.03, star.position.z*0.03, 0);
        // stars.children[index].position.y = ratio * 10 + 0.3;


        lights.children[index].position.copy(stars.children[index].position);
        lights.children[index].position.y += 0.5;
    }

    function createSceneLights() {
        var light1 = new THREE.PointLight(0xffffff, 0.8, 350);
        scene.add(light1);

        var light2 = new THREE.PointLight(0xffffff, 0.8, 350);
        light2.position.x = light2.position.x - 200;
        light2.position.z = light2.position.z + 50;
        scene.add(light2);

        var light3 = new THREE.PointLight(0xffffff, 0.8, 350);
        light3.position.x = light3.position.x + 250;
        light3.position.z = light3.position.z + 50;
        scene.add(light3);
    }

    function updateWavesPosition(index) {

        var modI = index / 2 % (Math.PI * 2);
        waves[index].y = Math.sin(modI + wavesMove);

        geometryPlane.__dirtyVertices = true;
        geometryPlane.verticesNeedUpdate = true
    }