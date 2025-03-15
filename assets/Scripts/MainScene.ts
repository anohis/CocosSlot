import { _decorator, Camera, Component, instantiate, log, Prefab, Scene } from 'cc';
import { SlotScene } from './Slot/SlotScene';
import { ISlotPresenter } from './Slot/SlotPresenter';
import { ApplicationContext, IApplicationContext } from './ApplicationContext';
import { IUserContext, UserContext } from './UserContext';
import { IMainPagePresenter } from './MainPage/MainPagePresenter';
import { MainPageScene } from './MainPage/MainPageScene';
import { LobbyScene } from './Lobby/LobbyScene';
import { ILobbyPresenter } from './Lobby/LobbyPresenter';
const { ccclass, property } = _decorator;

@ccclass('MainScene')
export class MainScene extends Component
{
    @property(Camera)
    private camera: Camera;

    public start()
    {
        const main = new Main(this.node.scene, this.camera);
        main.Run();
    }
}

class Main
{
    constructor(
        private readonly _mainScene: Scene,
        private readonly _mainCamera: Camera)
    {
    }

    public async Run(): Promise<void>
    {
        const applicationContext = this.CreateApplicationContext();
        const userContext = this.CreateUserContext();

        const mainPagePresenter = await this.InstallMainPageScene(applicationContext, userContext);
        await mainPagePresenter.Open();

        const lobbyPresenter = await this.InstallLobbyScene(applicationContext, userContext);
        await lobbyPresenter.Open();

        const slotPresenter = await this.InstallSlotScene(applicationContext, userContext);
        await slotPresenter.Open();
    }

    private CreateApplicationContext(): IApplicationContext
    {
        return new ApplicationContext(this._mainScene, this._mainCamera);
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
            .Install(applicationContext.CanvasManager);
    }

    private async InstallLobbyScene(
        applicationContext: IApplicationContext,
        userContext: IUserContext): Promise<ILobbyPresenter>
    {
        const scenePrefab = await applicationContext.AssetLoader.Load("Scene/LobbyScene", Prefab);
        const scene = instantiate(scenePrefab);
        applicationContext.MainScene.addChild(scene);

        return scene
            .getComponent(LobbyScene)
            .Install(applicationContext.CanvasManager, applicationContext.AssetLoader);
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
