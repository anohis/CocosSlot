import { DelayPromise } from "../Utils/DelayPromise";
import { ReactiveProperty } from "../Utils/ReactiveProperty";
import { ILobbyModel } from "./LobbyModel";
import { ILobbyView, Property } from "./LobbyView";

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
        private readonly _model: ILobbyModel)
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
            await DelayPromise.NextFrame();
        }

        this._prop.Value = this._prop.Value.With({ IsVisible: false });
        subscription.unsubscribe();
    }

    private CreateInitialProperty(): Property
    {
        return Property.Default.With({
            IsVisible: true,
        });
    }

    private HandleState(state: State): State
    {
        switch (state)
        {
            case State.Open:
                return State.Idle;
            case State.Idle:
                return State.Idle;
            case State.Close:
                return State.Close;
            case State.SelectSlot:
                return State.Close;
        }
        throw new Error(`unexpected state ${state}`);
    }
}

enum State
{
    Open,
    Idle,
    Close,
    SelectSlot,
}