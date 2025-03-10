import { Component, ScrollView, Size, UITransform, Vec2, __private, math } from "cc";
import { IPool } from "../Utils/Pool";
import { Action } from "../Utils/Action";

export class ScrollLayoutBuilder
{
    private readonly _addElementVisitor: AddElementVisitor;
    private readonly _layoutStack: IElement[];
    private readonly _layoutVisitor: LayoutVisitor;

    private _root: IElement;

    constructor()
    {
        this._root = EmptyElement.Instance;
        this._addElementVisitor = new AddElementVisitor();
        this._layoutStack = [];
        this._layoutVisitor = new LayoutVisitor();
        this._addElementVisitor.Element = EmptyElement.Instance;
    }

    public BeginHorizontal(): ScrollLayoutBuilder
    {
        const layout = new HorizontalLayout();
        if (!this.IsEmpty)
        {
            this.AddElement(layout);
        }
        this._layoutStack.push(layout);
        return this;
    }

    public BeginVertical(): ScrollLayoutBuilder
    {
        const layout = new VerticalLayout();
        if (!this.IsEmpty)
        {
            this.AddElement(layout);
        }
        this._layoutStack.push(layout);
        return this;
    }

    public AddStaticElement(transform: UITransform): ScrollLayoutBuilder
    {
        this.AddElement(new Element(transform));
        return this;
    }

    public AddStaticElements(transforms: ReadonlyArray<UITransform>): ScrollLayoutBuilder
    {
        transforms.forEach(transform => this.AddStaticElement(transform));
        return this;
    }

    public AddPooledElement<T>(
        pool: IPool<UITransform>,
        size: Size,
        renderer: Action<[UITransform, T]>,
        data: T): ScrollLayoutBuilder
    {
        this.AddElement(new PooledElement(pool, size, renderer, data));
        return this;
    }

    public AddPooledElements<T>(
        pool: IPool<UITransform>,
        size: Size,
        renderer: Action<[UITransform, T]>,
        datas: ReadonlyArray<T>): ScrollLayoutBuilder
    {
        for (const data of datas)
        {
            this.AddPooledElement(pool, size, renderer, data);
        }
        return this;
    }

    public EndHorizontal(): ScrollLayoutBuilder
    {
        this._root = this._layoutStack.pop();
        return this;
    }

    public EndVertical(): ScrollLayoutBuilder
    {
        this._root = this._layoutStack.pop();
        return this;
    }

    public Build(): IElement
    {
        this._root.Accept(this._layoutVisitor);
        return this._root;
    }

    private get CurrentLayout(): IElement
    {
        return this._layoutStack[this._layoutStack.length - 1];
    }

    private get IsEmpty(): boolean
    {
        return this._layoutStack.length == 0;
    }

    private AddElement(element: IElement): void
    {
        this._addElementVisitor.Element = element;
        this.CurrentLayout.Accept(this._addElementVisitor);
        this._addElementVisitor.Element = EmptyElement.Instance;
    }
}

export class ScrollLayout
{
    private readonly _drawVisitor: DrawVisitor;
    private readonly _checkVisibleVisitor: CheckVisibleVisitor;
    private readonly _root: IElement;

    constructor(
        private readonly _scrollView: ScrollView,
        builder: ScrollLayoutBuilder)
    {
        this._root = builder.Build();
        this._drawVisitor = new DrawVisitor();
        this._checkVisibleVisitor = new CheckVisibleVisitor(this._scrollView);

        this._scrollView.node.on('scrolling', this.Render, this);
    }

    public Render(): void 
    {
        this._checkVisibleVisitor.Begin();
        this._root.Accept(this._checkVisibleVisitor);
        this._checkVisibleVisitor.End();
        this._drawVisitor.Reset();
        this._root.Accept(this._drawVisitor);
    }

    public Dispose(): void
    {
        this._scrollView.node.off('scrolling', this.Render, this);
    }
}

interface Rect
{
    min: Vec2,
    max: Vec2,
}

function GetTopLeftAnchorOffset(transform: UITransform): Vec2
{
    const topLeftAnchor = new Vec2(0, 1);
    const anchorOffset = topLeftAnchor.subtract(transform.anchorPoint);
    return anchorOffset;
}

function GetTopLeftPositionOffset(transform: UITransform): Vec2
{
    const anchorOffset = GetTopLeftAnchorOffset(transform);
    const size = transform.contentSize;
    return anchorOffset.multiply2f(size.width, size.height);
}

function GetTopLeftPosition(transform: UITransform): Vec2
{
    const positionOffset = GetTopLeftPositionOffset(transform);
    return transform.node.position.toVec2().add(positionOffset);
}

function GetRect(position: Vec2, size: Size): Rect
{
    return {
        min: position,
        max: position.clone().add2f(size.width, -size.height),
    }
}

function IsOverlap(rect1: Rect, rect2: Rect): boolean
{
    return rect1.min.x <= rect2.max.x
        && rect2.min.x <= rect1.max.x
        && rect1.min.y >= rect2.max.y
        && rect2.min.y >= rect1.max.y;
}

