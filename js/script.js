'use strict';

class Constructor{

    ctx = '';
    bord = {
        width: 700,
        height: 700,
        indX: (window.innerWidth - 700)/2, // определение координат клика
        indY: (window.innerHeight - 700)/2, // определение координат клика
    }
    game = {
        playerSpeed: 2,
        enemiesQty: 10,
        enemyColor: 'black',
        group: 10,
        enemySpeed: 30,
        enemySpamTime: 1000,
        treckColor: "rgba(212,0,0,0.5)",
        timer: new Date().getTime(),
        round: 1,
        roundStart: false,
    }
    player= {
        model: {
            color: 'blue',
            size: 10,
        },
        pos: {
            x: 0,
            y: 0,
        },
        gun: {
            name: 'Pistol',     // Название
            auto: true,        // Режим авто
            rateOfFire: 500,   // Скорострельность
            rateOfFireTimer: 0, // Таймер расчёта скорострельности
            fullAmmo: 6,        // Ёмкость магазина
            ammo: 6,            // Кол-во патронов в обойме
            reload: false,      // Статус перезарядки
            reloadTime: 1000,   // Время перезарядки
            reloadStart: 0,     // Таймер расчёта перезарядки
        },
        armor:{}
    }
    objects = {
        bullets: [],
        enemies: [],
        trecks: [],
    }
    controlls = {
        left:false,
        top: false,
        right: false,
        bottom: false,
        reload: false,
        shoot: false,
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

    checkWallCollision(){ // Движение игрока + проверка на столкновения
        let speed = this.game.playerSpeed;
        if(this.controlls.top){    
            let newpos = this.player.pos.y - speed;
            if( this.validPlayerPos(false,newpos) )
                this.player.pos.y = newpos;
        }
        if(this.controlls.bottom){
            let newpos = this.player.pos.y + speed;
            if( this.validPlayerPos(false,newpos) )
                this.player.pos.y = newpos;
        }
        if(this.controlls.left){
            let newpos = this.player.pos.x - speed;
            if( this.validPlayerPos(false,newpos) )
                this.player.pos.x = newpos;
        }
        if(this.controlls.right){
            let newpos = this.player.pos.x + speed;
            if( this.validPlayerPos(false,newpos) )
                this.player.pos.x = newpos;
        }
    }

    setPlayer(ctx){
        this.checkWallCollision();
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
        if(this.player.gun.reload)
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
        if( this.player.gun.ammo === 0 && !this.player.gun.reload )
        {
            this.player.gun.reloadStart = new Date().getTime();
            this.player.gun.reload = true;
        }
        else if( this.player.gun.ammo === 0 && this.player.gun.reload )
        {
            let now = new Date().getTime();
            if( now - this.player.gun.reloadStart > this.player.gun.reloadTime)
            {
                this.player.gun.ammo = this.player.gun.fullAmmo;
                this.player.gun.reload = false;
            }
        }
    }
    
    setBullet(x,y){
        if(this.player.gun.reload || this.player.gun.ammo <= 0)
            return;
        // Проверяем скорострельность
        let now = new Date().getTime();
        if(now - this.player.gun.rateOfFireTimer < this.player.gun.rateOfFire)
            return;
        // Вычитаем из обоймы
        this.player.gun.ammo--;
        // Делаем пульку
        let startX = this.player.pos.x;
        let startY = this.player.pos.y;
        let vectorX = x - this.bord.indX;
        let vectorY = y - this.bord.indY;
        let speed = 1000;
        let speedX = startX - vectorX;
        let speedY = startY - vectorY;
        // Добавляем пульку
        let bullet = [ startX, startY, -speedX, -speedY, speed ];
        this.objects.bullets.push(bullet);
        // Отмечаем время выстрела
        this.player.gun.rateOfFireTimer = new Date().getTime();
    }

    checkEnemyHit(x,y){
        let hit = false;
        let die = {};
        this.objects.enemies.forEach( function(e,ind,obj){
            if( x > e[0] - 20 && x < e[0] + 20 && y > e[1] - 20 && y < e[1] + 20 ){
                obj.splice(ind,1);
                hit = true;
                die = { x:e[0], y:e[1] };
            }
        })
        if(hit){
            this.setTreck(die.x, die.y);
            this.checkRoundEnd();
            return true;
        }
        else{
            return false;
        }
            
    }

    moveBullets(){
        this.objects.bullets.forEach((b,ind,obj) => {
            let step = this.getStep( b[0],b[1],b[2]*1000,b[3]*1000,b[4] );
            let newX = b[0] += step.x;
            let newY = b[1] += step.y;
            
            if(newX < -100 || newX > this.bord.width + 100 || newY < -100 || newY > this.bord.height + 100){
                obj.splice(ind,1);
            }
            else{
                if( this.checkEnemyHit(b[0],b[1],ind,obj) )
                    obj.splice(ind,1);
            }
        })
    }

    shoot(ctx){
        this.moveBullets();
        this.objects.bullets.forEach(b => {
            ctx.beginPath();
            ctx.arc(
                b[0],
                b[1],
                3,
                0,
                Math.PI*2, false
            );
            ctx.fillStyle = "black";
            ctx.fill();
            ctx.closePath();
        });
    }

    //==================================== ENEMY
    randomEnemyStartPos(){
        let coords = { x: -60, y: -60 };
        let rand = Math.floor(Math.random()*this.bord.width);
        let side = Math.floor(Math.random()*4);
        
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
        let random = this.randomEnemyStartPos();
        let enemy = [ random.x, random.y, 0, 0 ];
        this.objects.enemies.push(enemy);
    }

    spamEnemy(){
        let now = new Date().getTime();
        if( now - this.game.timer > this.game.enemySpamTime && this.game.enemiesQty > 0 ){
            this.setEnemy();
            this.game.enemiesQty--;
            this.game.timer = now;
        }        
    }

    moveEnemies(){
        this.objects.enemies.forEach(b => {
            let step = this.getStep(b[0],b[1],this.player.pos.x,this.player.pos.y,this.game.enemySpeed);
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
    setTreck(x,y){
        this.objects.trecks.push([x,y]);
    }

    trecks(ctx){
        this.objects.trecks.forEach(t => {
            ctx.beginPath();
            ctx.arc(
                t[0],
                t[1],
                20,
                0,
                Math.PI*2, false
            );
            ctx.fillStyle = this.game.treckColor;
            ctx.fill();
            ctx.closePath();
        })
    }

    getStep(startX, startY, endX, endY, speed){
        let catX = endX - startX;
        let catY = endY - startY;
        let gip = Math.sqrt(catX**2 + catY**2);
        let res = {
            x: catX / gip / 60 * speed,
            y: catY / gip / 60 * speed
        }
        return res;
    }

    clearBord(ctx){
        ctx.clearRect(0, 0, this.bord.width, this.bord.height);
    }

    checkRoundEnd(){
        if(this.objects.enemies.length === 0){
            setTimeout(() => {
                if(confirm('One more?')){
                    this.resetControll();
                    this.setNextRound();
                }
            }, 1000)
        }
    }

    setNextRound(){
        this.game.enemiesQty = this.game.group = this.game.group*2;
        this.game.timer = new Date().getTime();
        this.game.enemySpeed += 1;
        this.game.enemySpamTime -= 50;
        this.game.round += 1;
    }

    //============================================ INTERFACE
    setInterface(){
        let root = document.getElementById('game');
        var panel = document.createElement('div');
        panel.id = 'interface';
        root.appendChild(panel);
    }

    addIElement(value){
        let el = document.createElement('div');
        el.innerHTML = value;
        return el;
    }

    updateInterface(){
        var panel = document.getElementById('interface');
        if(panel !== undefined){
            panel.innerHTML = '';

            panel.appendChild(this.addIElement( 'Round: ' + this.game.round ));
            
            panel.appendChild(this.addIElement( this.player.gun.name + ' | ' + this.player.gun.ammo ));
            
            panel.appendChild(this.addIElement( 'Enemies: ' + this.game.enemiesQty ));
        }
    }

    init(){
        const gameScene = document.getElementById('game');
        const canvas = document.createElement("canvas");
        canvas.id = 'bord';
        canvas.width = this.bord.width;
        canvas.height = canvas.width;
        gameScene.appendChild(canvas); 
        this.setPlayerPos(this.bord.width/2, this.bord.height/2);

        document.addEventListener("keydown", keyDownHandler, false);
        document.addEventListener("keyup", keyUpHandler, false);
        document.addEventListener("mousedown", mouseDownHandler, false);
        document.addEventListener("mouseup", mouseUpHandler, false);
        canvas.addEventListener("mousemove", onmouseMoveHandler, false);

        this.setInterface();

        this.game.roundStart = true;

        return canvas.getContext("2d");
    }

}

var d = new Constructor; // RELEASE class
let ctx = d.init();

//============================== MOVE
function keyDownHandler(e)
{    
    if(e.key == 'w'){d.setControllUp(true);}
    if(e.key == 'a'){d.setControllLeft(true);}
    if(e.key == 's'){d.setControllDown(true);}
    if(e.key == 'd'){d.setControllRight(true);}
}

function keyUpHandler(e)
{
    if(e.key == 'w'){d.setControllUp(false);}
    if(e.key == 'a'){d.setControllLeft(false);}
    if(e.key == 's'){d.setControllDown(false);}
    if(e.key == 'd'){d.setControllRight(false);}
}

//================================ SHOOT
var shooting;
var mouseX;
var mouseY;
function onmouseMoveHandler(e){
    mouseX = e.clientX;
    mouseY = e.clientY;
}
function mouseDownHandler(e){
    if( !e.target.closest('canvas') )
        return;
    
    if(e.which == 1){
        d.setBullet(mouseX,mouseY);
        if( d.player.gun.auto ){
            shooting = setInterval(()=>{
                d.setBullet(mouseX,mouseY);
            }, 100 )
        }
        else{
            d.setBullet(mouseX,mouseY);
        }
    }
}
function mouseUpHandler(e){
    if( !e.target.closest('canvas') )
        return;
    if(e.which == 1){
        clearInterval(shooting);
    }
}

//============================== DRAW
function draw(){
    d.updateInterface();
    d.clearBord(ctx);
    d.trecks(ctx);
    d.enemies(ctx);
    d.shoot(ctx);
    d.setPlayer(ctx);
    d.weaponReload();
}

setInterval(draw, 1000/60);