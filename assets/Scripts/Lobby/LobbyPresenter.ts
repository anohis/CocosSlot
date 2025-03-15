import { log } from "cc";
import { Action } from "../Utils/Action";
import { NextFrame } from "../Utils/Promise/DelayPromise";
import { ReactiveProperty } from "../Utils/ReactiveProperty";
import { ILobbyModel } from "./LobbyModel";
import { ILobbyView, Property } from "./LobbyView";
import { INavigator } from "../Navigator/Navigator";
import { PageName } from "../PageName";

export interface ILobbyPresenter
{
    Open(): Promise<void>;
}

export class LobbyPresenter implements ILobbyPresenter
{
    private _state: State;
    private _prop: ReactiveProperty<Property>;

    constructor(
        private readonly _view: ILobbyView,
        private readonly _model: ILobbyModel,
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
            this._state = this.HandleState(this._state);
            await NextFrame();
        }

        this._prop.Value = this._prop.Value.With({ IsVisible: false });
        subscription.unsubscribe();
    }

    private CreateInitialProperty(): Property
    {
        return Property.Default.With({
            IsVisible: true,
            SlotInfos: this._model.SlotInfos,
            OnSelectSlot: () => this.ExecuteIfIdle(() => this._state = State.SelectSlot),
        });
    }

    private HandleState(state: State): State
    {
        switch (state)
        {
            case State.Open:
                return State.Idle;
            case State.Idle:
                if (!this._navigator.IsCurrent(PageName.Lobby))
                {
                    return State.Close;
                }
                return State.Idle;
            case State.Close:
                return State.Close;
            case State.SelectSlot:
                this._navigator.Navigate(PageName.Slot);
                return State.Close;
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
    SelectSlot,
}