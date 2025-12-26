import {
  Color,
  Scene,
  type PerspectiveCamera,
  type WebGLRenderer,
} from "three";
import { AnimationLoop } from "../core/loop";
import { Level2 } from "./levels/Level2";
import { Level1 } from "./levels/Level1";
import { CameraSystem } from "./CameraSystem";
import { Pet } from "./Pet";
import { Player } from "./Player";
import { LoadAssets } from "../core/assets";
import { getGroundRaycast } from "../core/helpers";
import { Level3 } from "./levels/Level3";

export type GameLevel = 1 | 2 | 3;

export class LevelManager {
  levelNum: GameLevel = 1;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  scene: Scene;
  level!: Level1 | Level2 | Level3;
  player!: Player;
  cameraSystem!: CameraSystem;
  pet!: Pet;
  isReloading = false;
  private isTransitioning = false;

  constructor(camera: PerspectiveCamera, renderer: WebGLRenderer) {
    this.camera = camera;
    this.renderer = renderer;
    this.scene = new Scene();
    this.scene.background = new Color(0x86ceee);
  }

  async initialise() {
    const assets = await LoadAssets();

    const playerModel = assets.player.scene;
    const playerAnims = assets.player.animations;
    const petModel = assets.pet.scene;
    const petAnims = assets.pet.animations;

    this.level = new Level1(this.scene, playerModel.position, () =>
      this.switchLevel(2)
    );

    this.player = new Player(
      playerModel,
      getGroundRaycast(
        this.level.getEnvironment(),
        this.level.getGravitySource()
      ),
      playerAnims
    );

    this.pet = new Pet(petModel, playerModel, petAnims);

    this.cameraSystem = new CameraSystem(
      this.camera,
      playerModel,
      this.pet.getMixer()
    );
    // this.level.setPlayer(this.player);
    this.scene.add(playerModel);
    this.scene.add(petModel);
    // this.level.setCameraSystem(this.cameraSystem);
    await this.level.load();
    this.setPlayerPosition();
  }

  start() {
    AnimationLoop(this.renderer, this.scene, this.camera, (dt: number) =>
      this.update(dt)
    );
  }

  async switchLevel(next: GameLevel) {
    if (this.isTransitioning || this.levelNum === next) return;
    this.isTransitioning = true;
    this.level.end();
    this.levelNum = next;

    switch (next) {
      case 1:
        this.level = new Level1(this.scene, this.player.object.position, () =>
          this.switchLevel(2)
        );
        break;
      case 2:
        this.level = new Level2(this.scene, () => this.switchLevel(3));
        this.level.setPlayer(this.player);
        this.player.setGroundRaycast(
          getGroundRaycast(
            this.level.getEnvironment(),
            this.level.getGravitySource()
          )
        );
        this.level.setCameraSystem(this.cameraSystem);
        break;
      case 3:
        this.level = new Level3(this.scene);
        this.level.setPlayer(this.player);
        this.player.setGroundRaycast(
          getGroundRaycast(
            this.level.getEnvironment(),
            this.level.getGravitySource()
          )
        );
        this.level.setCameraSystem(this.cameraSystem);
    }
    await this.level.load();
    this.setPlayerPosition();
    this.isTransitioning = false;
  }

  setPlayerPosition() {
    this.player.object.position.x = this.level.playerPos.x;
    this.player.object.position.z = this.level.playerPos.z;
  }

  update(dt: number) {
    this.level.update(dt);
    this.player.update(dt);
    this.pet.update(dt);
    this.cameraSystem.update(dt);

    // console.log(this.player.object.position);
  }
}
