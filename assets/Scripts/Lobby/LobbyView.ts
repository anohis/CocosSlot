import { _decorator, Component, Node, ScrollView, UITransform } from 'cc';
import { ICanvasManager } from '../CanvasManager';
import { ManagedCanvas } from '../UI/ManagedCanvas';
import { SlotInfo } from './LobbyModel';
import { ScrollLayout, ScrollLayoutBuilder } from '../UI/ScrollLayout';
import { ComponentPool, IPool } from '../Utils/Pool';
const { ccclass, property } = _decorator;

export interface ILobbyView
{
    Render(prop: Property): Promise<void>;
}

export class Property
{
    public static readonly Default: Property = new Property(false, []);

    constructor(
        public readonly IsVisible: boolean,
        public readonly SlotInfos: ReadonlyArray<SlotInfo>)
    {
    }

    public With(overrides: Partial<Property>): Property
    {
        return Object.assign(new Property(this.IsVisible, this.SlotInfos), overrides);
    }
}

@ccclass('LobbyView')
export class LobbyView extends Component implements ILobbyView
{
    @property(ManagedCanvas)
    private canvas: ManagedCanvas;
    @property(ScrollView)
    private scrollView: ScrollView;
    @property(UITransform)
    private scrollElementPrefab: UITransform;

    private _canvasManager: ICanvasManager;
    private _slotScrollLayout: ScrollLayout;
    private _slotElementPool: IPool<UITransform>; 

    public onDestroy(): void
    {
        this._canvasManager.Unregister(this.canvas);
        this._slotScrollLayout?.Dispose();
    }

    public Init(canvasManager: ICanvasManager): void
    {
        this._canvasManager = canvasManager;
        this._canvasManager.Register(this.canvas);

        this._slotElementPool = new ComponentPool(
            UITransform,
            this.scrollElementPrefab,
            instance => this.scrollView.content.addChild(instance.node),
            instance => instance.node.active = true,
            instance => instance.node.active = false);
    }

    public async Render(prop: Property): Promise<void>
    {
        this.canvas.IsVisible = prop.IsVisible;
        if (!prop.IsVisible)
        {
            return;
        }

        this.RenderSlotScrollLayout(prop);

        await Promise.resolve();
    }

    private RenderSlotScrollLayout(prop: Property): void
    {
        this._slotScrollLayout?.Dispose();
        this._slotScrollLayout = new ScrollLayoutBuilder(this.scrollView)
            .BeginHorizontal()
            .AddPooledElements(this._slotElementPool, this.scrollElementPrefab.contentSize, this.RenderSlotElement, prop.SlotInfos)
            .EndHorizontal()
            .Build();
    }

    private RenderSlotElement(instance: UITransform, data:SlotInfo)
    {

    }
}