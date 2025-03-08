import { FrameScheduler } from "./FrameScheduler";

export class DelayPromise
{
    public static DelayFrame(frame: number): Promise<void>
    {
        let frameCount = 0;
        return new Promise(resolve =>
            FrameScheduler.Instance.AddTask(() =>
            {
                frameCount++;
                if (frameCount >= frame)
                {
                    resolve();
                    return false;
                }
                return true;
            }));
    }

    public static DelayTime(ms: number): Promise<void>
    {
        return new Promise(resolve => setTimeout(() => resolve(), ms));
    }
};