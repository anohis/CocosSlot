import { Camera, Scene } from "cc";
import { AssetLoader, IAssetLoader } from "./AssetLoader";
import { CanvasManager, ICanvasManager } from "./CanvasManager";

export interface IApplicationContext
{
    readonly MainScene: Scene;
    readonly CanvasManager: ICanvasManager;
    readonly AssetLoader: IAssetLoader;
}

export class ApplicationContext implements IApplicationContext
{
    public readonly MainScene: Scene;
    public readonly CanvasManager: ICanvasManager;
    public readonly AssetLoader: IAssetLoader;
   
    constructor(
        mainScene: Scene,
        mainCamera: Camera)
    {
        this.MainScene = mainScene;
        this.CanvasManager = new CanvasManager(mainCamera);
        this.AssetLoader = new AssetLoader();
    }
}