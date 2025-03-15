import { _decorator, Component } from 'cc';
import { MainPageView } from './MainPageView';
import { IMainPagePresenter, MainPagePresenter } from './MainPagePresenter';
import { ICanvasManager } from '../CanvasManager';
import { MakeLazy } from '../Utils/Lazy';
const { ccclass, property } = _decorator;

@ccclass('MainPageScene')
export class MainPageScene extends Component
{
    @property(MainPageView)
    private view: MainPageView;

    public Install(canvasManager: ICanvasManager): IMainPagePresenter
    {
        const view = MakeLazy(() =>
        {
            this.view.Init(canvasManager);
            return this.view;
        });
        const presenter = MakeLazy(() => new MainPagePresenter(view));
        return presenter;
    }
}