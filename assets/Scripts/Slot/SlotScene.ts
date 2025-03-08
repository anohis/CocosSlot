import { _decorator, Component, log } from 'cc';
import { ISlotView, SlotView } from './SlotView';
import { ISlotPresenter, SlotPresenter } from './SlotPresenter';
import { ISlotModel } from './SlotModel';
const { ccclass, property } = _decorator;

@ccclass('SlotScene')
export class SlotScene extends Component
{
    @property(SlotView)
    private view: SlotView;

    public Install(slotModel: ISlotModel): ISlotPresenter
    {
        const view = new SlotViewProxy(this.view);
        const presenter = new SlotPresenterProxy(view, slotModel);
        return presenter;
    }
}

class SlotPresenterProxy implements ISlotPresenter
{
    private readonly _resolver: () => ISlotPresenter;
    private _instance: ISlotPresenter;

    constructor(
        view: ISlotView,
        model: ISlotModel)
    {
        this._instance = null;
        this._resolver = () =>
        {
            return new SlotPresenter(view, model);
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

    constructor(view: SlotView)
    {
        this._instance = null;
        this._resolver = () =>
        {
            view.Init();
            return view;
        };
    }

    public Render(): Promise<void>
    {
        if (this._instance == null)
        {
            this._instance = this._resolver();
        }
        return this._instance.Render();
    }
}