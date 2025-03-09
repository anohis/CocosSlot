import { _decorator, Camera, Canvas, Component, log, Node } from 'cc';
import { ManagedCanvas } from './UI/ManagedCanvas';
const { ccclass, property } = _decorator;

export interface ICanvasManager
{
    Register(canvas: ManagedCanvas): void;
    Unregister(canvas: ManagedCanvas): void;
}

export class CanvasManager implements ICanvasManager
{
    constructor(private readonly _camera: Camera)
    {
    }

    public Register(canvas: ManagedCanvas): void
    {
        canvas.Init(this._camera);
        canvas.IsVisible = false;
    }

    public Unregister(canvas: ManagedCanvas): void
    {
        canvas.IsVisible = false;
    }
}