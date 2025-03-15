import { Asset, __private, log, resources } from 'cc';

type AssetType<T> = __private.__types_globals__Constructor<T>;

export interface IAssetLoader
{
    Load<T extends Asset>(path: string, type: AssetType<T>): Promise<T>;
}

export class AssetLoader implements IAssetLoader
{
    public Load<T extends Asset>(path: string, type: AssetType<T>): Promise<T>
    {
        let resolveFunc!: (value: T) => void;
        const promise = new Promise<T>(resolve => resolveFunc = resolve);
        resources.load(path, type, (err, prefab) =>
        {
            if (err != null)
            {
                throw err;
            }
            resolveFunc(prefab);
        });

        return promise;
    }
}