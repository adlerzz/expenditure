let switchingGroups = new Map();
const HIDDEN_CLASS = 'hidden';
const ACTIVE_CLASS = 'active'

export function registerSwitchingGroup(groupId: string, selectors: Array<string>, action?: string, defaultElementSelector?: string){

    if(!action){
        action = 'show';
    }

    let activate, inactivate, isActive;
    switch(action){
        case 'show': {
            activate = (cl) => cl.remove(HIDDEN_CLASS);
            inactivate = (cl) => cl.add(HIDDEN_CLASS);
            isActive = (cl) => !cl.contains(HIDDEN_CLASS);
        } break;

        case 'activate': {
            activate = (cl) => cl.add(ACTIVE_CLASS);
            inactivate = (cl) => cl.remove(ACTIVE_CLASS);
            isActive = (cl) => cl.contains(ACTIVE_CLASS);
        }
    }


    if(!defaultElementSelector){
        defaultElementSelector = selectors[0];
    }

    switchingGroups.set(groupId, {selectors, activate, inactivate, isActive});
    selectors.forEach(selector => {
        const cl = document.querySelector(selector)!.classList;
        inactivate(cl);
    });
    const cl = document.querySelector(defaultElementSelector)!.classList;
    activate(cl);

}

export function switchWithinGroup(groupId: string, activatingElementSelector: string){
    const group = switchingGroups.get(groupId);

    group.selectors.map(selector => document.querySelector(selector).classList)
        .filter(cl => group.isActive(cl))
        .forEach(cl => group.inactivate(cl));
    const cl = document.querySelector(activatingElementSelector)!.classList;
    group.activate(cl);
}
