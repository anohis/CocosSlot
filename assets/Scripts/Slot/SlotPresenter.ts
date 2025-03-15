import { log } from "cc";
import type { ISlotView } from "./SlotView";
import { ISlotModel } from "./SlotModel";
import { NextFrame } from "../Utils/Promise/DelayPromise";

export interface ISlotPresenter
{
    Open(): Promise<void>;
}

export class SlotPresenter implements ISlotPresenter
{
    private readonly _view: ISlotView;
    private readonly _model: ISlotModel;

    constructor(
        view: ISlotView,
        model: ISlotModel)
    {
        this._view = view;
        this._model = model;
    }

    public async Open(): Promise<void>
    {
        this._view.Render();
        await NextFrame();
    }
}