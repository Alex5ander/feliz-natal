import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

const rad = Math.PI / 180;
/**
 * @callback callbackModel
 * @param {THREE.Group} callback
 */

/** @param {callbackModel} callback  */
function loadModel(model, mtl, callback) {
  const loaderMTL = new MTLLoader();
  const loaderObj = new OBJLoader();

  loaderMTL.load(mtl, (e) => {
    e.preload();
    loaderObj.setMaterials(e);
    loaderObj.load(model, callback);
  });
}

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
THREE.ShaderChunk.fog_fragment;
scene.fog = new THREE.FogExp2(0xffffff, 0.04);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

loadModel('treeDecorated.obj', 'treeDecorated.mtl', (obj) => {
  obj.position.y = 0.25;
  obj.traverse((child) => {
    child.castShadow = true;
    child.receiveShadow = true;
  });
  scene.add(obj);
});

loadModel('trainLocomotive.obj', 'trainLocomotive.mtl', (obj) => {
  for (let i = 0; i < 10; i++) {
    obj.traverse((child) => {
      if (child.isMesh) {
        const geo = child.geometry;
        const mat = child.material;
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        mesh.userData.angle = 0;
        mesh.userData.radius = 2 + (i + 1);
        mesh.userData.speed = 50 + Math.random() * 50;
        mesh.userData.update = (elapsedTime) => {
          mesh.position.y = 0;
          mesh.userData.angle += mesh.userData.speed * elapsedTime;
          mesh.position.x =
            Math.cos(mesh.userData.angle * rad) * mesh.userData.radius;
          mesh.position.z =
            Math.sin(mesh.userData.angle * rad) * -mesh.userData.radius;
          mesh.rotation.y = Math.PI / 2 + mesh.userData.angle * rad;
        };

        scene.add(mesh);
      }
    });
  }
});

loadModel('treePineSnow.obj', 'treePineSnow.mtl', (obj) => {
  for (let i = 0; i < 50; i++) {
    obj.traverse((child) => {
      if (child.isMesh) {
        const geo = child.geometry;
        const mat = child.material;
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.randomDirection().multiply(new THREE.Vector3(15, 0, 15));
        mesh.position.x =
          Math.abs(mesh.position.x) < 3
            ? mesh.position.x > 0
              ? 4
              : -4
            : mesh.position.x;
        scene.add(mesh);
      }
    });
  }
});

loadModel('presentGreen.obj', 'presentGreen.mtl', (obj) => {
  for (let i = 0; i < 10; i++) {
    const position = new THREE.Vector3().randomDirection().multiplyScalar(1.5);
    obj.traverse((child) => {
      if (child.isMesh) {
        const geo = child.geometry;
        const mat = child.material;
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.set(position.x, 0.25, position.z);
        scene.add(mesh);
      }
    });
  }
});

const sphereGeo = new THREE.SphereGeometry(
  2,
  64,
  64,
  0,
  Math.PI * 2,
  0,
  Math.PI / 1.5
);
const sphereMat = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  transmission: 1,
  thickness: 1,
  clearcoat: 1,
  roughness: 0,
  ior: 1,
  specularIntensity: 1.7,
});
const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
sphereMesh.position.y = 1.1;
scene.add(sphereMesh);

const baseGeo = new THREE.CylinderGeometry(2.1, 2.2, 0.25, 64);
const baseMat = new THREE.MeshPhongMaterial({ color: 0xffff00 });
const baseMesh = new THREE.Mesh(baseGeo, baseMat);
baseMesh.castShadow = true;
baseMesh.receiveShadow = true;
baseMesh.position.y = 0.125;
scene.add(baseMesh);

const groundGeo = new THREE.PlaneGeometry(32, 32);
const groundMat = new THREE.MeshPhongMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
});
const groundMesh = new THREE.Mesh(groundGeo, groundMat);
groundMesh.receiveShadow = true;
groundMesh.rotation.x = Math.PI / -2;
scene.add(groundMesh);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(2, 2, 2);
directionalLight.castShadow = true;
directionalLight.shadow.bias = 0.001;
directionalLight.shadow.camera.near = 0.1;
directionalLight.shadow.camera.far = 25;
directionalLight.shadow.mapSize.width = 512;
directionalLight.shadow.mapSize.height = 512;
scene.add(directionalLight);

const hemisphereLight = new THREE.HemisphereLight(0x000088, 0x000000, 1);
scene.add(hemisphereLight);

const ambientLight = new THREE.AmbientLight(0x0000ff);
scene.add(ambientLight);

camera.position.z = 10;
camera.position.y = 2;

document.body.appendChild(renderer.domElement);

for (let i = 0; i < 1000; i++) {
  const radius = Math.random() * 0.04;
  const geo = new THREE.IcosahedronGeometry(radius, 0);

  const mat = new THREE.MeshPhongMaterial({
    color: 0xffffff,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  mesh.userData.radius = radius;
  mesh.userData.update = (delta) => {
    mesh.position.y -= delta * mesh.userData.radius * 50;
    mesh.position.x += delta * mesh.userData.radius * Math.random() * 50;
    if (mesh.position.y < radius) {
      mesh.position.randomDirection().multiply(new THREE.Vector3(15, 15, 15));
      mesh.position.y = Math.abs(mesh.position.y);
      mesh.userData.radius = Math.random() * 0.04;
    }
  };
  scene.add(mesh);
}

const clock = new THREE.Clock();
const orbitControl = new OrbitControls(camera, renderer.domElement);

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  scene.children.forEach((e) => {
    if (e.userData.update != null) {
      e.userData.update(delta);
    }
  });
  renderer.render(scene, camera);
}

animate();
