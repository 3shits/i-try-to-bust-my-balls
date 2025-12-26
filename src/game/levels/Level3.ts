import {
  Group,
  AnimationAction,
  AnimationMixer,
  Scene,
  Color,
  Vector3,
  MathUtils,
  Object3D,
  Box3,
  LoopOnce,
  LoopRepeat,
  Audio,
  AudioListener,
} from "three";
import type { GLTF } from "three/examples/jsm/Addons.js";
import type { CameraSystem } from "../CameraSystem";
import type { Player } from "../Player";
import type { BaseScene } from "../scenes/BaseScene";
import { Level } from "./Level";
import { FieldScene } from "../scenes/FieldScene";
import { loadAudio, loadGLTF } from "../../core/assets";
import { Trigger } from "../Trigger";
import { CheeseMissile } from "../CheeseMissile";
import { TpMissile } from "../TpMissile";
import { gameProperties } from "../../core/properties";
import { showObjective } from "../../UI";

export class Level3 extends Level {
  bossSet = false;
  world!: Group;
  worldBox!: Box3;
  worldBoxBounds = {
    min: new Vector3(-20, 30, -40),
    max: new Vector3(20, 35, 40),
  };
  gameScene: BaseScene;
  time = 0;
  robot!: GLTF;
  RobotMixer!: AnimationMixer;
  robotBoxTrigger!: Trigger;
  action!: AnimationAction;
  player!: Player;
  scaleVector = new Vector3(1, 1, 1);
  boss!: GLTF;
  bossHp = 9;
  flowers: Object3D[] = [];
  flowersModels = new Group();
  flowerCount = 300;
  camera!: CameraSystem;
  cheese!: CheeseMissile;
  Bossmixer!: AnimationMixer;
  bossAction!: AnimationAction;
  bossFightTrigger!: Trigger;
  bossHpTrigger!: Box3;
  startBattle = false;
  endTpSequence = false;
  initiateBattle = true;
  loaded = false;
  isReloading = false;
  growflowers = false;
  playerBounds = { z1: 1, z2: 32 };
  bossHealth = 100;
  tp!: TpMissile;
  vizTp!: Object3D;
  count = 0;
  giveTp = false;
  bossAudio!: Audio;
  winAudio!: Audio;
  listener = new AudioListener();
  constructor(scene: Scene) {
    scene.background = new Color(0x86ceee);
    super(new Vector3(7, 32, -55), scene);
    this.gameScene = new FieldScene(this.scene);
    this.world = this.gameScene.getEnvironment();
  }

  setCameraSystem(camera: CameraSystem) {
    this.camera = camera;
  }
  setPlayer(player: Player) {
    this.player = player;
  }
  getGravitySource() {
    return 50;
  }
  getEnvironment() {
    return this.world;
  }
  SpawnBoss() {
    this.scene.add(this.boss.scene);
    this.boss.scene.position.set(13, 24, 50);
    this.boss.scene.scale.set(3, 3, 3);
    this.boss.scene.rotation.y += Math.PI;
    this.boss.scene.rotation.x += Math.PI / 2;
  }
  setTriggers() {
    this.bossFightTrigger = new Trigger(
      new Vector3(8, 30, 16),
      new Vector3(100, 50, 5),
      () => {
        console.log("boss fight");
        this.SpawnBoss();
        this.bossAction = this.Bossmixer.clipAction(this.boss.animations[0]);
        this.bossAction.play();
      }
    );
  }

  checkPlayerBounds() {
    if (this.player.object.position.z < this.playerBounds.z1)
      this.player.object.position.z = this.playerBounds.z1;
    if (this.player.object.position.z > this.playerBounds.z2)
      this.player.object.position.z = this.playerBounds.z2;
  }
  startBossBattle(dt: number) {
    if (this.boss.scene.position.y > 30.5) {
      this.startBattle = true;
    }
    if (this.boss.scene.position.y > 30.5 && !this.bossSet) {
      this.bossHpTrigger.setFromObject(this.boss.scene);
      this.bossSet = true;
    }
    if (this.startBattle) {
      showObjective("Press Mouse Button to Throw TP");

      this.player.setBossFightControls(true);
      this.camera.setBossFightCam(true);
      this.boss.scene.lookAt(
        new Vector3(
          this.player.object.position.x,
          32,
          this.player.object.position.z
        )
      );

      this.checkPlayerBounds();
      const playerPos = new Vector3();
      this.player.object.getWorldPosition(playerPos);
      if (!this.isReloading) {
        this.cheese.spawn(this.boss.scene.position, playerPos);
        this.isReloading = true;
      }
      if (this.cheese.getFinished()) this.isReloading = false;
      // console.log(this.cheese.cheese);

      this.tp.update(
        dt,
        this.boss.scene.position,
        playerPos,
        this.bossHpTrigger
      );
      this.cheese.update(dt, this.player.object.position);
    }
  }

