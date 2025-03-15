import { FrameScheduler } from "../../FrameScheduler";
import { Action } from "../Action";
import { Func } from "../Func";
import { Pool } from "../Pool";
import { ICancelToken, RunWithCancelToken } from "./CancelablePromise";

export function NextFrame(): Promise<void>
{
    return DelayFrame(1);
}

export function NextFrameWithCancelToken(token: ICancelToken): Promise<void>
{
    return DelayFrameWithCancelToken(1, token);
}

const delayFrameCorePool: Pool<DelayFrameCore> = new Pool<DelayFrameCore>(() => new DelayFrameCore());

class DelayFrameCore
{
    private _currentFrame: number;
    private _maxFrame: number;
    private _callback: Action;
    private _task: Func<boolean>;

    constructor()
    {
        this._task = () =>
        {
            this._currentFrame++;
            if (this._currentFrame >= this._maxFrame)
            {
                this._callback();
                delayFrameCorePool.Despawn(this);
                return false;
            }
            return true;
        };
    }

    public Run(frame: number, callback: Action)
    {
        this._currentFrame = 0;
        this._maxFrame = frame;
        this._callback = callback;
        FrameScheduler.Instance.AddTask(this._task);
    }
}

export function DelayFrame(frame: number): Promise<void>
{
    return new Promise(resolve => delayFrameCorePool.Spawn().Run(frame, resolve));
}

export function DelayFrameWithCancelToken(frame: number, token: ICancelToken): Promise<void>
{
    return RunWithCancelToken(resolve => delayFrameCorePool.Spawn().Run(frame, resolve), token);
}

const delayTimeCorePool: Pool<DelayTimeCore> = new Pool<DelayTimeCore>(() => new DelayTimeCore());

class DelayTimeCore
{
    private _callback: Action;
    private _task: Action;

    constructor()
    {
        this._task = () =>
        {
            delayTimeCorePool.Despawn(this);
            this._callback();
        };
    }

    public Run(ms: number, callback: Action)
    {
        this._callback = callback;
        setTimeout(this._task, ms);
    }
}

export function DelayTime(ms: number): Promise<void>
{
    return new Promise(resolve => delayTimeCorePool.Spawn().Run(ms, resolve));
}

export function DelayTimeWithCancelToken(ms: number, token: ICancelToken): Promise<void>
{
    return RunWithCancelToken(resolve => delayTimeCorePool.Spawn().Run(ms, resolve), token);
}