import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { scene, camera, renderer } from '../setup';

const rad = Math.PI / 180;
const randomBetween = (min, max) => min + Math.round((max - min) * Math.random());
const clock = new THREE.Clock();

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

camera.position.z = 10;
camera.position.y = 2;

scene.fog = new THREE.Fog(0xffffff, .1, 100);

const orbitControl = new OrbitControls(camera, renderer.domElement);

const loader = new GLTFLoader();

loader.load('../trainset-rail-detailed-bend.glb', t => {
  for (let i = 0; i < 360; i += 90) {
    const angle = i * rad;
    const trail = t.scene.clone();
    trail.rotation.y = angle;
    trail.position.z = 3 - Math.sin(Math.PI / -4 + angle) * .707;
    trail.position.x = 3 + Math.cos(Math.PI / -4 + angle) * .707;
    scene.add(trail);
  }
})

loader.load('../train-locomotive.glb', (obj) => {
  for (let i = 0; i < 4; i++) {
    const clone = obj.scene.clone();
    clone.traverse((child) => {
      child.castShadow = true;
      child.receiveShadow = true;
    });

    const radius = 0.707;

    let angle = (i * -90) * rad;

    clone.userData.update = (elapsedTime) => {
      angle += 2 * elapsedTime;
      const { x, y, z } = new THREE.Vector3(3 + Math.cos(angle) * radius, 0, 3 + Math.sin(angle) * -radius);
      clone.rotation.y = Math.PI / 2 + angle;
      clone.position.set(x, y, z);
    };

    scene.add(clone);
  }
});

loader.load('../tree-snow-a.glb', (obj) => {
  const count = 50;
  const mesh = new THREE.InstancedMesh(obj.scene.children[0].geometry, obj.scene.children[0].material, count);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  for (let i = 0; i < count; i++) {
    const position = new THREE.Vector3().randomDirection();

    if (Math.abs(position.distanceTo(new THREE.Vector3(0, 0, 0))) < 5) {
      position.multiplyScalar(15);
    }

    position.y = 0;
    const dummy = new THREE.Matrix4();
    dummy.setPosition(position);
    mesh.setMatrixAt(i, dummy);
  }
  mesh.instanceMatrix.needsUpdate = true;
  scene.add(mesh);
});

loader.load('../tree-decorated-snow.glb', (obj) => {
  obj.scene.traverse((child) => {
    child.castShadow = true;
    child.receiveShadow = true;
  });
  console.log(obj.scene)
  scene.add(obj.scene);
});

loader.load('../present-a-cube.glb', (obj) => {
  for (let i = 1; i <= 10; i++) {
    const angle = i * (360 / 10) * rad;
    const clone = obj.scene.clone();
    clone.traverse((child) => {
      child.castShadow = true;
      child.receiveShadow = true;
    })
    clone.position.set(Math.cos(angle) * 3, 0, Math.sin(angle) * 3);
    scene.add(clone);
  }
});

const createFloor = () => {
  const geometry = new THREE.PlaneGeometry(32, 32);
  const material = new THREE.MeshPhongMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  mesh.rotation.x = Math.PI / -2;
  scene.add(mesh);
}

const setupLight = () => {

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);

  const shadowCameraSize = 32;

  directionalLight.position.set(0, 32, -32);
  directionalLight.castShadow = true;
  directionalLight.shadow.bias = -0.0001;
  directionalLight.shadow.camera.near = 0.01;
  directionalLight.shadow.camera.far = 1000;
  directionalLight.shadow.camera.left = -shadowCameraSize;
  directionalLight.shadow.camera.right = shadowCameraSize;
  directionalLight.shadow.camera.top = shadowCameraSize;
  directionalLight.shadow.camera.bottom = -shadowCameraSize;
  directionalLight.shadow.mapSize = new THREE.Vector2(2048, 2048);
  scene.add(directionalLight);

  // const cameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
  // scene.add(cameraHelper);

  const ambientLight = new THREE.AmbientLight(0x0000ff, 0.2);
  scene.add(ambientLight);
}

const createSnowFlakesMesh = (geometry, material) => {
  const count = 200;
  const mesh = new THREE.InstancedMesh(geometry, material, count);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  for (let i = 0; i < count; i++) {
    const radius = Math.random();
    const coords = new THREE.Vector3().randomDirection().multiplyScalar(16);
    coords.y = Math.abs(coords.y);
    const matrix = new THREE.Matrix4();
    matrix.scale(new THREE.Vector3(radius, radius, radius))
    matrix.setPosition(new THREE.Vector3(...coords));
    mesh.setMatrixAt(i, matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  scene.add(mesh);

  mesh.userData.update = (delta) => {
    for (let i = 0; i < count; i++) {
      const matrix = new THREE.Matrix4();
      mesh.getMatrixAt(i, matrix);
      const dummy = new THREE.Object3D();
      matrix.decompose(dummy.position, dummy.rotation, dummy.scale);

      dummy.position.x += delta * randomBetween(-2, 2);
      dummy.position.y -= delta * dummy.scale.x * 2;
      dummy.position.z += delta * randomBetween(-2, 2);
      dummy.rotateY(Math.random() * .1)

      const coords = new THREE.Vector3().randomDirection().multiplyScalar(16);
      coords.y = Math.abs(coords.y);
      if (dummy.position.y - dummy.scale.y / 2 < 0) {
        dummy.position.set(...coords);
      }
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }
}

setupLight();
createFloor();

loader.load('../snowflake-a.glb', ({ scene }) => createSnowFlakesMesh(scene.children[0].geometry, scene.children[0].material));
loader.load('../snowflake-b.glb', ({ scene }) => createSnowFlakesMesh(scene.children[0].geometry, scene.children[0].material));
loader.load('../snowflake-c.glb', ({ scene }) => createSnowFlakesMesh(scene.children[0].geometry, scene.children[0].material));

const stats = new Stats()

renderer.setAnimationLoop(() => {
  stats.update()
  const delta = clock.getDelta();
  scene.children.forEach((e) => {
    if (e.userData.update != null) {
      e.userData.update(delta);
    }
  });
  orbitControl.update(delta);
  renderer.render(scene, camera);
})

document.body.appendChild(stats.dom)
document.body.appendChild(renderer.domElement);
