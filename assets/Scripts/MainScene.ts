import { _decorator, Component, instantiate, log, Prefab, Scene } from 'cc';
import { SlotScene } from './Slot/SlotScene';
import { ISlotPresenter } from './Slot/SlotPresenter';
import { ApplicationContext, IApplicationContext } from './ApplicationContext';
import { IUserContext, UserContext } from './UserContext';
import { IMainPagePresenter } from './MainPage/MainPagePresenter';
import { MainPageScene } from './MainPage/MainPageScene';
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
        const applicationContext = this.CreateApplicationContext();
        const userContext = this.CreateUserContext();

        const mainPagePresenter = await this.InstallMainPageScene(applicationContext, userContext);
        await mainPagePresenter.Open();
        const slotPresenter = await this.InstallSlotScene(applicationContext, userContext);
        await slotPresenter.Open();
    }

    private CreateApplicationContext(): IApplicationContext
    {
        return new ApplicationContext(this._mainScene);
    }

    private CreateUserContext(): IUserContext
    {
        return new UserContext();
    }

    private async InstallMainPageScene(
        applicationContext: IApplicationContext,
        userContext: IUserContext): Promise<IMainPagePresenter>
    {
        const scenePrefab = await applicationContext.AssetLoader.Load("Scene/MainPageScene", Prefab);
        const scene = instantiate(scenePrefab);
        applicationContext.MainScene.addChild(scene);

        return scene
            .getComponent(MainPageScene)
            .Install();
    }

    private async InstallSlotScene(
        applicationContext: IApplicationContext,
        userContext: IUserContext): Promise<ISlotPresenter>
    {
        const scenePrefab = await applicationContext.AssetLoader.Load("Scene/SlotScene", Prefab);
        const scene = instantiate(scenePrefab);
        applicationContext.MainScene.addChild(scene);

        return scene
            .getComponent(SlotScene)
            .Install(userContext.SlotModel);
    }
}
