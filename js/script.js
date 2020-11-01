'use strict';

class Constructor{

    ctx = '';
    bord = {
        width: null,
        height: null,
        indX: 0, // определение координат клика
        indY: 0, // определение координат клика
    }
    game = {
        enemyColor: 'black',        // Базовый цвет врагов
        group: 20,                  // --- кол-во врагов
        enemiesQty: 20,             // кол-во врагов (в начале раунда равно базовому)
        enemyIndex: 1.5,            // --- индекс прироста кол-ва врагов
        enemySpeed: 30,             // --- скорость движения врагов
        enemyHealth: 1,             // --- здоровье врагов
        enemySpamTime: 1000,        // --- скорость спавна врагов
        enemyPoint: 1,              // --- кол-во очков за врагов
        treckColor: "#c15959",      // --- цвет останков
        timer: new Date().getTime(),// таймер
        round: 1,                   // Порядковый номер раунда
        roundStart: false,          // Отметка начала раунда
        setBonusAt: 50,             // --- кол-во убитых врагов для получения очка характеристик
        kills: 0,                   // Всего убийств за игру
        freeScore: 0,               // Кол-во очков характеристик
        pause: false,               // Статус паузы
        shooting: '',               // Статус стрельбы (для автоматического огня)
    }
    player = {
        speed: 2, // pix per sec
        model: {
            color: 'blue',
            size: 10,
        },
        pos: {
            x: 0,
            y: 0,
        },
        armor:{}
    }
    weapon = {
        auto: true,         // Режим авто
        damage: 1,          // Урон
        rateOfFire: 1000,   // Скорострельность
        rateOfFireTimer: 0, // Таймер расчёта скорострельности
        fullAmmo: 6,        // Ёмкость магазина
        ammo: 6,            // Кол-во патронов в обойме
        reload: false,      // Статус перезарядки
        reloadTime: 1000,   // Время перезарядки
        reloadStart: 0,     // Таймер расчёта перезарядки
        speed: 1500,        // Скорость полёта снаряда
    }
    objects = {
        bullets: [],
        enemies: [],
        trecks: [],
        loot: [],
    }
    bonus = {
        speed: {
            now: 'this.player.speed',
            title: 'Скорость',
            name: 'speed',
            num: 0.1,
            src: './image/loot/boot.svg',
        },
        ammo: {
            now: 'this.weapon.fullAmmo',
            title: 'Боезапас',
            name: 'ammo',
            num: 1,
            src: './image/loot/bullet.svg',
        },
        rateOfFire: {
            now: 'this.weapon.rateOfFire',
            title: 'Скорострельность',
            name: 'rateOfFire',
            num: 50,
            src: './image/loot/rateoffire.svg',
        }
    }
    controlls = {
        left:false,
        top: false,
        right: false,
        bottom: false,
    }

    //================================================ CONTROLLS
    setControllUp(val){this.controlls.top = val;}
    setControllDown(val){this.controlls.bottom = val;}
    setControllLeft(val){this.controlls.left = val;}
    setControllRight(val){this.controlls.right = val;}
    setControllShoot(val){this.controlls.shoot = val;}

    resetControll(){
        this.setControllUp(false);
        this.setControllDown(false);
        this.setControllLeft(false);
        this.setControllRight(false);
    }

    // ============================================ PLAYER
    setPlayerPos(x,y){
        if(this.validPlayerPos(x,y)){
            this.player.pos.x = x;
            this.player.pos.y = y;
        }
    }

    setPlayerPosX(x){
        this.player.pos.x += x;
    }

    setPlayerPosY(y){
        this.player.pos.y += y;
    }

    validPlayerPos(x,y){
        if(x && x > this.bord.width - this.player.model.size || x && x < this.player.model.size)
            return false;
        else if( y && y > this.bord.height - this.player.model.size || y && y < this.player.model.size)
            return false;
        else
            return true;
    }

