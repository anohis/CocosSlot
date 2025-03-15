export interface ILobbyModel
{
    get SlotInfos(): ReadonlyArray<SlotInfo>;
}

export class LobbyModel implements ILobbyModel
{
    private _slotInfos: SlotInfo[];

    constructor()
    {
        this._slotInfos = [
            {
                Id: "Slot001",
                Name: "SlotName001",
                Icon: "SlotIcon001",
            },
            {
                Id: "Slot002",
                Name: "SlotName002",
                Icon: "SlotIcon002",
            },
            {
                Id: "Slot003",
                Name: "SlotName003",
                Icon: "SlotIcon003",
            }];
    }

    public get SlotInfos(): ReadonlyArray<SlotInfo>
    {
        return this._slotInfos;
    }
}

export interface SlotInfo
{
    readonly Id: string;
    readonly Name: string;
    readonly Icon: string;
}