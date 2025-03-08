import { Scene } from "cc";
import { AssetLoader, IAssetLoader } from "./AssetLoader";

export interface IApplicationContext
{
    get MainScene(): Scene;
    get AssetLoader(): IAssetLoader;
}

export class ApplicationContext implements IApplicationContext
{
    private readonly _mainScene: Scene;
    private readonly _assetLoader: IAssetLoader;
   
    constructor(mainScene: Scene)
    {
        this._mainScene = mainScene;
        this._assetLoader = new AssetLoader();
    }

    public get MainScene(): Scene
    {
        return this._mainScene;
    }

    public get AssetLoader(): IAssetLoader
    {
        return this._assetLoader;
    }
}