    checkCollision(){ // Движение игрока + проверка на столкновения
        var speed = this.player.speed;
        var px = this.player.pos.x;
        var py = this.player.pos.y;
        if(this.controlls.top){    
            var newpos = py - speed;
            if( this.validPlayerPos(false,newpos) )
                this.player.pos.y = newpos;
        }
        if(this.controlls.bottom){
            var newpos = py + speed;
            if( this.validPlayerPos(false,newpos) )
                this.player.pos.y = newpos;
        }
        if(this.controlls.left){
            var newpos = px - speed;
            if( this.validPlayerPos(newpos,false) )
                this.player.pos.x = newpos;
        }
        if(this.controlls.right){
            var newpos = px + speed;
            if( this.validPlayerPos(newpos,false) )
                this.player.pos.x = newpos;
        }
    }

    setPlayer(ctx){
        this.checkCollision();
        this.displayReload(ctx);

        ctx.beginPath();
        ctx.arc(
            this.player.pos.x,
            this.player.pos.y,
            this.player.model.size,
            0,
            Math.PI*2, false
        );
        ctx.fillStyle = this.player.model.color;
        ctx.fill();
        ctx.closePath();
    }

    //=================================== BULLETS && WEAPON
    displayReload(ctx){
        if(this.weapon.reload)
        {
            ctx.beginPath();
            ctx.arc(
                this.player.pos.x + 12,
                this.player.pos.y - 12,
                5,
                0,
                Math.PI*2, false
            );
            ctx.fillStyle = 'purple';
            ctx.fill();
            ctx.closePath();
        }
        
    }

    weaponReload(){
        if( this.weapon.ammo === 0 && !this.weapon.reload )
        {
            this.weapon.reloadStart = new Date().getTime();
            this.weapon.reload = true;
        }
        else if( this.weapon.ammo === 0 && this.weapon.reload )
        {
            var now = new Date().getTime();
            if( now - this.weapon.reloadStart > this.weapon.reloadTime)
            {
                this.weapon.ammo = this.weapon.fullAmmo;
                this.weapon.reload = false;
            }
        }
    }
    
    setBullet(x,y){
        if(this.weapon.reload || this.weapon.ammo <= 0)
            return;
        // Проверяем скорострельность
        var now = new Date().getTime();
        if(now - this.weapon.rateOfFireTimer < this.weapon.rateOfFire)
            return;
        // Вычитаем из обоймы
        this.weapon.ammo--;
        // Делаем пульку
        var startX = this.player.pos.x;
        var startY = this.player.pos.y;
        var vectorX = x - this.bord.indX;
        var vectorY = y - this.bord.indY;
        var speed = this.weapon.speed;
        var speedX = startX - vectorX;
        var speedY = startY - vectorY;
        // Добавляем пульку
        var bullet = [ startX, startY, -speedX, -speedY, speed, startX, startY ];
        this.objects.bullets.push(bullet);
        // Отмечаем время выстрела
        this.weapon.rateOfFireTimer = new Date().getTime();
    }

    checkEnemyHit(x,y,st){
        var action = false;
        var die = {};
        var damage = this.weapon.damage;
        this.objects.enemies.forEach( function(e,ind,obj){
            if( x > e[0] - 20 && x < e[0] + 20 && y > e[1] - 20 && y < e[1] + 20 ){
                if( e[4] - damage <= 0 ){
                    obj.splice(ind,1);
                    action = 'die';
                    die = { x:e[0], y:e[1] };
                }else{
                    e[4] -= damage;
                    action = 'hit';
                }
            }
        })
        if(action == 'die'){
            this.setTreck(die.x, die.y, st);
            this.checkRoundEnd();
            return true;
        }
        else if(action == 'hit'){
            return true;
        }
        else{
            return false;
        }
    }

