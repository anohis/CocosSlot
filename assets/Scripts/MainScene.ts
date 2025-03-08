import { _decorator, Component, instantiate, log, Prefab, Scene } from 'cc';
import { SlotScene } from './Slot/SlotScene';
import { ISlotPresenter } from './Slot/SlotPresenter';
import { ApplicationContext, IApplicationContext } from './ApplicationContext';
import { IUserContext, UserContext } from './UserContext';
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
        const presenter = await this.Install(applicationContext, userContext);
        await presenter.Open();
    }

    private CreateApplicationContext(): IApplicationContext
    {
        return new ApplicationContext(this._mainScene);
    }

    private CreateUserContext(): IUserContext
    {
        return new UserContext();
    }

    private async Install(
        applicationContext: IApplicationContext,
        userContext: IUserContext): Promise<ISlotPresenter>
    {
        const presenter = await this.InstallSlotScene(applicationContext, userContext);
        return presenter;
    }

    private async InstallSlotScene(
        applicationContext: IApplicationContext,
        userContext: IUserContext): Promise<ISlotPresenter>
    {
        const scenePrefab = await applicationContext.AssetLoader.Load("Scene/SlotScene", Prefab);
        const slotScene = instantiate(scenePrefab);
        applicationContext.MainScene.addChild(slotScene);

        return slotScene
            .getComponent(SlotScene)
            .Install(userContext.SlotModel);
    }
}