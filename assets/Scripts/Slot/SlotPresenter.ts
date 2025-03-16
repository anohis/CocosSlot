import { log } from "cc";
import { Action } from "../Utils/Action";
import { DelayFrame, DelayTime, NextFrame } from "../Utils/Promise/DelayPromise";
import { ReactiveProperty } from "../Utils/ReactiveProperty";
import { ISlotModel } from "./SlotModel";
import { ISlotView, Property } from "./SlotView";
import { INavigator } from "../Navigator/Navigator";
import { PageName } from "../PageName";

export interface ISlotPresenter
{
    Open(): Promise<void>;
}

export class SlotPresenter implements ISlotPresenter
{
    private _state: State;
    private _prop: ReactiveProperty<Property>;

    constructor(
        private readonly _view: ISlotView,
        private readonly _model: ISlotModel,
        private readonly _navigator: INavigator)
    {
    }

    public async Open(): Promise<void>
    {
        this._state = State.Open;
        this._prop = new ReactiveProperty<Property>(this.CreateInitialProperty());
        const subscription = this._prop.Subscribe(prop => this._view.Render(prop));

        while (this._state !== State.Close)
        {
            this._state = await this.HandleState(this._state);
            await NextFrame();
        }

        this._prop.Value = this._prop.Value.With({ IsVisible: false });
        subscription.unsubscribe();
    }

    private CreateInitialProperty(): Property
    {
        return Property.Default.With({
            IsVisible: true,
            OnBackBtnClicked: () => this.ExecuteIfIdle(() => this._state = State.Back),
            OnSpinBtnClicked: () => this.ExecuteIfIdle(() => this._state = State.Spin),
        });
    }

    private async HandleState(state: State): Promise<State>
    {
        switch (state)
        {
            case State.Open:
                return State.Idle;
            case State.Idle:
                if (!this._navigator.IsCurrent(PageName.Slot))
                {
                    return State.Close;
                }
                return State.Idle;
            case State.Close:
                return State.Close;
            case State.Back:
                this._navigator.Back();
                return State.Close;
            case State.Spin:
                this._prop.Value = this._prop.Value.With(
                    {
                        ShouldSpin: true,
                    });
                await DelayTime(3000);
                this._prop.Value = this._prop.Value.With(
                    {
                        ShouldSpin: false,
                        ShouldStopSpin: true,
                        Result: ['a', 'b', 'c'],
                    });
                await NextFrame();
                this._prop.Value = this._prop.Value.With(
                    {
                        ShouldStopSpin: false,
                    });
                return State.Idle;
        }
        throw new Error(`unexpected state ${state}`);
    }

    private ExecuteIfIdle(act: Action)
    {
        if (this._state != State.Idle)
        {
            return;
        }

        act();
    }
}

enum State
{
    Open,
    Idle,
    Close,
    Back,
    Spin,
}