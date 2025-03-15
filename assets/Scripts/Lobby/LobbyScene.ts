import { _decorator, Component, Node } from 'cc';
import { ILobbyView, LobbyView, Property } from './LobbyView';
import { ILobbyPresenter, LobbyPresenter } from './LobbyPresenter';
import { ILobbyModel, LobbyModel, SlotInfo } from './LobbyModel';
import { Func } from '../Utils/Func';
import { ICanvasManager } from '../CanvasManager';
const { ccclass, property } = _decorator;

@ccclass('LobbyScene')
export class LobbyScene extends Component
{
    @property(LobbyView)
    private view: LobbyView;

    public Install(canvasManager: ICanvasManager): ILobbyPresenter
    {
        const view = new LobbyViewProxy(this.view, canvasManager);
        const model = new LobbyModelProxy();
        const presenter = new LobbyPresenterProxy(view, model);
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
        canvasManager: ICanvasManager)
    {
        this._instance = null;
        this._resolver = () =>
        {
            view.Init(canvasManager);
            return view;
        }
    }

    public Render(prop: Property): Promise<void>
    {
        if (!this._instance)
        {
            this._instance = this._resolver();
        }
        return this._instance.Render(prop);
    }
}

class LobbyPresenterProxy implements ILobbyPresenter
{
    private readonly _resolver: Func<ILobbyPresenter>;
    private _instance: ILobbyPresenter;

    constructor(
        view: ILobbyView,
        model: ILobbyModel)
    {
        this._instance = null;
        this._resolver = () =>
        {
            return new LobbyPresenter(view, model);
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