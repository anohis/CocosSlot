import { _decorator, Component, log, } from 'cc';
const { ccclass, property } = _decorator;

export interface ISlotView
{
    Render(): Promise<void>;
}

@ccclass('SlotView')
export class SlotView extends Component implements ISlotView
{
    public Init(): void
    {
    }

    public Render(): Promise<void>
    {
        return Promise.resolve();
    }
}