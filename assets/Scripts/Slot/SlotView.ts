import { _decorator, Button, Component, UITransform, Vec3, TweenEasing, Size, CCInteger } from 'cc';
import { Action } from '../Utils/Action';
import { ManagedCanvas } from '../UI/ManagedCanvas';
import { ICanvasManager } from '../CanvasManager';
import { EventBinder } from '../Utils/EventBinder';
import { GetButtonClickEventBinder } from '../UI/ButtonEventBinder';
import { TweenNumber } from '../Utils/Promise/TweenPromise';
import { Func } from '../Utils/Func';
import { SymbolView, Property as SymbolViewProperty } from './SymbolView';
import { IAssetLoader } from '../AssetLoader';
import { ISlotModel } from './SlotModel';
import { CancelTokenSource, ICancelToken } from '../Utils/Promise/CancelablePromise';
import { DelayTime, NextFrame } from '../Utils/Promise/DelayPromise';
import { WaitUntil } from '../Utils/Promise/WaitPromise';
const { ccclass, property } = _decorator;

export interface ISlotView
{
    Render(prop: Property): void;
}

export class Property
{
    public static readonly Default: Property = new Property(false, null, null, false, [], false);

    constructor(
        public readonly IsVisible: boolean,
        public readonly OnBackBtnClicked: Action,
        public readonly OnSpinBtnClicked: Action,
        public readonly ShouldSpin: boolean,
        public readonly Result: ReadonlyArray<string>,
        public readonly ShouldStopSpin: boolean)
    {
    }

    public With(overrides: Partial<Property>): Property
    {
        return Object.assign(
            new Property(
                this.IsVisible,
                this.OnBackBtnClicked,
                this.OnSpinBtnClicked,
                this.ShouldSpin,
                this.Result,
                this.ShouldStopSpin)
            , overrides);
    }
}

@ccclass('ReelSetting')
export class ReelSetting
{
    @property(UITransform)
    public ReelView: UITransform = null;
    @property(SymbolView)
    public SymbolViews: SymbolView[] = [];
}

@ccclass('SlotView')
export class SlotView extends Component implements ISlotView
{
    @property(ManagedCanvas)
    private canvas: ManagedCanvas;
    @property(Button)
    private backBtn: Button;
    @property(Button)
    private spinBtn: Button;
    @property(ReelSetting)
    private reelSettings: ReelSetting[] = [];

    private _canvasManager: ICanvasManager;
    private _slotModel: ISlotModel;
    private _backBtnClickEvent: EventBinder<Action>;
    private _spinBtnClickEvent: EventBinder<Action>;

    private _spinFlowCancelToken: CancelTokenSource;

    public onDestroy(): void
    {
        this._backBtnClickEvent.Dispose();
        this._spinBtnClickEvent.Dispose();
        this._canvasManager.Unregister(this.canvas);
    }

    public Init(
        canvasManager: ICanvasManager,
        assetLoader: IAssetLoader,
        slotModel: ISlotModel): void
    {
        this._canvasManager = canvasManager;
        this._canvasManager.Register(this.canvas);

        this._slotModel = slotModel;

        this._backBtnClickEvent = GetButtonClickEventBinder(this.backBtn);
        this._spinBtnClickEvent = GetButtonClickEventBinder(this.spinBtn);

        this.reelSettings.forEach(reel =>
            reel.SymbolViews.forEach(symbol => symbol.Init(assetLoader)));
    }

    public Render(prop: Property): void
    {
        this.canvas.IsVisible = prop.IsVisible;
        if (!prop.IsVisible)
        {
            return;
        }

        this._backBtnClickEvent.Rebind(prop.OnBackBtnClicked);
        this._spinBtnClickEvent.Rebind(() => prop.OnSpinBtnClicked());

        if (prop.ShouldSpin)
        {
            this._spinFlowCancelToken = new CancelTokenSource();
            new SlotFlow(
                this._slotModel,
                this.reelSettings.map(setting => new Reel(setting.ReelView, setting.SymbolViews)))
                .Run(this._spinFlowCancelToken.Token);
        }

        if (prop.ShouldStopSpin)
        {
            this._spinFlowCancelToken.Cancel();
        }
    }
}

class Reel
{
    constructor(
        public readonly ReelView: UITransform,
        public readonly SymbolViews: ReadonlyArray<SymbolView>)
    {
    }
}

class SlotFlow
{
    private readonly _reelFlows: ReadonlyArray<ReelFlow>;

    constructor(
        private readonly _slotModel: ISlotModel,
        reels: ReadonlyArray<Reel>)
    {
        this._reelFlows = reels.map(reel => new ReelFlow(reel.ReelView, reel.SymbolViews, this._slotModel));
    }

