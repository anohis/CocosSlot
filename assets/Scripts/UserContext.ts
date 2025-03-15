import { ISlotManager, ISlotModel, SlotModelManager } from "./Slot/SlotModel";
import { MakeLazy } from "./Utils/Lazy";

export interface IUserContext
{
    get SlotModel(): ISlotModel;
    get SlotManager(): ISlotManager;
}

export class UserContext implements IUserContext
{
    private readonly _slotModel: ISlotModel;
    private readonly _slotManager: ISlotManager;

    constructor()
    {
        const slotModelManager = MakeLazy(() => new SlotModelManager());
        this._slotModel = slotModelManager;
        this._slotManager = slotModelManager;
    }

    public get SlotModel(): ISlotModel
    {
        return this._slotModel;
    }

    public get SlotManager(): ISlotManager
    {
        return this._slotManager;
    }
}