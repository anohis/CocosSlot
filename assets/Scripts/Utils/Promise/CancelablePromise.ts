import { log } from "cc";
import { Action } from "../Action";

export class CancelTokenSource
{
    private readonly _cancelToken: CancelToken;

    constructor()
    {
        this._cancelToken = new CancelToken();
        this._cancelToken.IsCanceled = false;
    }

    get Token(): ICancelToken
    {
        return this._cancelToken;
    }

    public Cancel(): void
    {
        this._cancelToken.IsCanceled = true;
    }
}

export interface ICancelToken
{
    get IsCanceled(): boolean;
    Subscribe(callback: Action): void;
    Unsubscribe(callback: Action): void;
}

class CancelToken implements ICancelToken
{
    private _listeners: Action[] = [];
    private _isCanceled: boolean;

    public get IsCanceled(): boolean
    {
        return this._isCanceled;
    }

    public set IsCanceled(value:boolean)
    {
        this._isCanceled = value;
        this._listeners.forEach(callback => callback());
    }

    public Subscribe(listener: Action): void
    {
        this._listeners.push(listener);
    }

    public Unsubscribe(listener: Action): void
    {
        this._listeners = this._listeners.filter(x => x !== listener);
    }
}

export function RunWithCancelToken<T>(
    resolver: Action<[Action<[T]>]>,
    token: ICancelToken): Promise<T>
{
    return new Promise<T>((resolve, reject) =>
    {
        if (token.IsCanceled)
        {
            reject();
            return;
        }

        const onCancel = () =>
        {
            reject();
            token.Unsubscribe(onCancel);
        };
        token.Subscribe(onCancel);

        resolver(resolve);
    });
}
