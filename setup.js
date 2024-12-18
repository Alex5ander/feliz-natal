import * as THREE from 'three';
export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
export const renderer = new THREE.WebGLRenderer();
