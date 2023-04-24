import { assetLoader } from "@grove/engine";
import { Mesh } from "three";

export function loadModel(uri: string): Promise<Mesh> {
    return assetLoader.loadModel({ uri });
}