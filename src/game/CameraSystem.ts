import {
  AnimationMixer,
  Vector3,
  type Object3D,
  type PerspectiveCamera,
} from "three";
import { gameProperties } from "../core/properties";
import { isPetPressed } from "../core/input";

export class CameraSystem {
  camera: PerspectiveCamera;
  cameraOn = true;
  mixer: AnimationMixer;
  back = true;
  private player: Object3D;
  private offset = new Vector3(
    0,
    gameProperties.camera.height,
    gameProperties.camera.distance
  );
  private lerp = 10;
  bossFightCam = false;
  constructor(
    camera: PerspectiveCamera,
    player: Object3D,
    mixer: AnimationMixer
  ) {
    this.camera = camera;
    this.player = player;
    this.mixer = mixer;

    this.mixer.addEventListener("finished", () => {
      this.cameraOn = true;
    });
  }

  setBossFightCam(value: boolean) {
    this.bossFightCam = value;
  }
  InvertControls() {
    this.back = !this.back;
  }

  update(dt: number) {
    if (this.cameraOn) {
      const targetPos = new Vector3();
      this.player.getWorldPosition(targetPos);
      if (!this.bossFightCam) {
        this.cameraOn = true;
        const forward = new Vector3(0, 0, this.back ? -1 : 1.5);
        forward.applyQuaternion(this.player.quaternion);
        const desired = targetPos
          .clone()
          .add(new Vector3().copy(forward).multiplyScalar(this.offset.z))
          .add(new Vector3(0, this.offset.y, 0));

        this.camera.position.lerp(desired, this.lerp * dt);
      } else {
        this.camera.position.y = this.player.position.y + this.offset.y;
        this.camera.position.z = this.player.position.z - this.offset.z;
        this.camera.position.x = this.player.position.x;
      }
      this.camera.lookAt(targetPos);
    }
    if (isPetPressed()) {
      this.cameraOn = false;
      return;
    }
  }
}
