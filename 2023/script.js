import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

const rad = Math.PI / 180;
const randomBetween = (min, max) => min + Math.round((max - min) * Math.random());
const clock = new THREE.Clock();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xffffff, 1, 100);

const orbitControl = new OrbitControls(camera, renderer.domElement);

const loadModel = (model, mtl, callback) => {
  const loaderMTL = new MTLLoader();
  const loaderObj = new OBJLoader();

  loaderMTL.load(mtl, (e) => {
    e.preload();
    loaderObj.setMaterials(e);
    loaderObj.load(model, callback);
  });
}

loadModel('/trainLocomotive.obj', '/trainLocomotive.mtl', (obj) => {
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

loadModel('/treePineSnow.obj', '/treePineSnow.mtl', (obj) => {
  const count = 50;
  const { geometry, material } = obj.children[0]
  const mesh = new THREE.InstancedMesh(geometry, material, count)

  for (let i = 0; i < count; i++) {
    obj.traverse((child) => {
      if (child.isMesh) {
        const matrix = new THREE.Matrix4();
        matrix.setPosition(randomBetween(-14, 14), 0, randomBetween(-14, 14));
        mesh.setMatrixAt(i, matrix);
      }
    });
  }
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.instanceMatrix.needsUpdate = true;
  scene.add(mesh);
});

const createSnowGlobe = () => {
  const geometry = new THREE.SphereGeometry(2, 64, 64, 0, Math.PI * 2, 0, Math.PI / 1.5);

  const material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transmission: 1,
    thickness: 1,
    clearcoat: 1,
    roughness: 0,
    ior: 2.5,
    specularIntensity: 1.7,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.y = 1.5;
  scene.add(mesh);

  {
    // create base
    const geometry = new THREE.CylinderGeometry(2, 2.2, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0xffff00 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.y = 0;
    scene.add(mesh);
  }

  loadModel('/treeDecorated.obj', '/treeDecorated.mtl', (obj) => {
    obj.position.y = 0.5;
    obj.traverse((child) => {
      child.castShadow = true;
      child.receiveShadow = true;
    });
    scene.add(obj);
  });

  loadModel('/presentGreen.obj', '/presentGreen.mtl', (obj) => {
    for (let i = 0; i < 10; i++) {
      const position = new THREE.Vector3().randomDirection().multiplyScalar(1.5);
      obj.traverse((child) => {
        if (child.isMesh) {
          const geo = child.geometry;
          const mat = child.material;
          const mesh = new THREE.Mesh(geo, mat);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          mesh.position.set(position.x, 0.5, position.z);
          scene.add(mesh);
        }
      });
    }
  });
}

const createFloor = () => {
  const geometry = new THREE.PlaneGeometry(32, 32);
  const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  mesh.rotation.x = Math.PI / -2;
  scene.add(mesh);
}

const setupLight = () => {

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);

  const shadowCameraSize = 32;

  directionalLight.position.set(0, 32, -32);
  directionalLight.castShadow = true;
  directionalLight.shadow.bias = 0.00001;
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

  const ambientLight = new THREE.AmbientLight(0x0000ff);
  scene.add(ambientLight);
}

camera.position.z = 10;
camera.position.y = 2;

const createSnowFlakes = () => {
  const min = -16;
  const max = 16;
  const count = 1000;

  const geometry = new THREE.IcosahedronGeometry(1, 0);
  const material = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0, metalness: 0, reflectivity: 2, transmission: 2, ior: 2 });
  const mesh = new THREE.InstancedMesh(geometry, material, count);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  for (let i = 0; i < count; i++) {
    const radius = Math.random() * 0.05;
    const coords = [randomBetween(min, max), randomBetween(0, 50), randomBetween(min, max)];
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
      const position = new THREE.Vector3();
      const rotation = new THREE.Quaternion();
      const scale = new THREE.Vector3();
      matrix.decompose(position, rotation, scale);

      position.x += delta * randomBetween(-2, 2);
      position.y -= delta * scale.x * 250;
      position.z += delta * randomBetween(-2, 2);

      const coords = [randomBetween(min, max), randomBetween(20, 50), randomBetween(min, max)];
      if (position.y + scale.y / 2 < 0) {
        position.set(...coords);
      }
      matrix.setPosition(position);
      mesh.setMatrixAt(i, matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  }
}

setupLight();
createFloor();
createSnowGlobe();
createSnowFlakes();

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