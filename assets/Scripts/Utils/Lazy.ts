import { Func } from "./Func";

export function MakeLazy<T extends object>(resolver: Func<T>): T
{
    const lazy = new Lazy(resolver);
    return new Proxy(
        {} as T,
        {
            get(target, prop, receiver)
            {
                const instance = lazy.Value;
                const value = Reflect.get(instance, prop, receiver);
                if (typeof value === 'function')
                {
                    return value.bind(instance);
                }
                return value;
            },
        });
}

export function MakeLazyAsync<T extends object>(resolver: () => Promise<T>): T
{
    let instance: T | null = null;

    return new Proxy(
        {} as T,
        {
            get(target, prop, receiver)
            {
                return async function ()
                {
                    if (instance == null)
                    {
                        instance = await resolver();
                    }

                    const value = Reflect.get(instance, prop, receiver);

                    if (typeof value === 'function')
                    {
                        return value.bind(instance)();
                    }
                    return value;
                };
            },
        });
}

export class Lazy<T>
{
    private _instance: T;

    constructor(private readonly _resolver: Func<T>)
    {
        this._instance = null;
    }

    public get Value(): T
    {
        if (this._instance == null)
        {
            this._instance = this._resolver();
        }
        return this._instance;
    }
}