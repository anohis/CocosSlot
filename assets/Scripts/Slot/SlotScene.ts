import { _decorator, Component, log } from 'cc';
import { ISlotView, Property, SlotView } from './SlotView';
import { ISlotPresenter, SlotPresenter } from './SlotPresenter';
import { ISlotModel } from './SlotModel';
import { INavigator } from '../Navigator/Navigator';
import { ICanvasManager } from '../CanvasManager';
const { ccclass, property } = _decorator;

@ccclass('SlotScene')
export class SlotScene extends Component
{
    @property(SlotView)
    private view: SlotView;

    public Install(
        slotModel: ISlotModel,
        navigator: INavigator,
        canvasManager: ICanvasManager): ISlotPresenter
    {
        const view = new SlotViewProxy(this.view, canvasManager);
        const presenter = new SlotPresenterProxy(view, slotModel, navigator);
        return presenter;
    }
}

class SlotPresenterProxy implements ISlotPresenter
{
    private readonly _resolver: () => ISlotPresenter;
    private _instance: ISlotPresenter;

    constructor(
        view: ISlotView,
        model: ISlotModel,
        navigator: INavigator)
    {
        this._instance = null;
        this._resolver = () =>
        {
            return new SlotPresenter(view, model, navigator);
        }
    }

    public Open(): Promise<void>
    {
        if (this._instance == null)
        {
            this._instance = this._resolver();
        }
        return this._instance.Open();
    }
}

class SlotViewProxy implements ISlotView
{
    private readonly _resolver: () => ISlotView;
    private _instance: ISlotView;

    constructor(
        view: SlotView,
        canvasManager: ICanvasManager)
    {
        this._instance = null;
        this._resolver = () =>
        {
            view.Init(canvasManager);
            return view;
        };
    }

    public Render(prop: Property): void
    {
        if (this._instance == null)
        {
            this._instance = this._resolver();
        }
        this._instance.Render(prop);
    }
}