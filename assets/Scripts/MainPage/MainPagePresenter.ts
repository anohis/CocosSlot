import { IMainPageView } from './MainPageView';

export interface IMainPagePresenter
{
    Open(): Promise<void>;
}

export class MainPagePresenter implements IMainPagePresenter
{
    constructor(
        private readonly _view: IMainPageView) 
    {
    }

    public Open(): Promise<void>
    {
        return Promise.resolve();
    }
}