import { log } from 'cc';
import { ReactiveProperty } from '../Utils/ReactiveProperty';
import { IMainPageView, Property } from './MainPageView';
import { NextFrame } from '../Utils/Promise/DelayPromise';

export interface IMainPagePresenter
{
    Open(): Promise<void>;
}

export class MainPagePresenter implements IMainPagePresenter
{
    private _state: State;
    private _prop: ReactiveProperty<Property>;

    constructor(
        private readonly _view: IMainPageView) 
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
            OnLoginBtnClicked: () => this.Login()});
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
            case State.Login:
                return State.Close;
        }
        throw new Error(`unexpected state ${state}`);
    }

    private Login()
    {
        if (this._state !== State.Idle)
        {
            return;
        }
        this._state = State.Login;
    }
}

enum State
{
    Open,
    Idle,
    Close,
    Login,
}