interface IVisitor
{
    VisitElement(element: Element): void;
    VisitPooledElement<T>(element: PooledElement<T>): void;
    VisitHorizontalLayout(layout: HorizontalLayout): void;
    VisitVerticalLayout(layout: VerticalLayout): void;
}

class LayoutVisitor implements IVisitor
{
    public VisitElement(element: Element): void
    {
    }

    public VisitPooledElement<T>(element: PooledElement<T>): void
    {
    }

    public VisitHorizontalLayout(layout: HorizontalLayout): void
    {
        layout.Elements.forEach(element => element.Accept(this));

        let size = new Size(0, 0);
        layout.Elements.forEach(element =>
        {
            element.Position = new Vec2(size.width, element.Position.y);
            size.width += element.Size.width;
            size.height = math.bits.max(size.height, element.Size.height);
        });
        layout.Size = size;
    }

    public VisitVerticalLayout(layout: VerticalLayout): void
    {
        layout.Elements.forEach(element => element.Accept(this));

        let size = new Size(0, 0);
        layout.Elements.forEach(element =>
        {
            element.Position = new Vec2(element.Position.x, -size.height);
            size.height += element.Size.height;
            size.width = math.bits.max(size.width, element.Size.width);
        });
        layout.Size = size;
    }
}

class DrawVisitor implements IVisitor
{
    private _worldPosition: Vec2;

    public Reset()
    {
        this._worldPosition = Vec2.ZERO;
    }

    public VisitElement(element: Element): void
    {
        if (!element.IsVisible)
        {
            return;
        }

        element.Transform.node.position = element
            .Position
            .clone()
            .add(this._worldPosition)
            .subtract(GetTopLeftAnchorOffset(element.Transform)
                .multiply2f(element.Size.width, element.Size.height))
            .add(GetTopLeftPositionOffset(element.Parent))
            .toVec3();
        element.Transform.contentSize = element.Size;
    }

    public VisitPooledElement<T>(element: PooledElement<T>): void
    {
        if (!element.IsVisible)
        {
            return;
        }

        element.Transform.node.position = element
            .Position
            .clone()
            .add(this._worldPosition)
            .subtract(GetTopLeftAnchorOffset(element.Transform)
                .multiply2f(element.Size.width, element.Size.height))
            .add(GetTopLeftPositionOffset(element.Parent))
            .toVec3();
        element.Transform.contentSize = element.Size;
    }

    public VisitHorizontalLayout(layout: HorizontalLayout): void
    {
        if (!layout.IsVisible)
        {
            return;
        }

        const previousWorldPosition = this._worldPosition;
        this._worldPosition = this._worldPosition.clone().add(layout.Position);
        this.VisitElements(layout.Elements);
        this._worldPosition = previousWorldPosition;
    }

    public VisitVerticalLayout(layout: VerticalLayout): void
    {
        if (!layout.IsVisible)
        {
            return;
        }

        const previousWorldPosition = this._worldPosition;
        this._worldPosition = this._worldPosition.clone().add(layout.Position);
        this.VisitElements(layout.Elements);
        this._worldPosition = previousWorldPosition;
    }

    private VisitElements(elements: IElement[]): void
    {
        let i = elements.findIndex(element => element.IsVisible);

        while (i < elements.length && elements[i].IsVisible)
        {
            elements[i].Accept(this);
            i++;
        }
    }
}

class CheckVisibleVisitor implements IVisitor
{
    private readonly _setVisibleVisitor: SetVisibleVisitor;
    private _prev: Set<IElement>;
    private _curr: Set<IElement>;
    private _viewRect: Rect;
    private _worldPosition: Vec2;

    constructor(private readonly _scrollView: ScrollView)
    {
        this._setVisibleVisitor = new SetVisibleVisitor();
        this._prev = new Set();
        this._curr = new Set();
    }

    public Begin(): void
    {
        this._worldPosition = Vec2.ZERO;
        const scrollOffset = this._scrollView.getScrollOffset();
        this._viewRect = GetRect(
            new Vec2(-scrollOffset.x, -scrollOffset.y),
            this._scrollView.view.contentSize);

        [this._prev, this._curr] = [this._curr, this._prev];
        this._curr.clear();
    }

    public End(): void
    {
        this._setVisibleVisitor.IsVisible = false;
        [...this._prev]
            .filter(element => !this._curr.has(element))
            .forEach(element => element.Accept(this._setVisibleVisitor));

        this._setVisibleVisitor.IsVisible = true;
        [...this._curr]
            .filter(element => !this._prev.has(element))
            .forEach(element => element.Accept(this._setVisibleVisitor));
    }

    public VisitElement(element: Element): void
    {
        const rect = GetRect(
            element.Position.clone().add(this._worldPosition),
            element.Size);

        if (IsOverlap(this._viewRect, rect))
        {
            this._curr.add(element);
        }
    }

    public VisitPooledElement<T>(element: PooledElement<T>): void
    {
        const rect = GetRect(
            element.Position.clone().add(this._worldPosition),
            element.Size);

        if (IsOverlap(this._viewRect, rect))
        {
            this._curr.add(element);
        }
    }

