import { _decorator, Button, Canvas, Component, log } from 'cc';
import { Action } from '../Utils/Action';
import { EventBinder } from '../Utils/EventBinder';
import { ManagedCanvas } from '../UI/ManagedCanvas';
import { ICanvasManager } from '../CanvasManager';
const { ccclass, property } = _decorator;

export interface IMainPageView
{
    Render(prop: Property): void
}

export class Property
{
    public static readonly Default: Property = new Property(false, null);

    constructor(
        public readonly IsVisible: boolean,
        public readonly OnLoginBtnClicked: Action)
    {
    }

    public With(overrides: Partial<Property>): Property
    {
        return Object.assign(new Property(this.IsVisible, this.OnLoginBtnClicked), overrides);
    }
}

@ccclass('MainPageView')
export class MainPageView extends Component implements IMainPageView
{
    @property(ManagedCanvas)
    private canvas: ManagedCanvas;
    @property(Button)
    private loginBtn: Button;

    private _canvasManager: ICanvasManager
    private _onClickEventBinder: EventBinder<Action>;

    public onDestroy(): void
    {
        this._onClickEventBinder.Dispose();
        this._canvasManager.Unregister(this.canvas);
    }

    public Init(canvasManager: ICanvasManager): void
    {
        this._canvasManager = canvasManager;
        this._canvasManager.Register(this.canvas);

        this._onClickEventBinder = new EventBinder(
            handler => this.loginBtn.node.on('click', handler, this),
            handler => this.loginBtn.node.off('click', handler, this));
    }

    public Render(prop: Property): void
    {
        this.canvas.IsVisible = prop.IsVisible;
        if (!prop.IsVisible)
        {
            return;
        }

        this._onClickEventBinder.ReBind(prop.OnLoginBtnClicked);
    }
}