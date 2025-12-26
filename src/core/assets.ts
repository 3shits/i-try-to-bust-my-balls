import { AudioLoader, Audio, AudioListener } from "three";
import {
  GLTFLoader,
  MTLLoader,
  OBJLoader,
  type GLTF,
} from "three/examples/jsm/Addons.js";

const gltfLoader = new GLTFLoader();
const objLoader = new OBJLoader();
const mtlLoader = new MTLLoader();
const audioLoader = new AudioLoader();

export const loadGLTF = async (path: string) => {
  return gltfLoader.loadAsync(path);
};

export const loadObj = async (
  path: string,
  material: MTLLoader.MaterialCreator
) => {
  objLoader.setMaterials(material);
  return objLoader.loadAsync(path);
};

export const loadMtl = async (path: string) => {
  return mtlLoader.loadAsync(path);
};

export const loadAudio = async (path: string, listener: AudioListener) => {
  const sound = new Audio(listener);
  const buffer = await audioLoader.loadAsync(path);
  sound.setBuffer(buffer);
  return sound;
};

export type GameAssets = {
  player: GLTF;
  pet: GLTF;
};

export const LoadAssets = async (): Promise<GameAssets> => {
  try {
    const [player, pet] = await Promise.all([
      loadGLTF("/models/player.gltf"),
      loadGLTF("/models/pet.glb"),
    ]);

    return {
      player,
      pet,
    };
  } catch (err) {
    console.log("error");
    throw new Error("Error");
  }
};
