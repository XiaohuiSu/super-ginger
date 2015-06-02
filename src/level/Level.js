/**
 * @file 关卡 state
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    var global = require('common/global');
    var config = require('./config');

    var Background = require('./Background');
    var Midground = require('./Midground');
    var Foreground = require('./Foreground');
    var Fog = require('./Fog');

    var Start = require('./Start');
    var MenuBtns = require('./MenuBtns');
    var End = require('./End');

    var Stage = require('./Stage');
    var Hero = require('./Hero');
    var Stick = require('./Stick');

    var Scoreboard = require('./Scoreboard');
    var Foodboard = require('./Foodboard');

    var Level = function () {
    };

    Level.prototype._reset = function () {
        this.isHoldEnabled = false;
        this.isBeingHeld = false;

        this.isTouchEnabled = false;

        this.isFoodToBeAdded = false;

        this.shouldMgScroll = false;

        this.theme = this.game.rnd.between(1, 3);
        // this.theme = 3;
    };

    Level.prototype._initView = function () {
        var game = this.game;

        this.background = new Background(game, {index: this.theme});
        this.farMidground = new Midground(
            game,
            {
                index: this.theme,
                imagePrefix: 'mg-far'
            }
        );
        this.nearMidground = new Midground(
            game,
            {
                index: this.theme,
                imagePrefix: 'mg-near'
            }
        );
        this.fog = new Fog(game);
    };

    Level.prototype._initMenuStatus = function () {
        this._initView();

        var game = this.game;

        this.stage = new Stage(game, {index: this.theme});
        this.hero = new Hero(game);
        this.start = new Start(
            game,
            {
                callback: this._initPlayStatus,
                context: this
            }
        );
        this.menuBtns = new MenuBtns(game);

        var title = game.add.image(game.width / 2, 100, 'title');
        title.scale.set(0.9);
        title.anchor.set(0.5, 0);
        title.alpha = 0.75;
        this.title = title;

        // for test
        // new End(game, {score: 20});
    };

    Level.prototype._initPlayStatus = function () {
        var game = this.game;

        if (this.status === 'play') {
            this._initView();

            this.stage = new Stage(game, {index: this.theme});

            this.hero = new Hero(game);

            this.hero.setForPlay(false);
            this.stage.setForPlay(false);

            this.isHoldEnabled = true;
        }
        else {
            // 销毁菜单元素
            [this.title, this.start, this.menuBtns].forEach(function (item) {
                item.destroy();
            });

            this.hero.setForPlay(true);
            var me = this;
            this.stage.setForPlay(true, function () {
                me.status = 'play';
                me.isHoldEnabled = true;
            });
        }

        
        this.scoreboard = new Scoreboard(game);
        this.foodboard = new Foodboard(game);

        this.stick = new Stick(game);

        this.foreground = new Foreground(
            game,
            {
                objects: [this.stage, this.hero, this.stick]
            }
        );

        this._bindTouch();
    };

    Level.prototype._bindTouch = function () {
        var game = this.game;

        game.input.onDown.add(onInputDown, this);
        game.input.onUp.add(onInputUp, this);
    };

    Level.prototype._fail = function () {
        var me = this;

        var highest = global.getHighest();
        var score = this.scoreboard.getScore();

        score > highest && global.setHighest(score);

        this.stick.fall();
        this.hero.fall(function () {
            me.game.plugins.screenShake.shake(10);
            setTimeout(
                function () {
                    new End(me.game, {score: score});
                },
                400
            );
        });
    };

    Level.prototype._showReward = function () {
        var game = this.game;

        // 加分文本
        var pointsText = game.add.text(
            this.stage.getSpotX(), game.height - config.horizon,
            '+1',
            {
                fill: '#333'
            }
        );
        pointsText.anchor.set(0.5, 1);
        pointsText.fontSize = 20;
        pointsText.alpha = 0;

        var duration = 700;

        var showPoints = game.add.tween(pointsText)
            .to({alpha: 0.5}, duration * 0.5, Phaser.Easing.Quadratic.Out, false);
        var hidePoints = game.add.tween(pointsText)
            .to({alpha: 0}, duration * 0.5, Phaser.Easing.Quadratic.In, false);
        var risePoints = game.add.tween(pointsText)
            .to({y: '-20'}, duration, Phaser.Easing.Linear.None, false);
        risePoints.onComplete.add(function () {
            pointsText.destroy();
        });
        showPoints.chain(hidePoints);
        showPoints.start();
        risePoints.start();

        // 赞美之词
        var praiseText = game.add.text(
            game.width / 2, 160,
            '赞 哟 !',
            {
                fill: '#333'
            }
        );
        praiseText.anchor.set(0.5, 0);
        praiseText.fontSize = 36;
        praiseText.alpha = 0;
        var showPraise = game.add.tween(praiseText)
            .to({alpha: 0.5}, 400, Phaser.Easing.Quadratic.Out, false);
        var hidePraise = game.add.tween(praiseText)
            .to({alpha: 0}, 400, Phaser.Easing.Quadratic.In, false, 300);
        hidePraise.onComplete.add(function () {
            praiseText.destroy();
        });
        showPraise.chain(hidePraise);
        showPraise.start();
    };

    function onInputDown () {
        // this._showReward();

        var hero = this.hero;

        if (this.isHoldEnabled) {
            this.isBeingHeld = true;
            hero.up();
        }

        if (this.isTouchEnabled) {
            hero.flip();
        }
    }

    function onInputUp() {
        if (!this.isHoldEnabled || !this.isBeingHeld) {
            return;
        }

        this.isBeingHeld = false;
        this.isHoldEnabled = false;

        var hero = this.hero;
        var stage = this.stage;
        var stick = this.stick;
        var foreground = this.foreground;
        var scoreboard = this.scoreboard;
        var foodboard = this.foodboard;

        var currEdgeX = stage.getCurrEdgeX();
        var nextEdgeX = stage.getNextEdgeX();

        var me = this;

        hero.kick();
        // TODO: promises
        stick.layDown(function () {
            me.isTouchEnabled = true;

            if (stick.getLength() > stage.getInterval()) { // 长度足够
                if (stick.isInSpot(stage)) { // 命中红区
                    console.log('NB!');
                    scoreboard.addScore(1);
                    me._showReward();
                }

                // 先走到 next 前沿
                hero.walk(
                    stage.getCurrEdgeX() + stage.getInterval(),
                    function () {
                        if (!hero.isUpsideDown()) {
                            me.isTouchEnabled = false;
                            // 没倒置，继续走

                            if (stick.isInStage(stage)) { // 成功啦
                                hero.walk(
                                    nextEdgeX,
                                    function () {
                                        scoreboard.addScore(1);

                                        if (me.isFoodToBeAdded) {
                                            me.isFoodToBeAdded = false;
                                            global.setFoodCount(global.getFoodCount() + 1);
                                            foodboard.update();
                                        }

                                        me.shouldMgScroll = true;
                                        foreground.move(currEdgeX - nextEdgeX, function () {
                                            me.shouldMgScroll = false;
                                        });

                                        stage.addNext(function () {
                                            stick.update();
                                            foreground.update();
                                            me.isHoldEnabled = true;
                                        });
                                    }
                                );
                            }
                            else { // 走过了
                                hero.walk(
                                    currEdgeX + stick.getLength() + 12,
                                    function () {
                                        me._fail();
                                    }
                                );
                            }
                        }
                        else {
                            // 倒置触壁，over
                            me._fail();
                        }
                    }
                );
            }
            else { // 长度不足
                hero.walk(
                    currEdgeX + stick.getLength() + 12,
                    function () {
                        me.isTouchEnabled = false;

                        me._fail();
                    }
                );
            }
        });
    }

    Level.prototype.init = function (status) {
        this.status = status;
    };

    Level.prototype.create = function () {
        this._reset();

        switch (this.status) {
            case 'menu':
                this._initMenuStatus();
                break;
            case 'play':
                this._initPlayStatus();
                break;
        }
    };

    Level.prototype.update = function () {
        this.background.scroll();

        if (this.status === 'play') {
            if (this.shouldMgScroll) {
                this.nearMidground.scroll(2);
                this.farMidground.scroll(1);
            }

            if (this.isHoldEnabled && this.isBeingHeld) {
                this.stick.lengthen();
            }

            var food = this.stage.getFood();
            if (food && food.isStartingBeingEaten(this.hero)) {
                this.isFoodToBeAdded = true;
            }
        }
    };

    return Level;

});
