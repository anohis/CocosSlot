import { Tween, TweenEasing, Vec3, log, tween } from "cc";
import { Action } from "../Action";
import { Func } from "../Func";

export function WaitTween<T extends object>(tween:Tween<T>): Promise<T>
{
    return new Promise(resolve =>
    {
        tween.call(resolve).start();
    });
}

export function TweenValue<T extends object>(
    from: T,
    to: T,
    sec: number,
    easing: TweenEasing,
    onUpdate: Action<[T]>): Promise<T>
{
    return WaitTween(
        tween(Object.assign({}, from))
            .to(sec,
                to,
                {
                    easing: easing,
                    onUpdate: target => onUpdate(target),
                }));
}

export function TweenNumber(
    from: number,
    to: number,
    sec: number,
    easing: TweenEasing,
    onUpdate: Action<[number]>): Promise<number>
{
    return TweenValue(
            { value: from },
            { value: to },
            sec,
            easing,
            target => onUpdate(target.value)).
        then(target => target.value);
}

export function Tween01(
    sec: number,
    easing: TweenEasing,
    onUpdate: Action<[number]>): Promise<number>
{
    return TweenNumber(0, 1, sec, easing, onUpdate);
}