    public async Run(cancelToken: ICancelToken): Promise<void>
    {
        let spinFlows: Promise<void>[] = [];
        let stopFlows: Promise<void>[] = [];
        let tokens: CancelTokenSource[] = [];
        for (const flow of this._reelFlows)
        {
            const cts = new CancelTokenSource();
            tokens.push(cts);
            spinFlows.push(flow.Spin(cts.Token));
            await DelayTime(50);
        }

        const onCancel = () =>
        {
            (async () =>
            {
                cancelToken.Unsubscribe(onCancel);
                for (let i = 0; i < tokens.length - 1; i++)
                {
                    tokens[i].Cancel();
                    await spinFlows[i];
                    stopFlows.push(this._reelFlows[i].Stop(['a', 'b', 'c']));
                }
                await DelayTime(1000);
                const lastIndex = this._reelFlows.length - 1;
                tokens[lastIndex].Cancel();
                await spinFlows[lastIndex];
                stopFlows.push(this._reelFlows[lastIndex].Stop(['a', 'b', 'c']));
            })();
        };
        cancelToken.Subscribe(onCancel);

        await Promise.all(spinFlows);
        await WaitUntil(() => stopFlows.length >= spinFlows.length);
        await Promise.all(stopFlows);
    }
}

class ReelFlow
{
    private readonly _slotModel: ISlotModel;
    private readonly _reelViewHeight: number;
    private readonly _reelDistance: number;
    private readonly _symbolElements: SymbolElement[];

    constructor(
        reelView: UITransform,
        symbolViews: ReadonlyArray<SymbolView>,
        slotModel: ISlotModel)
    {
        this._reelViewHeight = reelView.contentSize.height;
        this._symbolElements = symbolViews.map(symbol => new SymbolElement(symbol));
        this._reelDistance = this._symbolElements.reduce((acc, curr) => acc + curr.Size.height, 0);
        this._slotModel = slotModel;
    }

    public async Spin(
        cancelToken: ICancelToken): Promise<void>
    {
        await this.TweenReelWithOffsetY(0, 5, 0.1, 'quadIn');
        await this.TweenReelWithOffsetY(5, 0, 0.1, 'quadIn');
        while (!cancelToken.IsCanceled)
        {
            await this.TweenReelWithOffsetY(0, -this._reelDistance, 0.25, 'linear');
        }
    }

    public async Stop(
        result: ReadonlyArray<string>): Promise<void>
    {
        await this.TweenReelWithOffsetY(0, -this._reelDistance, 1, 'quadOut', i =>
        {
            return i < result.length
                ? this._slotModel.SymbolMap.get(result[i])
                : this.GetRandomSymbol();
        });
    }

    private async TweenReelWithOffsetY(
        from: number,
        to: number,
        sec: number,
        easing: TweenEasing,
        nextSymbolGetter?: Func<string, [number]>): Promise<void>
    {
        nextSymbolGetter = nextSymbolGetter
            ? nextSymbolGetter
            : _ => this.GetRandomSymbol();
         
        await TweenNumber(from, to, sec, easing, offset =>
        {
            this._symbolElements.forEach((element, index) =>
            {
                const rawY = element.InitialPosition.y + offset;
                const loopedY = GetLoopPosition(rawY, element.Size.height, this._reelViewHeight);
                const isVisible = IsVisible(rawY, element.Size.height, this._reelViewHeight);
                const shouldChangeIcon = !isVisible && element.IsVisible;
                if (shouldChangeIcon)
                {
                    element.SymbolViewProperty = element.SymbolViewProperty
                        .With({
                            Icon: nextSymbolGetter(index),
                            ShouldChangeIcon: true});
                }

                element.IsVisible = isVisible;
                element.SymbolViewProperty = element.SymbolViewProperty
                    .With({
                        Position: new Vec3(element.InitialPosition.x, loopedY, element.InitialPosition.z)});

                element.View.Render(element.SymbolViewProperty);

                if (shouldChangeIcon)
                {
                    element.SymbolViewProperty = element.SymbolViewProperty
                        .With({
                            ShouldChangeIcon: false});
                }
            });
        });
    }

    private GetRandomSymbol():string
    {
        const keys = Array.from(this._slotModel.SymbolMap.keys());
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        return this._slotModel.SymbolMap.get(randomKey);
    }
}

class SymbolElement
{
    public readonly View: SymbolView;
    public readonly InitialPosition: Vec3;
    public readonly Size: Size;
    public IsVisible: boolean;
    public SymbolViewProperty: SymbolViewProperty;

    constructor(symbol: SymbolView)
    {
        this.View = symbol;
        this.InitialPosition = symbol.node.position.clone();
        this.Size = symbol.getComponent(UITransform).contentSize;
        this.IsVisible = true;
        this.SymbolViewProperty = SymbolViewProperty.Default;
    }
}

function IsVisible(
    position: number,
    symbolSize: number,
    reelViewSize: number): boolean
{
    return position <= reelViewSize
        && 0 <= position + symbolSize;
} 

function GetLoopPosition(
    position: number,
    symbolSize: number,
    reelViewSize: number): number
{
    return Mod(position + symbolSize, reelViewSize + symbolSize) - symbolSize;
}

function Mod(value: number, mod: number): number
{
    return ((value % mod) + mod) % mod;
}