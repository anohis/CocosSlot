import { Func } from "../Utils/Func";
import { ICancelToken } from "../Utils/Promise/CancelablePromise";
import { IHistory } from "./Navigator";

type HandlerMap = ReadonlyMap<string, Func<Promise<void>, [ReadonlyArray<any>]>>;

export class Router
{
    constructor(
        private readonly _history: IHistory,
        private readonly _handlers: HandlerMap)
    {
    }


    public async Run(token: ICancelToken): Promise<void>
    {
        while (!token.IsCanceled)
        {
            const current = this._history.Current;
            const handler = this._handlers.get(current.Id);
            await handler(current.Args);
        }
    }
}

