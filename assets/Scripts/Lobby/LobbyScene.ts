import { _decorator, Component, Node } from 'cc';
import { ILobbyView, LobbyView, Property } from './LobbyView';
import { ILobbyPresenter, LobbyPresenter } from './LobbyPresenter';
import { ILobbyModel, LobbyModel, SlotInfo } from './LobbyModel';
import { Func } from '../Utils/Func';
import { ICanvasManager } from '../CanvasManager';
import { IAssetLoader } from '../AssetLoader';
import { INavigator } from '../Navigator/Navigator';
const { ccclass, property } = _decorator;

@ccclass('LobbyScene')
export class LobbyScene extends Component
{
    @property(LobbyView)
    private view: LobbyView;

    public Install(
        canvasManager: ICanvasManager,
        assetLoader: IAssetLoader,
        navigator: INavigator): ILobbyPresenter
    {
        const view = new LobbyViewProxy(this.view, canvasManager, assetLoader);
        const model = new LobbyModelProxy();
        const presenter = new LobbyPresenterProxy(view, model, navigator);
        return presenter;
    }
}

class LobbyModelProxy implements ILobbyModel
{
    private readonly _resolver: Func<ILobbyModel>;
    private _instance: ILobbyModel;

    constructor()
    {
        this._instance = null;
        this._resolver = () =>
        {
            return new LobbyModel();
        }
    }

    public get SlotInfos(): ReadonlyArray<SlotInfo>
    {
        if (!this._instance)
        {
            this._instance = this._resolver();
        }
        return this._instance.SlotInfos;
    }
}

class LobbyViewProxy implements ILobbyView
{
    private readonly _resolver: Func<ILobbyView>;
    private _instance: ILobbyView;

    constructor(
        view: LobbyView,
        canvasManager: ICanvasManager,
        assetLoader: IAssetLoader)
    {
        this._instance = null;
        this._resolver = () =>
        {
            view.Init(canvasManager, assetLoader);
            return view;
        }
    }

    public Render(prop: Property): void
    {
        if (!this._instance)
        {
            this._instance = this._resolver();
        }
        this._instance.Render(prop);
    }
}

class LobbyPresenterProxy implements ILobbyPresenter
{
    private readonly _resolver: Func<ILobbyPresenter>;
    private _instance: ILobbyPresenter;

    constructor(
        view: ILobbyView,
        model: ILobbyModel,
        navigator: INavigator)
    {
        this._instance = null;
        this._resolver = () =>
        {
            return new LobbyPresenter(view, model, navigator);
        }
    }

    public Open(): Promise<void>
    {
        if (!this._instance)
        {
            this._instance = this._resolver();
        }
        return this._instance.Open();
    }
}