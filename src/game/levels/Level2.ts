import {
  AnimationAction,
  AnimationMixer,
  Audio,
  AudioListener,
  Color,
  Vector3,
  type Group,
  type Scene,
} from "three";
import { Level } from "./Level";
import type { BaseScene } from "../scenes/BaseScene";
import { TunnelScene } from "../scenes/TunnelScene";
import type { Player } from "../Player";
import { Trigger } from "../Trigger";
import { loadAudio, loadGLTF } from "../../core/assets";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { CameraSystem } from "../CameraSystem";
import { gameProperties } from "../../core/properties";
import { isKeyDown } from "../../core/input";
import type { GameLevel } from "../LevelManager";
import { showObjective } from "../../UI";

export class Level2 extends Level {
  world!: Group;
  gameScene: BaseScene;
  player!: Player;
  boss!: GLTF;
  playerBounds = { x1: -4, x2: 4, y: 100, z1: -15, z2: 272 };
  camera!: CameraSystem;
  startChaseTrigger!: Trigger;
  endChaseTrigger!: Trigger;
  tpTrigger!: Trigger;
  switchLevelTrigger!: Trigger;
  action!: AnimationAction;
  mixer!: AnimationMixer;
  tp!: GLTF;
  switchLevel: (next: GameLevel) => Promise<void>;
  time = 0;
  tpSpeed = 1;
  tpAmp = 0.7;
  tpPos = 3;
  gotTp = false;
  loaded = false;
  audio!: Audio;
  cheeseAudio!: Audio;
  listener = new AudioListener();
  constructor(scene: Scene, switchLevel: (next: GameLevel) => Promise<void>) {
    scene.background = new Color(0x000000);
    super(new Vector3(0, 0, -14), scene);
    this.switchLevel = switchLevel;
    this.gameScene = new TunnelScene(this.scene);
    this.world = this.gameScene.getEnvironment();
  }

  checkPlayerBounds() {
    if (this.player.object.position.x < this.playerBounds.x1)
      this.player.object.position.x = this.playerBounds.x1;
    if (this.player.object.position.x > this.playerBounds.x2)
      this.player.object.position.x = this.playerBounds.x2;
    if (this.player.object.position.y > this.playerBounds.y)
      this.player.object.position.y = this.playerBounds.y;
    if (this.player.object.position.z < this.playerBounds.z1)
      this.player.object.position.z = this.playerBounds.z1;
    if (this.player.object.position.z > this.playerBounds.z2)
      this.player.object.position.z = this.playerBounds.z2;
  }

  startChase() {
    showObjective("RUN!");
    this.audio.play();
    this.cheeseAudio.play();
    this.boss.scene.position.copy(
      this.player.object.position.clone().sub(new Vector3(0, 1.5, 20))
    );
    this.boss.scene.scale.set(5, 5, 5);
    this.action = this.mixer.clipAction(this.boss.animations[4]);
    this.action.play();
    this.player.switchControls();
    this.camera.InvertControls();
    this.scene.add(this.boss.scene);
  }

  endChase() {
    showObjective("Get the Toilet Paper");
    this.audio.stop();
    this.cheeseAudio.stop();
    this.action.stop();
    this.boss.scene.position.z = 164;
    this.action = this.mixer.clipAction(this.boss.animations[0]);
    this.action.setEffectiveTimeScale(0.5);
    this.action.play();
    this.player.switchControls();
    this.camera.InvertControls();
    this.scene.background = new Color(0x86ceee);
    this.playerBounds.x1 = -100;
    this.playerBounds.x2 = 100;
  }

  setTriggers() {
    this.startChaseTrigger = new Trigger(
      new Vector3(1, 0, -2),
      new Vector3(10, 10, 2),
      () => {
        console.log("chase started");
        this.startChase();
      }
    );
    this.endChaseTrigger = new Trigger(
      new Vector3(0, 0, 165),
      new Vector3(10, 10, 2),
      () => {
        console.log("chase end");
        this.endChase();
      }
    );
    this.tpTrigger = new Trigger(
      this.tp.scene.position.clone(),
      new Vector3(3, 4, 3),
      () => {
        showObjective("Press E to get TP");
        if (isKeyDown("KeyE")) {
          this.gotTp = true;
        } else this.tpTrigger.triggered = false;
      }
    );

    this.switchLevelTrigger = new Trigger(
      new Vector3(0, 0, 270),
      new Vector3(10, 10, 5),
      () => {
        this.switchLevel(3);
      }
    );
  }

  setCameraSystem(camera: CameraSystem) {
    this.camera = camera;
  }
  setPlayer(player: Player) {
    this.player = player;
  }
  getGravitySource() {
    return 5;
  }
  getEnvironment() {
    return this.world;
  }
  updateTpPosition() {
    this.tp.scene.position.y =
      this.tpPos + Math.sin(this.time * this.tpSpeed) * this.tpAmp;
  }
  async load() {
    await this.gameScene.load();
    this.boss = await loadGLTF("/models/boss.glb");
    this.mixer = new AnimationMixer(this.boss.scene);

    this.scene.add(this.world);
    this.tp = await loadGLTF("/models/tp.glb");
    this.tp.scene.position.z = 260;
    this.tp.scene.position.y = 2;
    this.scene.add(this.tp.scene);
    this.setTriggers();
    showObjective("Explore the Cave");
    this.audio = await loadAudio("/sounds/level2.mp3", this.listener);
    this.cheeseAudio = await loadAudio("/sounds/cheese.mp3", this.listener);
    this.cheeseAudio.setLoop(true);
    this.loaded = true;
  }

  update(dt: number) {
    this.time += dt;
    if (!this.loaded) return;
    if (this.player) {
      this.checkPlayerBounds();
    }
    this.startChaseTrigger.update(this.player.object.position);
    if (
      this.scene.children.includes(this.boss.scene) &&
      !this.endChaseTrigger.triggered
    ) {
      this.boss.scene.position.z += gameProperties.boss.moveSpeed * dt;
    }

    if (this.mixer) this.mixer.update(dt);
    if (this.startChaseTrigger.triggered) {
      const p = this.boss.scene.position.clone();
      p.y = 0;
      this.endChaseTrigger.update(p);
    }
    if (this.endChaseTrigger.triggered && !this.gotTp) {
      this.tpTrigger.update(this.player.object.position);
      this.updateTpPosition();
    }
    if (this.gotTp) {
      this.tp.scene.position.lerp(
        this.player.object.position.clone().add(new Vector3(0, 1, -0.5)),
        dt * 10
      );
      this.switchLevelTrigger.update(this.player.object.position);
    }
  }

  end() {
    this.gameScene.dispose();
  }
}