    public VisitHorizontalLayout(layout: HorizontalLayout): void
    {
        const worldPosition = layout.Position.clone().add(this._worldPosition);
        const rect = GetRect(
            worldPosition,
            layout.Size);

        if (!IsOverlap(this._viewRect, rect))
        {
            return;
        }

        this._curr.add(layout);

        const previousWorldPosition = this._worldPosition;
        this._worldPosition = worldPosition;
        this.VisitElements(layout.Elements);
        this._worldPosition = previousWorldPosition;
    }

    public VisitVerticalLayout(layout: VerticalLayout): void
    {
        const worldPosition = layout.Position.clone().add(this._worldPosition);
        const rect = GetRect(
            worldPosition,
            layout.Size);

        if (!IsOverlap(this._viewRect, rect))
        {
            return;
        }

        this._curr.add(layout);

        const previousWorldPosition = this._worldPosition;
        this._worldPosition = worldPosition;
        this.VisitElements(layout.Elements);
        this._worldPosition = previousWorldPosition;
    }

    private VisitElements(elements: IElement[]): void
    {
        let i = elements.findIndex(element =>
        {
            element.Accept(this);
            return this._curr.has(element);
        });

        while (i < elements.length - 1 && this._curr.has(elements[i]))
        {
            i++;
            elements[i].Accept(this);
        }
    }
}

class SetVisibleVisitor implements IVisitor
{
    public IsVisible: boolean;

    public VisitElement(element: Element): void
    {
        element.IsVisible = this.IsVisible;
        element.Transform.node.active = element.IsVisible;
    }

    public VisitPooledElement<T>(element: PooledElement<T>): void
    {
        element.IsVisible = this.IsVisible;
        if (element.IsVisible)
        {
            element.Spawn();
        }
        else
        {
            element.Despawn();
        }
    }

    public VisitHorizontalLayout(layout: HorizontalLayout): void
    {
        layout.IsVisible = this.IsVisible;
    }

    public VisitVerticalLayout(layout: VerticalLayout): void
    {
        layout.IsVisible = this.IsVisible;
    }
}

class AddElementVisitor implements IVisitor
{
    public Element: IElement;

    public VisitElement(element: Element): void
    {
    }

    public VisitPooledElement<T>(element: PooledElement<T>): void
    {
    }

    public VisitHorizontalLayout(layout: HorizontalLayout): void
    {
        layout.Elements.push(this.Element);
    }

    public VisitVerticalLayout(layout: VerticalLayout): void
    {
        layout.Elements.push(this.Element);
    }
}

interface IElement
{
    Position: Vec2;
    Size: Size;
    IsVisible: boolean;
    Accept(visitor: IVisitor): void;
}

class EmptyElement implements IElement
{
    public static readonly Instance: EmptyElement = new EmptyElement();

    public readonly Position: Vec2;
    public readonly Size: Size;
    public readonly IsVisible: boolean;

    private constructor()
    {
    }

    public Accept(visitor: IVisitor): void 
    {
    }
}

class Element implements IElement
{
    public readonly Parent: UITransform
    public Position: Vec2;
    public Size: Size;
    public IsVisible: boolean;

    constructor(public readonly Transform: UITransform)
    {
        this.Position = Vec2.ZERO;
        this.Size = this.Transform.contentSize;
        this.Parent = this.Transform.node.parent.getComponent(UITransform);
    }

    public Accept(visitor: IVisitor): void
    {
        visitor.VisitElement(this);
    }
}

class PooledElement<T> implements IElement
{
    public Position: Vec2;
    public Parent: UITransform;
    public Transform: UITransform;
    public IsVisible: boolean;

    constructor(
        private readonly _pool: IPool<UITransform>,
        public Size: Size,
        private readonly _renderer: Action<[UITransform, T]>,
        private readonly _data: T)
    {
        this.Position = Vec2.ZERO;
        this.Parent = null;
        this.Transform = null;
    }

    public Spawn(): void
    {
        this.Transform = this._pool.Spawn();
        this.Parent = this.Transform.node.parent.getComponent(UITransform);
        this._renderer(this.Transform, this._data);
    }

    public Despawn(): void
    {
        this._pool.Despawn(this.Transform);
        this.Transform = null;
    }

    public Accept(visitor: IVisitor): void
    {
        visitor.VisitPooledElement(this);
    }
}

class HorizontalLayout implements IElement
{
    public Position: Vec2 = Vec2.ZERO;
    public Size: Size = Size.ZERO;
    public Elements: IElement[] = [];
    public IsVisible: boolean;

    public Accept(visitor: IVisitor): void
    {
        visitor.VisitHorizontalLayout(this);
    }
}

class VerticalLayout implements IElement
{
    public Position: Vec2 = Vec2.ZERO;
    public Size: Size = Size.ZERO;
    public Elements: IElement[] = [];
    public IsVisible: boolean;

    public Accept(visitor: IVisitor): void
    {
        visitor.VisitVerticalLayout(this);
    }
}