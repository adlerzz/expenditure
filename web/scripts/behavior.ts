interface SwitchingGroup {
    action: string;
    items: Array<GroupItem>;
}
interface GroupItem {
    el: Element,
    state: boolean
}

let switchingGroups = new Map<string, SwitchingGroup>();

export function bindClicks(document: Document, handlersObject: object){
    const all = document.querySelectorAll('[t-click]');
    all.forEach( el => {
        const handlerName = el.getAttribute('t-click')!;
        console.log({handlerName});
        el.addEventListener('click', () => {handlersObject[handlerName](el)});
    })
    console.log({all});
}

export function bindSwitchingGroups(document: Document){
    const all = document.querySelectorAll('[t-switch]');
    const newGroups = new Map<string, Array<{el: Element, initial: string}>>();
    all.forEach( el => {
        const switchValue = el.getAttribute('t-switch')!;
        const groupName = switchValue.split(' ')[0];
        const initial = switchValue.split(' ')[1];
        console.log({groupName, initial});
        const item = {el, initial};
        if(newGroups.has(groupName)){
            newGroups.get(groupName)!.push(item);
        } else {
            newGroups.set(groupName, [item]);
        }

    });

    console.log({all});

    newGroups.forEach( (items, groupName) => {
        let action = items.map(item => item.initial).find(i => i !== undefined);
        if(!action){
            action = items[0].initial = 'show';
        }
        const groupItems = items.map( item => ({el: item.el, state: !!item.initial}) as GroupItem );
        switchingGroups.set(groupName, {action, items: groupItems} as SwitchingGroup);
    });

    console.log({switchingGroups});

    switchingGroups.forEach(group => redrawSwitchingGroup(group));
}

function redrawSwitchingGroup(switchingGroup: SwitchingGroup){

    let action;
    switch(switchingGroup.action){
        case 'activate': {
            action = (items: Array<GroupItem>) => {
                items.forEach(item => item.el.classList.remove('active'));
                items.find(item => item.state)!.el.classList.add('active');
            }
        } break;

        case 'show': {
            action = (items: Array<GroupItem>) => {
                items.forEach(item => item.el.classList.remove('hidden'));
                items.filter(item => !item.state)
                     .forEach(item => item.el.classList.add('hidden'));
            }
        } break;
    }

    action(switchingGroup.items);
}

export function switchByElement(groupName: string, el: Element){
    const switchingGroup = switchingGroups.get(groupName);

    if(!switchingGroup){
        return;
    }

    switchingGroup.items.forEach(item => item.state = false);
    switchingGroup.items.find(item => el === item.el)!.state = true;

    redrawSwitchingGroup(switchingGroup);
}

export function switchByIndex(groupName: string, index: number){
    const switchingGroup = switchingGroups.get(groupName);

    if(!switchingGroup){
        return;
    }

    switchingGroup.items.forEach(item => item.state = false);
    switchingGroup.items[index].state = true;

    redrawSwitchingGroup(switchingGroup);
}
