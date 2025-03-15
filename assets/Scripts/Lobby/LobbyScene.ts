import { _decorator, Component } from 'cc';
import { LobbyView } from './LobbyView';
import { ILobbyPresenter, LobbyPresenter } from './LobbyPresenter';
import { LobbyModel } from './LobbyModel';
import { ICanvasManager } from '../CanvasManager';
import { IAssetLoader } from '../AssetLoader';
import { INavigator } from '../Navigator/Navigator';
import { MakeLazy } from '../Utils/Lazy';
const { ccclass, property } = _decorator;

@ccclass('LobbyScene')
export class LobbyScene extends Component
{
    @property(LobbyView)
    private view: LobbyView;

    public Install(
        canvasManager: ICanvasManager,
        assetLoader: IAssetLoader,
        navigator: INavigator): ILobbyPresenter
    {
        const view = MakeLazy(() =>
        {
            this.view.Init(canvasManager, assetLoader);
            return this.view;
        });
        const model = MakeLazy(() => new LobbyModel());
        const presenter = MakeLazy(() => new LobbyPresenter(view, model, navigator));
        return presenter;
    }
}