    moveBullets(st){
        this.objects.bullets.forEach((b,ind,obj) => {
            var step = this.getStep( b[0],b[1],b[2]*1000,b[3]*1000,b[4] );
            var newX = b[0] += step.x;
            var newY = b[1] += step.y;
            // b[5] += step.x * 0.3;
            // b[6] += step.y * 0.3;
            // Удаляем снаряды за зоной видимости
            if(newX < -100 || newX > this.bord.width + 100 || newY < -100 || newY > this.bord.height + 100){
                obj.splice(ind,1);
            }
            else{
                if( this.checkEnemyHit(b[0],b[1],st) )
                    obj.splice(ind,1);
            }
        })
    }

    shoot(ctx, st){
        this.moveBullets(st);
        this.objects.bullets.forEach(b => {
            // Снаряд
            var gradient = ctx.createLinearGradient(b[5],b[6], b[0],b[1]);
            gradient.addColorStop(0, 'rgba(255,255,255,0.1)');
            gradient.addColorStop(1, 'rgba(255,255,255,0.7)');
            ctx.beginPath();
            ctx.arc(
                b[0],
                b[1],
                2,
                0,
                Math.PI*2, false
            );
            ctx.fillStyle = "black";
            ctx.fill();
            ctx.moveTo( b[5], b[6] );
            
            ctx.lineTo( b[0], b[1] );
            ctx.strokeStyle = gradient;
            ctx.stroke();
            ctx.closePath();
        });
    }

    //==================================== ENEMY
    randomEnemyStartPos(){
        var coords = { x: -60, y: -60 };
        var rand = Math.floor(Math.random()*this.bord.width);
        var side = Math.floor(Math.random()*4);
        
        if( side === 1 ){
            coords.x = rand;
        }
        else if( side === 2 ){
            coords.x += this.bord.width + 60;
            coords.y = rand;
        }
        else if( side === 3 ){
            coords.x = rand;
            coords.y += this.bord.width + 60;
        }
        else{
            coords.y = rand;
        }
        return coords;
    }

    setEnemy(){
        var random = this.randomEnemyStartPos();
        var enemy = [ random.x, random.y, 0, 0, this.game.enemyHealth ];
        this.objects.enemies.push(enemy);
    }

    spamEnemy(){
        var now = new Date().getTime();
        if( now - this.game.timer > this.game.enemySpamTime && this.game.enemiesQty > 0 ){
            this.setEnemy();
            this.game.enemiesQty--;
            this.game.timer = now;
        }        
    }

    moveEnemies(){
        this.objects.enemies.forEach(b => {
            var step = this.getStep(b[0],b[1],this.player.pos.x,this.player.pos.y,this.game.enemySpeed);
            b[0] += step.x;
            b[1] += step.y;            
        })
    }

    enemies(ctx){
        this.spamEnemy();
        this.moveEnemies();
        this.objects.enemies.forEach(b => {
            ctx.beginPath();
            ctx.arc(
                b[0],
                b[1],
                20,
                0,
                Math.PI*2, false
            );
            ctx.fillStyle = this.game.enemyColor;
            ctx.fill();
            ctx.closePath();
        });
    }

    //======================================== TRECKS
    setTreck(x,y,st){
        this.game.kills++;
        if( this.game.kills % this.game.setBonusAt == 0 && this.game.kills !== 0 ){
            //this.addLoot(x,y);
            this.game.freeScore += this.game.enemyPoint;
        }
        var image = new Image(50, 50);
        image.src = './image/treck.png';
        image.onload = () => {
            st.drawImage(image, Math.floor(x) - 24, Math.floor(y) - 24, 50, 50);
        }   
    }

    // ============================================== LOOT && BONUSES
    addLoot(x,y){
        var bonusCount = Object.keys( this.bonus );
        var randIndex = Math.floor( Math.random()*bonusCount.length );
        var bonus = this.bonus[bonusCount[randIndex]];
        var item = {
            posX: x,
            posY: y,
            obj: bonus,
        };
        this.objects.loot.push(item);
    }

