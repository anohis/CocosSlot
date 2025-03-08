import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

export interface IMainPageView
{
    Render(): Promise<void>
}

@ccclass('MainPageView')
export class MainPageView extends Component implements IMainPageView
{
    public Init(): void
    {
    }

    public Render(): Promise<void>
    {
        return Promise.resolve();
    }
}