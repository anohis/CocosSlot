export interface INavigator
{
    IsCurrent(id: string): boolean;
    Navigate(id: string, ...args: any[]): void;
    Back(): void;
    Home(): void;
}

export interface IHistory
{
    get Current(): Path;
}

export class Navigator implements INavigator, IHistory
{
    private readonly _pathStack: Path[];

    constructor(private readonly _root: Path)
    {
        this._pathStack = [_root];
    }

    public get Current(): Path
    {
        return this._pathStack[this._pathStack.length - 1];
    }


    public IsCurrent(id: string): boolean
    {
        return id == this.Current.Id;
    }

    public Navigate(id: string, ...args: any[]): void
    {
        this._pathStack.push(
            {
                Id: id,
                Args: args,
            });
    }

    public Back(): void
    {
        if (this._pathStack.length <= 1)
        {
            return;
        }
        this._pathStack.pop();
    }

    public Home(): void
    {
        this._pathStack.length = 0;
        this._pathStack.push(this._root);
    }
}

export interface Path
{
    readonly Id: string;
    readonly Args: ReadonlyArray<string>;
}