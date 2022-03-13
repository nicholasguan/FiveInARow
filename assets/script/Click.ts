// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { ConfigManager, ChessShowConfig } from "./plugins/Config";

const { ccclass, property } = cc._decorator;

const CHESS_TYPE_BLACK: number = 1;
const CHESS_TYPE_WHITE: number = 2;

@ccclass
export default class Click extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

    private static globalConfig: ChessShowConfig;

    private hasInit: Boolean = false

    private blackTurn: Boolean = true

    private chessPosition: Array<Array<number>> = new Array<Array<number>>()

    private hasFinished: Boolean = false;

    // LIFE-CYCLE CALLBACKS:

    protected onLoad(): void {
        let clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node; // 这个 node 节点是你的事件处理代码组件所属的节点
        clickEventHandler.component = "Click";// 这个是代码文件名
        clickEventHandler.handler = "finish";

        let buttonNode: cc.Node = cc.find('Canvas/CheckWinAlert/Button');
        let button: cc.Button = buttonNode.getComponent(cc.Button);
        button.clickEvents.push(clickEventHandler);

        // let buttonNode: cc.Node = cc.find('Canvas/CheckWinAlert/Button');
        // buttonNode.on(cc.Node.EventType.MOUSE_DOWN, Click.finish)
        console.log(button.clickEvents[0].target)
    }

    finish(event, customEventData) {
        console.log(event)
        // let chessBoardNode: cc.Node = cc.find('Canvas')
        // let click: Click = chessBoardNode.getComponent(Click)
        // click.resetChessBoard();

        this.resetChessBoard()
        cc.find('Canvas/CheckWinAlert').active = false
    }

    start() {
        // [3]
        this.node.on(cc.Node.EventType.MOUSE_DOWN, Click.onClick);
    }

    update(dt) {
        if (Click.globalConfig === undefined) {
            Click.globalConfig = ConfigManager.getConfig('/config/chess')
            return
        }

        if (!this.hasInit) {
            this.initChessBoard()
        }
    }

    static onClick(event) {
        // console.log(event.getLocationX() + ':' + event.getLocationY());
        let targetNode: cc.Node = event.target;
        console.log(targetNode.name)
        let targetChessBoard: Click = targetNode.getComponent('Click')
        if (targetChessBoard === undefined) {
            return;
        }

        if (targetChessBoard.hasFinished) {
            console.log('胜负已分')
            return
        }

        let graphics = targetNode.getComponent(cc.Graphics)

        if (targetChessBoard.blackTurn === undefined) {
            targetChessBoard.blackTurn = true
        }

        let chess_type: number;
        if (targetChessBoard.blackTurn) {
            graphics.fillColor = cc.Color.BLACK;
            chess_type = CHESS_TYPE_BLACK;
        } else {
            graphics.fillColor = cc.Color.WHITE;
            chess_type = CHESS_TYPE_WHITE;
        }

        let chessR: number = Click.globalConfig.chess_size / 2
        let unitSize: number = Click.globalConfig.chess_size + 2 * Click.globalConfig.chess_margin

        let clickX = Math.round((event.getLocationX() - targetNode.anchorX * targetNode.width) / unitSize) * unitSize;
        let clickY = Math.round((event.getLocationY() - targetNode.anchorY * targetNode.height) / unitSize) * unitSize;

        let clickCoordinateRow = Math.floor(clickY / unitSize + Click.globalConfig.chess_board_lines / 2);
        let clickCoordinateCol = Math.floor(clickX / unitSize + Click.globalConfig.chess_board_lines / 2);

        if (clickCoordinateRow < 0 || clickCoordinateRow >= Click.globalConfig.chess_board_lines
            || clickCoordinateCol < 0 || clickCoordinateCol >= Click.globalConfig.chess_board_lines) {
            console.error('坐标位置不合法' + clickCoordinateRow + ':' + clickCoordinateCol)
            return;
        }

        if (targetChessBoard.chessPosition[clickCoordinateRow][clickCoordinateCol] != 0) {
            console.error('当前位置已经有棋子了' + clickCoordinateRow + ':' + clickCoordinateCol)
            return;
        }

        console.log("place coordinate=" + clickCoordinateRow + ':' + clickCoordinateCol)
        graphics.ellipse(clickX, clickY, chessR, chessR);
        graphics.fill();

        // let config: GlobalConfig = ConfigManager.getConfig('/config/chess')
        // console.log(Click.globalConfig);

        targetChessBoard.chessPosition[clickCoordinateRow][clickCoordinateCol] = chess_type;

        if (targetChessBoard.checkWin(clickCoordinateRow, clickCoordinateCol)) {
            // alert('chessType:' + chess_type + '获胜')
            // graphics.fillColor = new cc.Color(128, 128, 128)
            // graphics.fillRect(-200, -100, 400, 200)
            // let label: cc.Label = new cc.Label()
            // label.string = 'chessType:' + chess_type + '获胜';
            // label.fontSize = 120
            // targetNode.addComponent(label)
            let alertNode = cc.find('Canvas/CheckWinAlert')
            alertNode.active = true;

            let node: cc.Node = cc.find('Canvas/CheckWinAlert/Label')
            let label: cc.Label = node.getComponent(cc.Label)
            label.string = 'chessType:' + chess_type + '获胜';

            // targetChessBoard.resetChessBoard()
            targetChessBoard.hasFinished = true
        }

        targetChessBoard.blackTurn = !targetChessBoard.blackTurn;
    }

    resetChessBoard() {
        this.hasInit = false
    }

    initChessBoard() {
        if (!this.hasInit) {
            let width = this.node.width
            let height = this.node.height

            let graphics = this.node.getComponent(cc.Graphics);

            // 配置计算棋盘大小 chessBoardLines*(chessSize+chessMargin)+chessMargin
            console.log(Click.globalConfig)
            let chessBoardLines: number = Click.globalConfig.chess_board_lines
            let chessSize: number = Click.globalConfig.chess_size
            let chessMargin: number = Click.globalConfig.chess_margin
            let pointSize: number = Click.globalConfig.chess_board_point_size

            let chessBoardSize: number = chessBoardLines * (chessSize + 2 * chessMargin)
            let lineLength: number = chessBoardSize - chessSize - 2 * chessMargin
            console.log(chessBoardSize)

            // 棋盘
            graphics.fillColor = cc.color(...Click.globalConfig.chess_board_color)
            graphics.fillRect(-chessBoardSize / 2, -chessBoardSize / 2, chessBoardSize, chessBoardSize)

            // 格子
            graphics.strokeColor = cc.color(...Click.globalConfig.chess_board_line_color)
            graphics.fillColor = cc.color(...Click.globalConfig.chess_board_line_color)
            graphics.lineWidth = 3

            for (let x = 0; x <= chessBoardSize / 2; x += chessSize + 2 * chessMargin) {
                // 右侧竖线
                graphics.moveTo(x, -lineLength / 2);
                graphics.lineTo(x, lineLength / 2);

                // 左侧竖线
                graphics.moveTo(-x, -lineLength / 2);
                graphics.lineTo(-x, lineLength / 2);

                // 上面横线
                graphics.moveTo(-lineLength / 2, x);
                graphics.lineTo(lineLength / 2, x);

                // 下面横线
                graphics.moveTo(-lineLength / 2, -x);
                graphics.lineTo(lineLength / 2, -x);

                graphics.stroke();

                // 中心点画点
                if (x == 0) {
                    graphics.ellipse(0, 0, pointSize / 2, pointSize / 2)
                    graphics.fill()
                }

                // 从外向里第3条线 画点
                if ((lineLength / 2 - x) / (chessSize + 2 * chessMargin) == 3) {
                    // 四个角的点
                    graphics.ellipse(x, x, pointSize / 2, pointSize / 2)
                    graphics.ellipse(x, -x, pointSize / 2, pointSize / 2)
                    graphics.ellipse(-x, x, pointSize / 2, pointSize / 2)
                    graphics.ellipse(-x, -x, pointSize / 2, pointSize / 2)

                    // 中间十字线上的点
                    graphics.ellipse(0, x, pointSize / 2, pointSize / 2)
                    graphics.ellipse(0, -x, pointSize / 2, pointSize / 2)
                    graphics.ellipse(x, 0, pointSize / 2, pointSize / 2)
                    graphics.ellipse(-x, 0, pointSize / 2, pointSize / 2)
                    graphics.fill()
                }
            }

            graphics.stroke();

            // 棋子位置
            for (let x = 0; x < chessBoardLines; x++) {
                this.chessPosition.push([])
                for (let y = 0; y < chessBoardLines; y++) {
                    this.chessPosition[x][y] = 0;
                }
            }

            // 当前要落下的棋子
            this.blackTurn = true;

            // 标记为未结束
            this.hasFinished = false;

            this.hasInit = true
        }
    }

    checkWin(row: number, col: number) {
        // 获取目标位置棋子类型
        let targetType: number = this.chessPosition[row][col]

        // 获取最大坐标
        let maxPositionScope: number = Click.globalConfig.chess_board_lines - 1

        return this.checkLR(row, col, maxPositionScope, targetType)
            || this.checkTB(row, col, maxPositionScope, targetType)
            || this.checkLBRT(row, col, maxPositionScope, targetType)
            || this.checkLTRB(row, col, maxPositionScope, targetType);

        return false
    }

    checkLBRT(baseRow: number, baseCol: number, maxIndex, targetType: number): boolean {
        // y = x + b
        let deltaLB: number = Math.min(baseRow, baseCol);
        let deltaRT: number = Math.min(maxIndex - baseRow, maxIndex - baseCol);

        let row0: number = baseRow - deltaLB;
        let col0: number = baseCol - deltaLB;
        let row1: number = baseRow + deltaRT;
        let col1: number = baseCol + deltaRT;

        let seriesCnt: number = 0;
        for (let rowIndex: number = row0, colIndex: number = col0; rowIndex <= row1 && colIndex <= col1; rowIndex++, colIndex++) {
            if (this.chessPosition[rowIndex][colIndex] == targetType) {
                seriesCnt++;
                if (seriesCnt >= 5) {
                    console.log('chessType:' + targetType + '获胜')
                    return true;
                }
            } else {
                seriesCnt = 0;
            }
        }

        return false;
    }

    checkLTRB(baseRow: number, baseCol: number, maxIndex, targetType: number): boolean {
        // y = x + b
        let deltaLT: number = Math.min(baseCol, maxIndex - baseRow);
        let deltaRB: number = Math.min(baseRow, maxIndex - baseCol);

        let row0: number = baseRow + deltaLT;
        let col0: number = baseCol - deltaLT;
        let row1: number = baseRow - deltaRB;
        let col1: number = baseCol + deltaRB;

        let seriesCnt: number = 0;
        for (let rowIndex: number = row0, colIndex: number = col0; rowIndex >= row1 && colIndex <= col1; rowIndex--, colIndex++) {
            if (this.chessPosition[rowIndex][colIndex] == targetType) {
                seriesCnt++;
                if (seriesCnt >= 5) {
                    console.log('chessType:' + targetType + '获胜')
                    return true;
                }
            } else {
                seriesCnt = 0;
            }
        }

        return false;
    }

    checkLR(baseRow: number, baseCol: number, maxIndex, targetType: number): boolean {
        let seriesCnt: number = 0;
        let left: number = Math.max(0, baseCol - 4)
        let right: number = Math.min(maxIndex, baseCol + 4)

        for (let colIndex = left; colIndex <= right; colIndex++) {
            if (this.chessPosition[baseRow][colIndex] == targetType) {
                seriesCnt++;
                if (seriesCnt >= 5) {
                    console.log('chessType:' + targetType + '获胜')
                    return true;
                }
            } else {
                seriesCnt = 0;
            }
        }
        return false;
    }

    checkTB(baseRow: number, baseCol: number, maxIndex: number, targetType: number): boolean {
        let seriesCnt: number = 0;
        let top: number = Math.min(maxIndex, baseRow + 4)
        let bottom: number = Math.max(0, baseRow - 4)

        for (let rowIndex = top; rowIndex >= bottom; rowIndex--) {
            if (this.chessPosition[rowIndex][baseCol] == targetType) {
                seriesCnt++;
                if (seriesCnt >= 5) {
                    console.log('chessType:' + targetType + '获胜')
                    return true;
                }
            } else {
                seriesCnt = 0;
            }
        }
        return false;
    }
}
