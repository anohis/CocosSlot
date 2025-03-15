import { _decorator, Component, log, Node, ScrollView, UITransform } from 'cc';
import { ICanvasManager } from '../CanvasManager';
import { ManagedCanvas } from '../UI/ManagedCanvas';
import { SlotInfo } from './LobbyModel';
import { ScrollLayout, ScrollLayoutBuilder } from '../UI/ScrollLayout';
import { ComponentPool, IPool } from '../Utils/Pool';
import { IAssetLoader } from '../AssetLoader';
import { LobbySlotElementView, Property as LobbySlotElementViewProperty } from './LobbySlotElementView';
import { Action } from '../Utils/Action';
const { ccclass, property } = _decorator;

export interface ILobbyView
{
    Render(prop: Property): void
}

export class Property
{
    public static readonly Default: Property = new Property(false, [], null);

    constructor(
        public readonly IsVisible: boolean,
        public readonly SlotInfos: ReadonlyArray<SlotInfo>,
        public readonly OnSelectSlot: Action<[string]>)
    {
    }

    public With(overrides: Partial<Property>): Property
    {
        return Object.assign(new Property(this.IsVisible, this.SlotInfos, this.OnSelectSlot), overrides);
    }
}

@ccclass('LobbyView')
export class LobbyView extends Component implements ILobbyView
{
    @property(ManagedCanvas)
    private canvas: ManagedCanvas;
    @property(ScrollView)
    private scrollView: ScrollView;
    @property(LobbySlotElementView)
    private scrollElementPrefab: LobbySlotElementView;

    private _canvasManager: ICanvasManager;
    private _slotScrollLayout: ScrollLayout;
    private _slotElementPool: IPool<UITransform>; 

    public onDestroy(): void
    {
        this._canvasManager.Unregister(this.canvas);
        this._slotScrollLayout?.Dispose();
    }

    public Init(
        canvasManager: ICanvasManager,
        assetLoader: IAssetLoader): void
    {
        this._canvasManager = canvasManager;
        this._canvasManager.Register(this.canvas);

        this._slotElementPool = new ComponentPool(
            UITransform,
            this.scrollElementPrefab.getComponent(UITransform),
            instance =>
            {
                this.scrollView.content.addChild(instance.node);
                instance.getComponent(LobbySlotElementView).Init(assetLoader);
            },
            instance => instance.node.active = true,
            instance => instance.node.active = false);
    }

    public Render(prop: Property): void
    {
        this.canvas.IsVisible = prop.IsVisible;
        if (!prop.IsVisible)
        {
            return;
        }

        this.RenderSlotScrollLayout(prop);
    }

    private RenderSlotScrollLayout(prop: Property): void
    {
        this._slotScrollLayout?.Dispose();
        this._slotScrollLayout = new ScrollLayoutBuilder(this.scrollView)
            .BeginHorizontal()
            .AddPooledElements(
                this._slotElementPool,
                this.scrollElementPrefab.getComponent(UITransform).contentSize,
                (instance, data) => this.RenderSlotElement(instance, data, prop.OnSelectSlot),
                prop.SlotInfos)
            .EndHorizontal()
            .Build();

        this._slotScrollLayout.Render();
        this._slotScrollLayout.ScrollToHead();
    }

    private RenderSlotElement(instance: UITransform, data: SlotInfo, onSelectSlot: Action<[string]>)
    {
        instance
            .getComponent(LobbySlotElementView)
            .Render(new LobbySlotElementViewProperty(
                data.Icon,
                () => onSelectSlot(data.Id)));
    }
}