    loot(ctx){
        if( this.objects.loot.length <= 0 ) return;

        var px = this.player.pos.x;
        var py = this.player.pos.y;
        var bonus = false;
        
        this.objects.loot.forEach((l,ind,obj) => {
            if( px < l.posX + 15 && px > l.posX - 15 && py < l.posY + 15 && py > l.posY - 15 ){
                obj.splice(ind,1);
                bonus = l.obj;
            }
            else{
                var image = new Image(24, 24);
                image.src = l.obj.src;
                
                // ctx.shadowColor = '333';
                // ctx.shadowOffsetX = 2;
                // ctx.shadowOffsetY = 2;
                // ctx.shadowBlur = 15;
                ctx.strokeStyle = '#555';
                ctx.beginPath();
                ctx.arc(
                    l.posX,
                    l.posY,
                    15,
                    0,
                    Math.PI*2, false
                );
                ctx.fillStyle = '#fff';
                ctx.fill();
                ctx.closePath();
                ctx.stroke();
                
                ctx.drawImage(image, l.posX - 12, l.posY - 12, 24, 24);
            }
        })

        if(bonus){
            this.setBonus(bonus);
        }
    }

    setBonus(bonus, mod){
        if( bonus.name == 'speed' ){
            this.player.speed += bonus.num * mod;
        }
        else if( bonus.name == 'ammo' ){
            this.weapon.fullAmmo += bonus.num * mod;
        }
        else if( bonus.name == 'rateOfFire' ){
            this.weapon.rateOfFire -= bonus.num * mod;
        }
    }

    // Расчёт шага скорости движения объекта
    getStep(startX, startY, endX, endY, speed){
        var catX = endX - startX;
        var catY = endY - startY;
        var gip = Math.sqrt(catX**2 + catY**2);
        var res = {
            x: catX / gip / 50 * speed,
            y: catY / gip / 50 * speed
        }
        return res;
    }

    clearBord(ctx){
        ctx.clearRect(0, 0, this.bord.width, this.bord.height);
    }

    pause(){
        var draw = '';
        var func = () => { this.displayPlayerOptions() };
        if( this.game.pause ){
            clearInterval(draw);
            this.game.pause = false;
            this.playerOptions.style.display = 'none';
            this.gameScene.classList.remove('pause');
        }
        else{
            this.game.pause = true;
            this.playerOptions.style.display = 'flex';
            this.gameScene.classList.add('pause');
            draw = setInterval(function(){
                func();
            }, 200)
        }
        clearInterval(this.game.shooting);
    }
    
    checkRoundEnd(){
        if(this.objects.enemies.length === 0){
            setTimeout(() => {
                this.confirmContinue();
                this.resetControll();
            }, 1000)
        }
    }

    confirmContinue(){
        var wrap = document.createElement('div');
        wrap.id = "cc__wrap";
        
        var html = '';
        html += '<p class="round-title">Раунд '+ this.game.round +'<p>';
        html += '<button id="cc__continue">Продолжить</button>';
        html += '<p class="free-score-notice">Неиспользованные очки: '+ this.game.freeScore +'</p>';
        wrap.innerHTML = html;

        this.gameScene.appendChild(wrap)
        this.gameScene.classList.add('pause');
    }

    confirmGameContinue(){
        var ccWrap = document.getElementById('cc__wrap');
        ccWrap.remove();
        this.gameScene.classList.remove('pause');
        this.setNextRound();
    }
    
    setNextRound(){
        this.game.enemiesQty = this.game.group = (this.game.group*this.game.enemyIndex).toFixed(1);
        this.game.timer = new Date().getTime();
        this.game.enemySpeed += 1;
        this.game.enemySpamTime -= 100;
        this.game.round += 1;
    }

    //============================================ INTERFACE
    setInterface(){
        var root = document.getElementById('game');
        var panel = document.createElement('div');
        panel.id = 'interface';
        root.appendChild(panel);
        this.stick.displayStick();
    }

