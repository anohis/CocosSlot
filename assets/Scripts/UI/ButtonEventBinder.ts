import { Button } from 'cc';
import { Action } from '../Utils/Action';
import { EventBinder } from '../Utils/EventBinder';

export function GetButtonClickEventBinder(btn: Button): EventBinder<Action>
{
    return new EventBinder(
        handler => btn.node.on('click', handler),
        handler => btn.node.off('click', handler));
}