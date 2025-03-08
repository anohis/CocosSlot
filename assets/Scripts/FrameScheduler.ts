import { _decorator, Component, director, Node } from 'cc';
const { ccclass } = _decorator;

@ccclass('FrameScheduler')
export class FrameScheduler extends Component
{
    private static _instance: FrameScheduler = null;

    private _tasks: (() => boolean)[] = [];

    public static get Instance()
    {
        if (this._instance == null)
        {
            const node = new Node("FrameScheduler");
            this._instance = node.addComponent(FrameScheduler);
            director.getScene().addChild(node);
        }
        return this._instance;
    }

    public onLoad(): void
    {
        if (FrameScheduler._instance != this)
        {
            this.destroy();
            return;
        }
    }

    public update(deltaTime: number): void
    {
        this._tasks = this._tasks.filter(task => task());
    }

    public onDestroy(): void
    {
        if (FrameScheduler._instance == this)
        {
            FrameScheduler._instance = null;
        }
    }

    public AddTask(task: () => boolean)
    {
        this._tasks = [...this._tasks, task];
    }
}