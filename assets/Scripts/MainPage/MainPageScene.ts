import { _decorator, Component, log } from 'cc';
import { IMainPageView, MainPageView, Property } from './MainPageView';
import { IMainPagePresenter, MainPagePresenter } from './MainPagePresenter';
import { Func } from '../Utils/Func';
import { ICanvasManager } from '../CanvasManager';
const { ccclass, property } = _decorator;

@ccclass('MainPageScene')
export class MainPageScene extends Component
{
    @property(MainPageView)
    private view: MainPageView;

    public Install(canvasManager: ICanvasManager): IMainPagePresenter
    {
        const view = new MainPageViewProxy(this.view, canvasManager);
        const presenter = new MainPagePresenterProxy(view);
        return presenter;
    }
}

class MainPagePresenterProxy implements IMainPagePresenter
{
    private readonly _resolver: Func<IMainPagePresenter>;
    private _instance: IMainPagePresenter;

    constructor(
        view: IMainPageView)
    {
        this._instance = null;
        this._resolver = () =>
        {
            return new MainPagePresenter(view);
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

class MainPageViewProxy implements IMainPageView
{
    private readonly _resolver: Func<IMainPageView>;
    private _instance: IMainPageView;

    constructor(
        view: MainPageView,
        canvasManager: ICanvasManager)
    {
        this._instance = null;
        this._resolver = () =>
        {
            view.Init(canvasManager);
            return view;
        };
    }

    public Render(prop: Property): Promise<void>
    {
        if (this._instance == null)
        {
            this._instance = this._resolver();
        }
        return this._instance.Render(prop);
    }
}