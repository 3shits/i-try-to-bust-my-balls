import * as THREE from "three";

const clock = new THREE.Clock();

type updtFn = (dt: number) => void;

export const AnimationLoop = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  update: updtFn
) => {
  function animate() {
    const dt = clock.getDelta();
    update(dt);
    renderer.render(scene, camera);
  }
  renderer.setAnimationLoop(animate);
};