    addIElement(value){
        var el = document.createElement('div');
        el.innerHTML = value;
        return el;
    }

    updateInterface(){
        var panel = document.getElementById('interface');
        if(panel !== undefined){
            panel.innerHTML = '';

            panel.appendChild(this.addIElement( 'Round: ' + this.game.round ));
            panel.appendChild(this.addIElement( 'Ammo: ' + this.weapon.ammo + ' | ' + this.weapon.fullAmmo ));
            panel.appendChild(this.addIElement( 'Rate: ' + this.weapon.rateOfFire/1000 ));
            panel.appendChild(this.addIElement( 'Damage: ' + this.weapon.damage ));
            panel.appendChild(this.addIElement( 'Speed: ' + this.player.speed.toFixed(1) ));
            panel.appendChild(this.addIElement( 'Kills: ' + this.game.kills ));
            panel.appendChild(this.addIElement( 'Enemies: ' + this.game.enemiesQty ));
        }
    }

    displayPlayerOptions(){
        var po = this.playerOptions;
        po.innerHTML = '';
        var options = this.bonus;

        var freeScore = document.createElement('div');
        freeScore.id = 'free-score';
        freeScore.innerText = this.game.freeScore;
        po.appendChild(freeScore);

        for( var option in options ){
            var data = options[option];
            var wrap = document.createElement('div');
            wrap.classList.add('player-option-wrap');
            wrap.innerHTML = this.setPlayerOptionLine(data);
            po.appendChild(wrap);
        }
    }

    setPlayerOptionLine(data){
        var line = '<img src="'+ data.src +'">';
        line += data.title + ': <div class="player-option__controlls">';
        line += eval(data.now).toFixed(1);
        line += '<span data-option="' + data.name + '" data-mod="-1">-</span>';
        line += '<span data-option="' + data.name + '" data-mod="1">+</span>';
        line += '</div>';

        return line;
    }

    setPlayerOption(e){
        var option = e.target.dataset.option;
        var mod = e.target.dataset.mod;
        
        if(this.game.freeScore <= 0 && mod > 0) return;
        
        this.setBonus(this.bonus[option], mod);
        
        if( mod < 0 ){
            this.game.freeScore++;
        }
        else{
            this.game.freeScore--;
        }
    }

    init(){
        this.gameScene = document.getElementById('game');
        this.playerOptions = document.getElementById('options');
        this.playerConfirm = document.getElementById('confirm');

        var staticBord = document.createElement("canvas");
        staticBord.id = 'static';
        staticBord.width = this.bord.width = window.innerWidth;
        staticBord.height = this.bord.height = window.innerHeight;
        this.gameScene.appendChild(staticBord); 
        this.setPlayerPos(this.bord.width/2, this.bord.height/2);

        var canvas = document.createElement("canvas");
        canvas.id = 'bord';
        canvas.width = this.bord.width;
        canvas.height = this.bord.height ;
        this.gameScene.appendChild(canvas); 
        this.setPlayerPos(this.bord.width/2, this.bord.height/2);

        document.addEventListener("keydown", keyDownHandler, false);
        document.addEventListener("keyup", keyUpHandler, false);
        document.addEventListener("mousedown", mouseDownHandler, false);
        document.addEventListener("mouseup", mouseUpHandler, false);
        document.addEventListener("mousemove", onmouseMoveHandler, false);

        this.setInterface();

        this.game.roundStart = true;

        var table = {
            ctx: canvas.getContext("2d"),
            static: staticBord.getContext("2d"),
        }
        return table;
    }
}

