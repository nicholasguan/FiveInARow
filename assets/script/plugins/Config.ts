// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

export class ConfigManager {
    // LIFE-CYCLE CALLBACKS:
    private static confMap: {} = {}

    public static getConfig(fileName: string): any {
        if (!ConfigManager.confMap.hasOwnProperty(fileName)) {
            cc.resources.load<cc.JsonAsset>(fileName, function (err, object) {
                if (err) {
                    console.log(err);
                    return;
                }

                ConfigManager.confMap[fileName] = object.json
                // console.log(fileName + ':' + JSON.stringify(ConfigManager.confMap))
            });
        }

        // console.log(fileName + ':' + JSON.stringify(ConfigManager.confMap))
        return ConfigManager.confMap[fileName]
    }
}

export class ChessShowConfig {
    // 棋盘内线数
    chess_board_lines: number
    // 棋盘格子边线和棋盘边缘距离
    chess_board_padding: number
    // 棋盘底色
    chess_board_color: Array<number>
    // 棋盘线的颜色
    chess_board_line_color: Array<number>
    // 棋盘上特殊点的尺寸
    chess_board_point_size: number
    // 棋子直径
    chess_size: number
    // 棋子外框（相邻两个棋子的圆心距离为 chess_size + 2 * chess_margin）
    chess_margin: number
}
