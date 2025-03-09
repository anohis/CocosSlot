import { IDisposable } from './IDisposable';

export class EventBinder<T> implements IDisposable
{
    private _unbindAction: () => void;

    constructor(
        private readonly _bind: (T) => void,
        private readonly _unbind: (T) => void)
    {
        this._unbindAction = () => { };
    }

    public ReBind(handler: T): void
    {
        this._unbindAction();
        this._bind(handler);
        this._unbindAction = () => this._unbind(handler);
    }

    public UnBind(): void
    {
        this._unbindAction();
        this._unbindAction = () => { };
    }

    public Dispose(): void
    {
        this.UnBind();
    }
}