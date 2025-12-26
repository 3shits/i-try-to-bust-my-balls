import {
  LoopRepeat,
  type AnimationAction,
  type AnimationClip,
  AnimationMixer,
  type Object3D,
  Vector3,
  MathUtils,
} from "three";
import { gameProperties } from "../core/properties";
import { getMovementAxis, isPetPressed } from "../core/input";

type PetStates = "walk" | "pet" | "idle";

export class Pet {
  object: Object3D;
  player: Object3D;
  animations: AnimationClip[];
  mixer: AnimationMixer;
  speed = gameProperties.pet.moveSpeed;
  IdleAction: AnimationAction;
  PetAction: AnimationAction;
  WalkAction: AnimationAction;
  activeAction: AnimationAction;
  activeState: PetStates = "idle";
  private distance = 1.5;

  constructor(object: Object3D, player: Object3D, animations: AnimationClip[]) {
    this.object = object;
    this.player = player;
    this.animations = animations;
    this.mixer = new AnimationMixer(this.object);
    this.PetAction = this.mixer.clipAction(this.animations[0]);
    this.PetAction.setEffectiveTimeScale(0.3);
    this.PetAction.setLoop(LoopRepeat, 1);
    this.WalkAction = this.mixer.clipAction(this.animations[4]);
    this.WalkAction.setLoop(LoopRepeat, Infinity);
    this.IdleAction = this.mixer.clipAction(this.animations[2]);
    this.IdleAction.setLoop(LoopRepeat, Infinity);
    this.activeAction = this.IdleAction;
    this.activeAction.play();
    this.object.scale.set(0.2, 0.2, 0.2);
    this.mixer.addEventListener("finished", () => {
      if (this.activeState === "pet") {
        this.activeState = "idle";
        this.switchAnimations(this.activeState);
      }
    });
  }

  switchAnimations(state: PetStates) {
    let nextAction: AnimationAction;
    switch (state) {
      case "walk":
        nextAction = this.WalkAction;
        break;
      case "pet":
        nextAction = this.PetAction;
        break;
      case "idle":
        nextAction = this.IdleAction;
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

  getMixer() {
    return this.mixer;
  }

  update(dt: number) {
    if (this.activeState === "pet") {
      this.mixer.update(dt);
      return;
    }
    let nextState: PetStates = "idle";

    const playerPos = new Vector3();
    const objectPos = new Vector3();
    this.player.getWorldPosition(playerPos);
    this.object.getWorldPosition(objectPos);
    const angle = this.player.rotation.y;
    playerPos.set(
      playerPos.x - this.distance * Math.cos(-angle),
      playerPos.y,
      playerPos.z - this.distance * Math.sin(-angle)
    );

    this.object.position.lerp(playerPos, 9 * dt);

    this.object.rotation.y = MathUtils.lerp(this.object.rotation.y, angle, 0.5);
    const { x: X, z: Z } = getMovementAxis();
    if (X !== 0 || Z !== 0) nextState = "walk";
    else nextState = "idle";

    if (isPetPressed()) {
      nextState = "pet";
      this.player.rotation.y -= Math.PI / 2;
      this.object.rotation.y += Math.PI / 2;
    }

    if (nextState !== this.activeState) {
      this.activeState = nextState;
      this.switchAnimations(this.activeState);
    }

    this.mixer.update(dt);
  }
}
