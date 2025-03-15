import { _decorator, Button, Component, log, } from 'cc';
import { Action } from '../Utils/Action';
import { ManagedCanvas } from '../UI/ManagedCanvas';
import { ICanvasManager } from '../CanvasManager';
import { EventBinder } from '../Utils/EventBinder';
import { GetButtonClickEventBinder } from '../UI/ButtonEventBinder';
const { ccclass, property } = _decorator;

export interface ISlotView
{
    Render(prop: Property): void;
}

export class Property
{
    public static readonly Default: Property = new Property(false, null);

    constructor(
        public readonly IsVisible: boolean,
        public readonly OnBackBtnClicked: Action)
    {
    }

    public With(overrides: Partial<Property>): Property
    {
        return Object.assign(new Property(this.IsVisible, this.OnBackBtnClicked), overrides);
    }
}

@ccclass('SlotView')
export class SlotView extends Component implements ISlotView
{
    @property(ManagedCanvas)
    private canvas: ManagedCanvas;
    @property(Button)
    private backBtn: Button;

    private _canvasManager: ICanvasManager
    private _backBtnClickEvent: EventBinder<Action>;

    public onDestroy(): void
    {
        this._backBtnClickEvent.Dispose();
        this._canvasManager.Unregister(this.canvas);
    }

    public Init(canvasManager: ICanvasManager): void
    {
        this._canvasManager = canvasManager;
        this._canvasManager.Register(this.canvas);

        this._backBtnClickEvent = GetButtonClickEventBinder(this.backBtn);
    }

    public Render(prop: Property): void
    {
        this.canvas.IsVisible = prop.IsVisible;
        if (!prop.IsVisible)
        {
            return;
        }

        this._backBtnClickEvent.Rebind(prop.OnBackBtnClicked);
    }
}