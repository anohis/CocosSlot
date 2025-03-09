import { _decorator, Camera, Canvas, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ManagedCanvas')
export class ManagedCanvas extends Component
{
    @property(Canvas)
    private canvas: Canvas;

    public Init(camera: Camera): void
    {
        this.canvas.cameraComponent = camera;
    }

    public get IsVisible(): boolean
    {
        return this.canvas.enabled;
    }

    public set IsVisible(value: boolean)
    {
        this.canvas.enabled = value;
    }
}