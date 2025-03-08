import { _decorator, Component, instantiate, log, Prefab, resources, Scene } from 'cc';
import { AssetLoader, IAssetLoader } from './AssetLoader';
const { ccclass } = _decorator;

@ccclass('MainScene')
export class MainScene extends Component
{
    public start()
    {
        const main = new Main(this.node.scene);
        main.Run();
    }
}

class Main
{
    private readonly _mainScene: Scene;

    constructor(mainScene: Scene)
    {
        this._mainScene = mainScene;
    }

    public async Run(): Promise<void>
    {
        const assetLoader = new AssetLoader();

        await this.LoadSlotScene(
            this._mainScene,
            assetLoader);
    }

    private async LoadSlotScene(
        scene: Scene,
        assetLoader: IAssetLoader): Promise<void>
    {
        const scenePrefab = await assetLoader.Load("Scene/SlotScene", Prefab);
        const slotScene = instantiate(scenePrefab);
        scene.addChild(slotScene);
    }
}