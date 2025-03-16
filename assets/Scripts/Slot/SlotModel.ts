export interface ISlotModel
{
    get SymbolMap(): ReadonlyMap<string, string>;
}

export interface ISlotManager
{
}

export class SlotModelManager implements ISlotModel, ISlotManager
{
    public readonly SymbolMap: ReadonlyMap<string, string>;

    constructor()
    {
        this.SymbolMap = new Map<string, string>(
            [
                ['a', 'symbol_a'],
                ['b', 'symbol_b'],
                ['c', 'symbol_c'],
                ['d', 'symbol_d'],
                ['e', 'symbol_e'],
                ['f', 'symbol_f']
            ]);
    }
}