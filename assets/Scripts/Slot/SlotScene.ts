import { _decorator, Component, log } from 'cc';
import { SlotView } from './SlotView';
import { ISlotPresenter, SlotPresenter } from './SlotPresenter';
import { ISlotModel } from './SlotModel';
import { INavigator } from '../Navigator/Navigator';
import { ICanvasManager } from '../CanvasManager';
import { MakeLazy } from '../Utils/Lazy';
import { IAssetLoader } from '../AssetLoader';
const { ccclass, property } = _decorator;

@ccclass('SlotScene')
export class SlotScene extends Component
{
    @property(SlotView)
    private view: SlotView;

    public Install(
        slotModel: ISlotModel,
        navigator: INavigator,
        canvasManager: ICanvasManager,
        assetLoader: IAssetLoader): ISlotPresenter
    {
        const view = MakeLazy(() =>
        {
            this.view.Init(canvasManager, assetLoader, slotModel);
            return this.view;
        });
        const presenter = MakeLazy(() => new SlotPresenter(view, slotModel, navigator));
        return presenter;
    }
}