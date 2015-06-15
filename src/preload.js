/**
 * @file 预加载
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    var global = require('common/global');
    var color = require('common/color');

    function preload() {
        var game = this.game;

        initLoading(game);
        loadResources(game);
    }

    // loading global
    function initLoading(game) {
        var loadingText = game.add.text(
            game.width / 2, 260,
            '姜饼人正在路上...',
            {
                font: 'bold 30px ' + global.fontFamily,
                fill: color.get('white')
            }
        );
        loadingText.anchor.set(0.5);

        var hero = game.add.sprite(game.width / 2, game.height / 2, 'boy-walk');
        // hero.scale.set();
        hero.anchor.set(0.5);
        var action = 'walk';
        hero.animations.add(action);
        hero.animations.play(action, 6, true);
    }

    function loadResources(game) {
        // var path = (global.getMode() === 'dev' ? 'src' : 'asset') + '/img/';
        var path = (global.getMode() === 'dev' ? 'src' : 'http://ishowshao-game.qiniudn.com/super-gingerbread/asset') + '/img/';

        // TODO: 组织 img 目录
        game.load.image('transparent', path + 'transparent.png');

        ['black', 'white', 'beige', 'dark-beige'].forEach(function (color) {
            game.load.image('pixel-' + color, path + 'pixel/' + color +'.png');
        });

        game.load.image('spot', path + 'spot.png');

        game.load.image('food', path + 'food.png');
        game.load.image('food-with-halo', path + 'food-with-halo.png');

        game.load.image('title', path + 'title.png');
        game.load.image('start', path + 'start.png');

        game.load.image('menu-btn', path + 'menu-btn.png');
        game.load.image('icon-heart', path + 'icon-heart.png');
        game.load.image('icon-hero', path + 'icon-hero.png');
        game.load.image('icon-podium', path + 'icon-podium.png');

        game.load.image('scoreboard', path + 'scoreboard.png');

        game.load.image('popup-edge', path + 'popup-edge.png');
        game.load.image('popup-header', path + 'popup-header.png');
        game.load.image('panel-edge', path + 'panel-edge.png');
        game.load.image('btn-up', path + 'btn-up.png');
        game.load.image('btn-down', path + 'btn-down.png');
        game.load.image('btn-unlock', path + 'btn-unlock.png');
        game.load.image('btn-confirm', path + 'btn-confirm.png');
        game.load.image('me-tip', path + 'me-tip.png');

        game.load.image('end-board', path + 'end-board.png');
        game.load.image('end-btn', path + 'end-btn.png');
        game.load.image('end-btn-share', path + 'end-btn-share.png');
        game.load.image('new-record', path + 'new-record.png');

        game.load.spritesheet('stick', path + 'stick.png', 5, 24);
        game.load.spritesheet('stick-cold', path + 'stick-cold.png', 5, 24);

        global.herosConfig.forEach(function (hero) {
            var name = hero.name;
            var actions = hero.actions;
            for (var action in actions) {
                if (actions.hasOwnProperty(action)) {
                    if (name === 'boy' && action === 'walk') {
                        continue;
                    }
                    game.load.spritesheet(
                        [name, action].join('-'),
                        path + name + '/' + action + '.png',
                        hero.width, hero.height
                    );
                }
            }
        });

        // game.load.spritesheet('baguette-walk', path + 'baguette/' + 'walk.png', 101, 159);

        [1582, 1783, 1311].forEach(function (width, index) {
            var no = index + 1;
            var dir = path + 'view-' + no + '/';
            game.load.spritesheet('bg-' + no, dir + 'bg.png', width, 800);
            game.load.spritesheet('mg-far-' + no, dir + 'mg-far.png', width, 800);
            game.load.spritesheet('mg-near-' + no, dir + 'mg-near.png', width, 800);
        });

        game.load.spritesheet('stage-1', path + 'stage-1.png', 300, 266);
        game.load.spritesheet('stage-2', path + 'stage-2.png', 300, 243);
        game.load.spritesheet('stage-3', path + 'stage-3.png', 300, 245);

        game.load.image('thanks', path + 'thanks.png');
    }

    function create() {
        global.getMode() === 'dev' && global.initFoodCount();

        // TODO: serverData
        var me = this;
        var keys = ['highest', 'selected', 'unlocks', 'shared'];
        var storage = global.getStorage(keys);
        var serverKeys = [];
        for (var key in storage) {
            if (storage.hasOwnProperty(key) && storage[key] === null) {
                serverKeys.push(key);
            }
        }
        var localKeys = [];
        keys.forEach(function (key) {
            if (serverKeys.indexOf(key) === -1) {
                localKeys.push(key);
            }
        });

        // for test
        // localkeys = [];
        // serverKeys = keys;
        
        localKeys.length && global.assignStorage(localKeys);

        if (serverKeys.length) {
            var serverData = require('common/serverData');
            serverData.load(
                serverKeys,
                function (res) {
                    res = JSON.parse(res);
                    var missingKeys = [];
                    serverKeys.forEach(function (key) {
                        if (!res.hasOwnProperty(key)) {
                            missingKeys.push(key);
                        }
                    });
                    global.initStorage(missingKeys);
                    global.setStorage(res);
                    startLevel();
                },
                function (err) {
                    if (global.getMode() === 'dev' || global.getNickname === 'devyumao') {
                        global.initStorage(serverKeys);
                    }
                    startLevel();
                }
            );
        }
        else {
            startLevel();
        }

        function startLevel() {
            // 与以往不同，menu -> level 是连贯场景，所以实际是同一 state
            me.state.start('level', true, false, 'menu');
        }
    }

    return {
        preload: preload,
        create: create
    };

});
