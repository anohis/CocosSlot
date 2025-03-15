import { _decorator, Button, Component, Sprite, SpriteFrame } from 'cc';
import { Action } from '../Utils/Action';
import { EventBinder } from '../Utils/EventBinder';
import { IAssetLoader } from '../AssetLoader';
import { GetButtonClickEventBinder } from '../UI/ButtonEventBinder';
const { ccclass, property } = _decorator;

export interface ILobbySlotElementView
{
    Render(prop: Property):void
}

export class Property
{
    constructor(
        public readonly Icon: string,
        public readonly OnClick: Action)
    {
    }

    public With(overrides: Partial<Property>): Property
    {
        return Object.assign(new Property(this.Icon, this.OnClick), overrides);
    }
}

@ccclass('LobbySlotElementView')
export class LobbySlotElementView extends Component implements ILobbySlotElementView
{
    @property(Sprite)
    private icon: Sprite;
    @property(Button)
    private button: Button;

    private _assetLoader: IAssetLoader;
    private _buttonClickEvent: EventBinder<Action>;

    public Init(assetLoader: IAssetLoader): void
    {
        this._assetLoader = assetLoader;
        this._buttonClickEvent = GetButtonClickEventBinder(this.button);
    }

    public Render(prop: Property): void
    {
        this._buttonClickEvent.ReBind(prop.OnClick);
        this.LoadIconAsync(prop.Icon);
    }

    private async LoadIconAsync(iconName: string): Promise<void>
    {
        this.icon.spriteFrame = await this._assetLoader.Load(`UI/Lobby/${iconName}/spriteFrame`, SpriteFrame);
    }
}