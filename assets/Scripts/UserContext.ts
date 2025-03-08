import { ISlotManager, ISlotModel, SlotModelManager } from "./Slot/SlotModel";

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
        const slotModelManager = new SlotModelManagerProxy();
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

class SlotModelManagerProxy implements ISlotModel, ISlotManager
{
    private readonly _resolver: () => SlotModelManager;
    private _instance: SlotModelManager;

    constructor()
    {
        this._instance = null;
        this._resolver = () =>
        {
            return new SlotModelManager();
        };
    }
}