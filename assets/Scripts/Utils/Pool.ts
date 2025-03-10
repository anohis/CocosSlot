import { Component, __private, instantiate } from "cc";
import { Action } from "./Action";

type ComponentConstructor<T> = __private.__types_globals__Constructor<T> | __private.__types_globals__AbstractedConstructor<T>;

export interface IPool<T>
{
    Spawn(): T;
    Despawn(instance: T): void;
}

export class ComponentPool<T extends Component> implements IPool<T>
{
    private readonly _pool: T[];

    constructor(
        private readonly _ctor: ComponentConstructor<T>,
        private readonly _prefab: T,
        private readonly _onInstantiateHandler: Action<[T]>,
        private readonly _onSpawnHandler: Action<[T]>,
        private readonly _onDespawnHandler: Action<[T]>)
    {
        this._pool = [];
    }

    public Spawn(): T 
    {
        let instance;
        if (this._pool.length > 0)
        {
            instance = this._pool.pop();
        }
        else
        {
            const node = instantiate(this._prefab.node);
            instance = node.getComponent(this._ctor);
            this._onInstantiateHandler(instance);
        }
        this._onSpawnHandler(instance);
        return instance;
    }

    public Despawn(instance: T): void 
    {
        this._onDespawnHandler(instance);
        this._pool.push(instance);
    }
}