// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class finish extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        let clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node; // 这个 node 节点是你的事件处理代码组件所属的节点
        clickEventHandler.component = "Finish";// 这个是代码文件名
        clickEventHandler.handler = "finish";

        let buttonNode: cc.Node = this.node;
        let button: cc.Button = buttonNode.getComponent(cc.Button);
        button.clickEvents.push(clickEventHandler);

        // let buttonNode: cc.Node = cc.find('Canvas/CheckWinAlert/Button');
        // buttonNode.on(cc.Node.EventType.MOUSE_DOWN, Click.finish)
        console.log(button.clickEvents)

    }

    finish(event, customEventData) {
        console.log(event)
    }

    // update (dt) {}
}
