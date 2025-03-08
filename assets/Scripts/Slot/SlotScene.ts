import { _decorator, Component, log } from 'cc';
import { ISlotView, SlotView } from './SlotView';
import { ISlotPresenter, SlotPresenter } from './SlotPresenter';
const { ccclass, property } = _decorator;

@ccclass('SlotScene')
export class SlotScene extends Component
{
    @property(SlotView)
    private view: SlotView;

    public Install(): ISlotPresenter
    {
        const view = new SlotViewProxy(this.view);
        const presenter = new SlotPresenterProxy(view);
        return presenter;
    }
}

class SlotPresenterProxy implements ISlotPresenter
{
    private readonly _view: ISlotView;

    private _instance: ISlotPresenter;

    constructor(view: ISlotView)
    {
        this._instance = null;
        this._view = view;
    }

    public Open(): Promise<void>
    {
        if (this._instance == null)
        {
            this._instance = new SlotPresenter(this._view);
        }
        return this._instance.Open();
    }
}

class SlotViewProxy implements ISlotView
{
    private readonly _view: SlotView;
    private _shouldInit: boolean;

    constructor(view: SlotView)
    {
        this._shouldInit = true;
        this._view = view;
    }

    public Render(): Promise<void>
    {
        if (this._shouldInit)
        {
            this._shouldInit = false;
            this._view.Init();
        }
        return this._view.Render();
    }
}