import rxjs from 'rxjs';
import { Action } from "./Action";
import { log } from "cc";
const { BehaviorSubject, Subscription } = rxjs;

export class ReactiveProperty<T>
{
    private readonly _subject: BehaviorSubject<T>;

    constructor(initialValue: T)
    {
        this._subject = new BehaviorSubject<T>(initialValue);
    }

    public get Value(): T
    {
        return this._subject.getValue();
    }

    public set Value(newValue: T) : void
    {
        if (newValue !== this.Value)
        {
            this._subject.next(newValue);
        }
    }

    public Subscribe(callback: Action<[T]>): Subscription
    {
        return this._subject.subscribe(callback);
    }
}