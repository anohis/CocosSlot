import { _decorator, Component } from 'cc';
import { IMainPageView, MainPageView } from './MainPageView';
import { IMainPagePresenter, MainPagePresenter } from './MainPagePresenter';
const { ccclass, property } = _decorator;

@ccclass('MainPageScene')
export class MainPageScene extends Component
{
    @property(MainPageView)
    private view: MainPageView;

    public Install(): IMainPagePresenter
    {
        const view = new MainPageViewProxy(this.view);
        const presenter = new MainPagePresenterProxy(view);
        return presenter;
    }
}

class MainPagePresenterProxy implements IMainPagePresenter
{
    private readonly _resolver: () => IMainPagePresenter;
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
    private readonly _resolver: () => IMainPageView;
    private _instance: IMainPageView;

    constructor(view: MainPageView)
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