  async load() {
    await this.gameScene.load();
    this.worldBox = new Box3(this.worldBoxBounds.min, this.worldBoxBounds.max);
    this.boss = await loadGLTF("models/boss.glb");
    this.Bossmixer = new AnimationMixer(this.boss.scene);
    this.scene.add(this.world);
    this.setTriggers();
    this.cheese = new CheeseMissile(this.scene);
    await this.cheese.load();
    this.tp = new TpMissile(this.scene);
    await this.tp.load(this.player.object.position);
    this.vizTp = (await loadGLTF("models/tp.glb")).scene;
    this.vizTp.scale.set(0.6, 0.6, 0.6);
    this.scene.add(this.vizTp);
    this.bossHpTrigger = new Box3();
    this.flowers.push(
      (await loadGLTF("models/sunflower.glb")).scene,
      (await loadGLTF("models/tulip.glb")).scene
    );
    this.robot = await loadGLTF("models/robot.glb");
    this.robot.scene.scale.set(0.8, 0.8, 0.8);
    this.robot.scene.position.set(13, 32, 53.5);
    this.robot.scene.rotation.y += Math.PI;
    this.RobotMixer = new AnimationMixer(this.robot.scene);
    this.bossAudio = await loadAudio("sounds/level3.mp3", this.listener);
    this.bossAudio.play();
    this.winAudio = await loadAudio("sounds/win.mp3", this.listener);
    this.winAudio.setLoop(true);
    this.scene.add(this.robot.scene);
    this.robotBoxTrigger = new Trigger(
      this.robot.scene.position,
      new Vector3(5, 5, 5),
      () => {
        this.bossAudio.stop();
        this.winAudio.play();
        this.giveTp = true;
        showObjective("You Won!!");
        setTimeout(() => {
          showObjective("Happy Birthday NOOB \nI LOVE YOU.", true);
        }, 10000);
      }
    );
    this.configureFlowers();
    showObjective("Approach Robot");
    this.loaded = true;
  }

  configureFlowers() {
    gameProperties.flowerPos.forEach((f) => {
      let temp_flow = this.flowers[f[2]].clone();
      temp_flow.position.set(f[0], 32, f[1]);
      temp_flow.scale.set(0, 0, 0);
      this.flowersModels.add(temp_flow);
    });
    this.scene.add(this.flowersModels);
  }
  BattleManager(dt: number) {
    if (this.count <= this.bossHp && this.initiateBattle)
      this.startBossBattle(dt);
    else if (this.initiateBattle) {
      this.scene.remove(this.cheese.cheese);
      this.bossAction.stop();
      this.bossAction = this.Bossmixer.clipAction(this.boss.animations[1]);
      this.bossAction.reset();
      this.bossAction.setLoop(LoopOnce, 1);
      this.bossAction.play();
      this.bossAction.clampWhenFinished = true;
      this.boss.scene.position.z -= 5;

      this.player.setBossFightControls(false);
      this.camera.setBossFightCam(false);
      this.initiateBattle = false;
      this.endTpSequence = true;
    }

    if (this.count !== this.tp.count) {
      this.count = this.tp.count;
    }
  }

  BossEntrySequence(dt: number) {
    if (this.bossFightTrigger.triggered && !this.startBattle) {
      showObjective("Defeat the Rat");
      this.boss.scene.position.y = MathUtils.lerp(
        this.boss.scene.position.y,
        31,
        dt
      );
      this.boss.scene.rotation.x = MathUtils.lerp(
        this.boss.scene.rotation.x,
        0,
        dt
      );
    }
  }

  ToiletAmmoFollower(dt: number) {
    if (!this.giveTp) {
      this.vizTp.position.lerp(
        this.player.object.position.clone().add(new Vector3(0, 1, -0.4)),
        dt * 20
      );
      this.vizTp.rotation.y = this.player.object.rotation.y;
    }
  }
  update(dt: number) {
    this.time += dt;
    if (!this.loaded) return;
    this.ToiletAmmoFollower(dt);
    this.BossEntrySequence(dt);
    this.BattleManager(dt);

    if (this.endTpSequence) {
      showObjective("Go near the Robot");
      this.robotBoxTrigger.update(this.player.object.position);
      if (this.giveTp) {
        this.scene.remove(this.vizTp);
        this.action = this.RobotMixer.clipAction(this.robot.animations[0]);
        this.action.clampWhenFinished = true;
        this.action.setLoop(LoopRepeat, Infinity);
        this.action.play();
        this.endTpSequence = false;
        this.growflowers = true;
        this.scene.remove(this.boss.scene);
      }
    }

    if (this.growflowers) {
      this.flowersModels.children.forEach((f) => {
        if (f.position.distanceTo(this.player.object.position) <= 10) {
          f.scale.lerp(this.scaleVector, 5 * dt);
        }
      });
    }

    this.bossFightTrigger.update(this.player.object.position);
    if (this.Bossmixer) this.Bossmixer.update(dt);
    if (this.RobotMixer) this.RobotMixer.update(dt);
  }
  end() {}
}
