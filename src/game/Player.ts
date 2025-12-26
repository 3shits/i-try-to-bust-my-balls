import {
  AnimationAction,
  AnimationClip,
  LoopRepeat,
  MathUtils,
  AnimationMixer,
  type Object3D,
  Vector3,
  LoopOnce,
} from "three";
import { gameProperties } from "../core/properties";
import { getMovementAxis, isJumping, isPetPressed } from "../core/input";

type PlayerStates = "idle" | "walk" | "pet" | "jump";

export class Player {
  object: Object3D;
  notInverted = true;
  mixer: AnimationMixer;
  animations: AnimationClip[];
  speed = gameProperties.player.moveSpeed;
  rotSpeed = gameProperties.player.rotSpeed;
  WalkAction: AnimationAction;
  IdleAction: AnimationAction;
  PetAction: AnimationAction;
  JumpAction: AnimationAction;
  activeAction: AnimationAction;
  bossFightControls = false;
  private activeState?: PlayerStates;
  private velY = 0;
  private isGrounded = false;
  private getGroundHeight: (x: number, y: number) => number;
  constructor(
    object: Object3D,
    getGroundheight: (x: number, y: number) => number,
    animations: AnimationClip[]
  ) {
    this.object = object;

    this.getGroundHeight = getGroundheight;
    this.animations = animations;
    this.mixer = new AnimationMixer(this.object);
    this.WalkAction = this.mixer.clipAction(this.animations[16]);
    this.WalkAction.setLoop(LoopRepeat, Infinity);
    this.IdleAction = this.mixer.clipAction(this.animations[4]);
    this.IdleAction.setLoop(LoopRepeat, Infinity);
    this.PetAction = this.mixer.clipAction(this.animations[10]);
    this.PetAction.setLoop(LoopRepeat, 2);
    this.PetAction.clampWhenFinished = true;
    this.JumpAction = this.mixer.clipAction(this.animations[15]);
    this.JumpAction.setLoop(LoopOnce, 1);
    this.JumpAction.clampWhenFinished = true;
    this.activeAction = this.IdleAction;
    this.activeAction.play();
    this.activeState = "idle";
    this.mixer.addEventListener("finished", () => {
      if (this.activeState === "pet") {
        this.activeState = "idle";
        this.switchAnimation(this.activeState);
      }
      if (this.activeState === "jump") {
        this.activeState = "walk";
        this.switchAnimation(this.activeState);
      }
    });
  }
  setGroundRaycast(getGroundHeight: (x: number, y: number) => number) {
    this.getGroundHeight = getGroundHeight;
  }
  setBossFightControls(value: boolean) {
    this.bossFightControls = value;
  }
  switchControls() {
    this.notInverted = !this.notInverted;
  }

  switchAnimation(state: PlayerStates) {
    let nextAction: AnimationAction;

    switch (state) {
      case "walk":
        nextAction = this.WalkAction;
        break;
      case "pet":
        nextAction = this.PetAction;
        break;
      case "jump":
        nextAction = this.JumpAction;
        break;
      default:
        nextAction = this.IdleAction;
    }

    if (this.activeAction === nextAction) return;
    nextAction.reset();
    nextAction.play();

    this.activeAction.crossFadeTo(nextAction, 0.3, false);
    this.activeAction = nextAction;
  }

  update(dt: number) {
    ///movement
    const { x: intX, z: intZ } = getMovementAxis();
    let nextState: PlayerStates = "idle";
    let direction = new Vector3();
    if ((intX !== 0 || intZ !== 0) && this.activeState !== "pet") {
      nextState = "walk";
      const moveX = (this.notInverted ? 1 : -1) * intX * this.rotSpeed * dt;
      const moveZ = intZ * this.speed * dt;
      if (!this.bossFightControls) {
        const rotation = this.object.rotation.y - moveX;
        this.object.rotation.y = MathUtils.lerp(
          this.object.rotation.y,
          rotation,
          0.2
        );
        this.object.getWorldDirection(direction);
        this.object.position.addScaledVector(direction, -moveZ);
      } else {
        const movingX = intX * this.speed * dt;
        if (movingX) {
          this.object.rotation.y = -intX;
          this.object.position.x -= movingX;
        }
        if (moveZ) {
          this.object.rotation.y = 0;
          this.object.position.z -= moveZ;
        }
      }
    } else if (isPetPressed()) {
      nextState = "pet";
    }
    if (isJumping()) {
      nextState = "jump";
      const lerp = 1.2;
      const jumpVector =
        this.object.position.y + gameProperties.player.jumpStrength;
      this.object.position.y = MathUtils.lerp(
        this.object.position.y,
        jumpVector,
        dt * lerp
      );
    }
    // animation
    if (this.activeState === "pet") {
      this.mixer.update(dt);
      return;
    }
    if (this.activeState === "jump") {
      this.mixer.update(dt);
    } else if (nextState !== this.activeState) {
      this.activeState = nextState;
      this.switchAnimation(this.activeState);
    }

    ///Gravity
    const gravity = gameProperties.gravity;
    if (!this.isGrounded) {
      this.velY += gravity * dt;
    }
    this.object.position.y += this.velY * dt;
    const px = this.object.position.x;
    const pz = this.object.position.z;
    let groundHeight = this.getGroundHeight(px, pz);
    if (groundHeight !== -Infinity) {
      if (this.object.position.y <= groundHeight) {
        this.object.position.y = MathUtils.lerp(
          this.object.position.y,
          groundHeight,
          0.1
        );
        this.velY = 0;
        this.isGrounded = true;
      } else {
        this.isGrounded = false;
      }
    } else {
      this.isGrounded = false;
    }
    this.mixer.update(dt);
  }
}
