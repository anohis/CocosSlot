import { Func } from "../Func";
import { NextFrame } from "./DelayPromise";

export async function WaitUntil(predicate: Func<boolean>): Promise<void>
{
    while (!predicate())
    {
        await NextFrame();
    }
}