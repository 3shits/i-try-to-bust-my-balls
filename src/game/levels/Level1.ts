import { Audio, AudioListener, Vector3, type Group, type Scene } from "three";
import { ForestScene } from "../scenes/ForestScene";
import { Level } from "./Level";
import type { BaseScene } from "../scenes/BaseScene";
import { Trigger } from "../Trigger";
import type { GameLevel } from "../LevelManager";
import { showObjective } from "../../UI";
import { loadAudio } from "../../core/assets";
import { isKeyDown } from "../../core/input";

export class Level1 extends Level {
  world!: Group;
  gameScene: BaseScene;
  player: Vector3;
  trigger!: Trigger;
  loaded = false;
  triggerFn: (next: GameLevel) => Promise<void>;
  listener = new AudioListener();
  audio!: Audio;
  audioPlaying = false;
  constructor(
    scene: Scene,
    player: Vector3,
    triggerFn: (next: GameLevel) => Promise<void>
  ) {
    super(new Vector3(63, 0, 7.5), scene);
    this.gameScene = new ForestScene(this.scene);
    this.world = this.gameScene.getEnvironment();
    this.player = player;
    this.triggerFn = triggerFn;
  }

  setTrigger() {
    this.trigger = new Trigger(
      new Vector3(-88, 0, -24),
      new Vector3(12, 30, 20),
      () => {
        this.audio.stop();
        this.triggerFn(2);
      }
    );
  }
  getGravitySource() {
    return 100;
  }
  getEnvironment() {
    return this.world;
  }
  async load() {
    await this.gameScene.load();
    this.setTrigger();
    this.scene.add(this.world);
    showObjective("Find the Waterfall");
    this.audio = await loadAudio("sounds/level1.mp3", this.listener);

    this.loaded = true;
  }
  update() {
    if (!this.loaded) return;
    this.trigger.update(this.player);
    if (isKeyDown("KeyW") && !this.audioPlaying) {
      this.audio.play();
      this.audioPlaying = true;
    }
  }

  end() {
    this.gameScene.dispose();
  }
}
