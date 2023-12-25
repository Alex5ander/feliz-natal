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
    loaderObj.load(
      model,
      /** @param {THREE.Group} obj  */
      function (obj) {
        callback(obj);
      }
    );
  });
}

loadModel('treeDecorated.obj', 'treeDecorated.mtl', (obj) => {
  obj.scale.multiplyScalar(3);
  scene.add(obj);
});

loadModel('trainLocomotive.obj', 'trainLocomotive.mtl', (obj) => {
  obj.scale.multiplyScalar(2);
  obj.name = 'train';
  obj.userData.angle = 0;
  obj.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  obj.userData.update = (elapsedTime) => {
    obj.position.y = 0;
    obj.userData.angle += 50 * elapsedTime;
    obj.position.x = Math.cos(obj.userData.angle * rad) * 27;
    obj.position.z = Math.sin(obj.userData.angle * rad) * -27;
    obj.rotation.y = Math.PI / 2 + obj.userData.angle * rad;
  };
  scene.add(obj);
});

loadModel('presentGreen.obj', 'presentGreen.mtl', (obj) => {
  for (let i = 0; i < 100; i++) {
    const position = new THREE.Vector3().randomDirection().multiplyScalar(25);
    obj.traverse((child) => {
      if (child.isMesh) {
        const geo = child.geometry;
        const mat = child.material;
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.set(position.x, 0, position.z);
        scene.add(mesh);
      }
    });
  }
});

loadModel('rockFormationLarge.obj', 'rockFormationLarge.mtl', (obj) => {
  for (let i = 0; i < 50; i++) {
    const position = new THREE.Vector3().randomDirection().multiplyScalar(25);
    obj.traverse((child) => {
      if (child.isMesh) {
        const geo = child.geometry;
        const mat = child.material;
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.set(position.x, 0, position.z);
        scene.add(mesh);
      }
    });
  }
});

loadModel('treePineSnow.obj', 'treePineSnow.mtl', (obj) => {
  for (let i = 0; i < 100; i++) {
    const position = new THREE.Vector3().randomDirection().multiplyScalar(25);
    obj.traverse((child) => {
      if (child.isMesh) {
        const geo = child.geometry;
        const mat = child.material;
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.set(position.x, 0, position.z);
        scene.add(mesh);
      }
    });
  }
});

loadModel('snowPatch.obj', 'snowPatch.mtl', (obj) => {
  for (let i = 0; i < 200; i++) {
    const position = new THREE.Vector3().randomDirection().multiplyScalar(25);
    obj.traverse((child) => {
      if (child.isMesh) {
        const geo = child.geometry;
        const mat = child.material;
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.set(position.x, 0, position.z);
        scene.add(mesh);
      }
    });
  }
});

loadModel('snowmanFancy.obj', 'snowmanFancy.mtl', (obj) => {
  for (let i = 0; i < 100; i++) {
    const position = new THREE.Vector3().randomDirection().multiplyScalar(25);
    obj.traverse((child) => {
      if (child.isMesh) {
        const geo = child.geometry;
        const mat = child.material;
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.set(position.x, 0, position.z);
        mesh.name = 'snowman';
        mesh.userData.angle = 1;
        mesh.userData.update = (elapsedTime) => {
          mesh.userData.angle += 300 * elapsedTime;
          mesh.rotation.z = Math.cos(mesh.userData.angle * rad) / 4;
          mesh.rotation.y = Math.cos(mesh.userData.angle * rad) / 4;
        };
        scene.add(mesh);
      }
    });
  }
});

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xffffff, 10, 75);
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const planeGeometry = new THREE.CircleGeometry(28);
const planeMaterial = new THREE.MeshStandardMaterial({
  color: 0x9bb6bd,
  side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.receiveShadow = true;
plane.rotateX(Math.PI / -2);
scene.add(plane);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(2, 2, 2);
directionalLight.castShadow = true;
directionalLight.shadow.camera.near = 0.1;
directionalLight.shadow.camera.far = 25;
scene.add(directionalLight);

const hemisphereLight = new THREE.HemisphereLight(0x000088, 0x000000, 1);
scene.add(hemisphereLight);

camera.position.z = 25;
camera.position.y = 2;

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

for (let i = 0; i < 1000; i++) {
  const geo = new THREE.SphereGeometry(Math.random() * 0.3);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  const initial = new THREE.Vector3().random().multiplyScalar(50).subScalar(25);
  initial.y += 100;
  mesh.position.set(initial.x, initial.y, initial.z);
  mesh.userData.initial = initial;
  mesh.userData.velocity = new THREE.Vector3().randomDirection();
  mesh.userData.update = () => {
    mesh.userData.velocity.y =
      mesh.userData.velocity.y > 0
        ? -mesh.userData.velocity.y
        : mesh.userData.velocity.y;
    mesh.position.add(mesh.userData.velocity);
    if (mesh.position.y < -2) {
      mesh.position.set(
        mesh.userData.initial.x,
        mesh.userData.initial.y,
        mesh.userData.initial.z
      );
      mesh.userData.velocity.randomDirection();
    }
  };
  scene.add(mesh);
  mesh.name = 'snow';
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