Constructor.prototype.stick = {

    el: null,
    elCenter: 0,
    drag: false,
    dragging: false,

    displayStick(){
        var stickWrapper = document.createElement('div');
        stickWrapper.id = 'stick-wrapper';
        var stick = document.createElement('div');
        stick.id = 'stick';
        stick.width = '100px';
        stick.height = '100px';
        stickWrapper.appendChild(stick);
        document.getElementById('game').appendChild(stickWrapper);

        this.el = stick;
        this.elCenter = 100/2;
    },

    draggingFunc(n) {
        var stick = n.target.closest('#stick-wrapper');
        var targetCoords = stick.getBoundingClientRect();
        var c = targetCoords.width / 2;
        
        var x = n.clientX - targetCoords.left;
        var y = n.clientY - targetCoords.top;
        var posX = x < c ? 'd.setControllLeft(true)' : 'd.setControllRight(true)';
        var posY = y < c ? 'd.setControllUp(true)' : 'd.setControllDown(true)';
        
        return {x: posX, y: posY}
    }
}

var d = new Constructor; // RELEASE class
var table = d.init();
var ctx = table.ctx;
var st = table.static;

//ctx.globalCompositeOperation = 'source-over';

//============================== BUTTONS
function keyDownHandler(e)
{    
    if     (e.keyCode == '87' || e.keyCode == '38'){d.setControllUp(true);}    // w || arrow
    else if(e.keyCode == '65' || e.keyCode == '37'){d.setControllLeft(true);}  // a || arrow
    else if(e.keyCode == '83' || e.keyCode == '40'){d.setControllDown(true);}  // s || arrow
    else if(e.keyCode == '68' || e.keyCode == '39'){d.setControllRight(true);} // d || arrow
    else if(e.keyCode == '82'){/*.....................*/} // r
    else if(e.keyCode == '27'){/*.....................*/} // esc
    else if(e.keyCode == '32'){d.pause();}                // space
}

function keyUpHandler(e)
{
    if     (e.keyCode == '87'){d.setControllUp(false);}    // w
    else if(e.keyCode == '65'){d.setControllLeft(false);}  // a
    else if(e.keyCode == '83'){d.setControllDown(false);}  // s
    else if(e.keyCode == '68'){d.setControllRight(false);} // d
}

//================================ CONTROLLS
var mouseX;
var mouseY;
function onmouseMoveHandler(e){
    mouseX = e.clientX;
    mouseY = e.clientY;
    // STICK
    if(e.target.closest('#stick-wrapper') && d.stick.drag ){
        d.resetControll();
        var move = d.stick.draggingFunc(e);
        eval(move.x);
        eval(move.y);
    }
    else if( e.target.closest('#stick-wrapper') && !d.stick.drag ){
        d.resetControll();
    }
}
function mouseDownHandler(e){
    e.preventDefault();
    // Следим за кликом только на поле
    if( e.target.closest('canvas') ){
        // ЛКМ
        if(e.which == 1){
            // Выстрел
            d.setBullet(mouseX,mouseY);
            if( d.weapon.auto ){
                d.game.shooting = setInterval(()=>{
                    d.setBullet(mouseX,mouseY);
                }, 100 )
            }
            else{
                d.setBullet(mouseX,mouseY);
            }
        }
    }
    // STICK
    if(e.target.closest('#stick-wrapper')){
        d.stick.drag = true;
        d.resetControll();
    }
    // OPTIONS
    if(e.target.closest('#options')){
        if(e.which == 1){
            // Выбор опций во время паузы
            if( e.target.closest('[data-mod]') ){
                d.setPlayerOption(e);
            }
        }
    }
    if(e.target.id == 'cc__continue'){
        if(e.which == 1){
            d.confirmGameContinue();
        }
    }
}
function mouseUpHandler(e){
    // ЛКМ
    if(e.which == 1){
        clearInterval(d.game.shooting);
    
        // STICK
        if(e.target.closest('#stick-wrapper')){
            d.stick.drag = false;
            d.resetControll();
        }
    }
}

//============================== DRAW
function draw(){
    if( d.game.pause ) return;

    d.updateInterface();
    d.clearBord(ctx);
    d.enemies(ctx);
    d.shoot(ctx,st);
    d.loot(ctx);
    d.setPlayer(ctx);
    d.weaponReload();
}

setInterval(draw, 1000/50);