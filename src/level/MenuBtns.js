/**
 * @file 菜单按钮组
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    var global = require('common/global');
    var color = require('common/color');
    var util = require('common/util');

    var MenuBtns = function (game) {
        this.game = game;
        this.group = game.add.group();

        this._init();
    };

    MenuBtns.prototype._init = function () {
        var game = this.game;

        // 显示顺序由下至上
        var btnConfigs = [
            {
                position: 'right',
                icon: 'food',
                onClick: function () {
                    var StorePopup = require('./popup/StorePopup');
                    new StorePopup(game);
                }
            },
            {
                position: 'right',
                icon: 'icon-hero',
                onClick: function () {
                    var FamilyPopup = require('./popup/FamilyPopup');
                    new FamilyPopup(game);
                }
            },
            {
                position: 'left',
                icon: 'icon-heart',
                onClick: function () {
                    var ThanksPopup = require('./popup/ThanksPopup');
                    new ThanksPopup(game);
                }
            },
            {
                position: 'left',
                icon: 'icon-podium',
                onClick: function () {
                    var RankPopup = require('./popup/RankPopup');
                    new RankPopup(game);
                }
            }
        ];

        var btnTexture = 'menu-btn';
        var btnWidth = game.cache.getImage(btnTexture).width;
        var bottom = 32 + btnWidth / 2;

        var posConfig = {};
        posConfig.left = {
            index: 0,
            x: 30 + btnWidth / 2
        };
        posConfig.right = {
            index: 0,
            x: game.width - posConfig.left.x
        };

        var group = this.group;

        btnConfigs.forEach(function (config) {
            var pos = config.position;

            var btn = game.add.button(
                posConfig[pos].x,
                game.height - bottom - posConfig[pos].index * 70,
                btnTexture,
                config.onClick
            );
            btn.anchor.set(0.5);
            util.addHover(btn);
            group.add(btn);

            var icon = game.add.image(0, 0, config.icon);
            icon.anchor.set(0.5);
            icon.width = 34;
            icon.height = icon.width;
            btn.addChild(icon);

            ++posConfig[pos].index;
        });
    };

    MenuBtns.prototype.destroy = function () {
        this.group.destroy();
    };

    return MenuBtns;

});
