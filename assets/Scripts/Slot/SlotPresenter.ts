import { log } from "cc";
import type { ISlotView } from "./SlotView";

export interface ISlotPresenter
{
    Open(): Promise<void>;
}

export class SlotPresenter implements ISlotPresenter
{
    private readonly _view: ISlotView;

    constructor(view: ISlotView)
    {
        this._view = view;
    }

    public async Open(): Promise<void>
    {
        this._view.Render();
        await Promise.resolve();
    }
}