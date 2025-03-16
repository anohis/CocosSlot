import { _decorator, Component, log, Node, RichText, Sprite, SpriteFrame, Vec3 } from 'cc';
import { IAssetLoader } from '../AssetLoader';
const { ccclass, property } = _decorator;

export class Property
{
    public static readonly Default: Property = new Property(null, null, null);

    constructor(
        public readonly Icon: string,
        public readonly ShouldChangeIcon: boolean,
        public readonly Position: Vec3)
    {
    }

    public With(overrides: Partial<Property>): Property
    {
        return Object.assign(new Property(this.Icon, this.ShouldChangeIcon, this.Position), overrides);
    }
}

@ccclass('SymbolView')
export class SymbolView extends Component
{
    @property(Sprite)
    private icon: Sprite;

    private _assetLoader: IAssetLoader;

    public Init(assetLoader: IAssetLoader): void
    {
        this._assetLoader = assetLoader;
    }

    public Render(prop: Property):void
    {
        this.node.position = prop.Position;
        if (prop.ShouldChangeIcon)
        {
            this.LoadIconAsync(prop.Icon);
        }
    }

    public async LoadIconAsync(icon: string): Promise<void>
    {
        this.icon.spriteFrame = await this._assetLoader.Load(`UI/Slot/${icon}/spriteFrame`, SpriteFrame);
    }
}