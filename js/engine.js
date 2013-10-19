/* Long story short, the game is first started by calling
 * the function intialize().
 * It goes through and puts all the stars and the player
 * entities into place. 
 * Then the function gameLoop is called, which is what
 * actually calls the main draw().
 * the draw function does more than draw, it checks for collisions,
 * updates movement and everything.
 * Then it goes back to the gameLoop and handles player controls
 * and player death.
 */
/* GLOBAL VARIABLES BEGIN HERE */
var width = 460,
    height = 640,
    fps = 1000/60,
    endGame = false,
    lives,
    UI,
    starCount1 = 100,
    stars1 = [],
    starCount2 = 200,
    stars2 = [],
    mLeft = false,
    mRight = false,
    mDown = false,
    mUp = false,
    priority = 5,
    powerUpLevel = 1,
    bulletNumberLevel = 1,
    newPBullet = false,
    spaceCounter = 0,
    playerFireSpeed = 12,
    playerBulletCount = 1500,
    playerBullets = [],
    playerBulletHeight = 6,
    playerBulletWidth = 2,
    playerLives = 3,
    enemyShips = [],
    enemyBullets = [],
    nyanBullets = [],
    nyanFireRate = 24,
    upgrades = [],
    score = 0,
    gLoop,
    gameTime = 0,
    timeTillNyan = 1800,
    nyanHealth = 10000,
    win = false,
    c = document.getElementById('c'),
    ctx = c.getContext('2d');
c.width = width;
c.height = height;
/* GLOBAL VARIABLES END HERE */

/* BACKGROUND VISUAL FUNCTIONS BEGIN HERE */
var clear = function() {
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.closePath();
    ctx.fill();
};
/* These functions control the stars in the background.
 * There are 2 star layers, to give a parallax scrolling feel.
 * Just a loop that rendomly generates a position for a 
 * star with a randomly generated color.
 */
var drawStarLayer1 = function() {
    for (var i = 0; i < starCount1; i++) {
        ctx.fillStyle = 'rgba(' + stars1[i][3] + ', ' + stars1[i][4] + ', ' + stars1[i][5] + ', ' + stars1[i][6] + ')';
        ctx.beginPath();
        ctx.rect(stars1[i][0], stars1[i][1], stars1[i][2], stars1[i][2]);
        ctx.closePath();
        ctx.fill();
    };
};

var moveStarLayer1 = function(dy) {
    for (var i = 0; i < starCount1; i++) {
        if (stars1[i][1] - stars1[i][2] > height) {
            stars1[i][0] = Math.random()*width;
            stars1[i][1] = 0 - stars1[i][2];
            stars1[i][3] = Math.floor(Math.random() * 255);
            stars1[i][4] = Math.floor(Math.random() * 255);
            stars1[i][5] = Math.floor(Math.random() * 255);
            stars1[i][6] = Math.random()/2;
        } else {
            stars1[i][1] += dy;
        };
    };
};

var drawStarLayer2 = function() {
    for (var i = 0; i < starCount2; i++) {
        ctx.fillStyle = 'rgba(' + stars2[i][3] + ', ' + stars2[i][4] + ', ' + stars2[i][5] + ', ' + stars2[i][6] + ')';
        ctx.beginPath();
        ctx.rect(stars2[i][0], stars2[i][1], stars2[i][2], stars2[i][2]);
        ctx.closePath();
        ctx.fill();
    };
};

var moveStarLayer2 = function(dy) {
    for (var i = 0; i < starCount2; i++) {
        if (stars2[i][1] - stars2[i][2] > height) {
            stars2[i][0] = Math.random()*width;
            stars2[i][1] = 0 - stars2[i][2];
            stars2[i][3] = Math.floor(Math.random() * 255);
            stars2[i][4] = Math.floor(Math.random() * 255);
            stars2[i][5] = Math.floor(Math.random() * 255);
            stars2[i][6] = Math.random()/2;
        } else {
            stars2[i][1] += dy;
        };
    };
};
/* BACKGROUND VISUAL FUNCTIONS END HERE */

/* PLAyER SHIP FUNCTIONS BEGIN HERE */
var player = new (function() {
    var ship = this;
    
    ship.imgLeft = "images/ship-left.png";
    ship.imgRight = "images/ship-right.png";
    ship.imgCenter = "images/ship-center.png";
    ship.image = new Image();
    ship.image.src = ship.imgCenter;
    ship.width = 30;
    ship.height = 32;
    ship.frames = 1;
    ship.actualFrame = 0;
    ship.x = 0;
    ship.y = 0;
    ship.show = true;
    ship.health = 1;
    ship.hitAmount = 4;
    ship.interval = 0;
    ship.invincible = 0;
    
    ship.setPosition = function(x,y) {
        ship.x = x;
        ship.y = y;
    };
    
    ship.draw = function() {
        try {
            if(ship.show == true) {
                ctx.drawImage(ship.image, 0, ship.height*ship.actualFrame, ship.width, ship.height, ship.x, ship.y, ship.width, ship.height);
            };
        } catch (e) {
            /* Do nothing */
        };
        
        if (ship.interval == 20) {
            if(ship.actualFrame == ship.frames) {
                ship.actualFrame = 0;
            } else {
                ship.actualFrame++;
            };
            ship.interval = 0;
        };
        ship.interval++;
    };
    
    ship.moveLeft = function() {
        if (ship.x > 0) {
            ship.setPosition(ship.x - 5, ship.y);
        };
    };
    
    ship.moveRight = function() {
        if (ship.x < width - ship.width) {
            ship.setPosition(ship.x + 5, ship.y);
        };
    };
    
    ship.moveUp = function() {
        if (ship.y > 0) {
            ship.setPosition(ship.x, ship.y - 5);
        };
    };
    
    ship.moveDown = function() {
        if (ship.y < height - (ship.height + 50)) {
            ship.setPosition(ship.x, ship.y + 5);
        };
    };
})();

/* This function handles what happens after a player dies.
 * Or what happens after you get a game over.
 */
var handlePlayerDeath = function() {
    if (player.show == true && endGame == false) {
        gLoop = setTimeout(GameLoop, fps);
    } else if (endGame == false) {
        powerUpBullet(1);
        speedUpBullet(0);
        powerUpNumber(0);
        if (playerLives > 0) {
            playerLives--;
            player.health = 1;
            gLoop = setTimeout(initialize, fps);
        } else {
            gLoop = setTimeout(gameOver, fps);
        };
    } else {
        powerUpBullet(1);
        speedUpBullet(0);
        powerUpNumber(0);
        gLoop = setTimeout(gameOver, fps);
    };
};
/* PLAyER SHIP FUNCTIONS END HERE */

/* ENEMy SHIP FUNCTIONS BEGIN HERE */
/* This function serves as the definition
 * for the boss nyan-cat object 
 */
var nyanCat = new (function() {
    var ship = this;
    
    ship.image = new Image();
    ship.image.src = 'images/nyan-big.png';
    ship.width = 272;
    ship.height = 168;
    ship.frames = 11;
    ship.actualFrame = 0;
    ship.x = width/2 - ship.width/2;
    ship.y = -ship.height;
    ship.show = true;
    ship.health = nyanHealth;
    ship.hitAmount = 1000;
    ship.interval = 0;
    ship.fint = 0;
    ship.mvright = true;
    ship.fireBuffer = 0;
    ship.invincible = 0;
    
    ship.setPosition = function(x,y) {
        ship.x = x;
        ship.y = y;
    };
    
    ship.draw = function() {
        try {
            if(ship.show == true) {
                ctx.drawImage(ship.image, 0, ship.height*ship.actualFrame, ship.width, ship.height, ship.x, ship.y, ship.width, ship.height);
            };
        } catch (e) {
            /* Do nothing */
        };
        
        if (ship.interval == 4) {
            if(ship.actualFrame == ship.frames) {
                ship.actualFrame = 0;
            } else {
                ship.actualFrame++;
            };
            ship.interval = 0;
        };
        ship.interval++;
    };
    
    ship.moveLeft = function() {
        if (ship.x > 0) {
            ship.setPosition(ship.x - 1, ship.y);
            return 1;
        };
        return 0;
    };
    
    ship.moveRight = function() {
        if (ship.x < width - ship.width) {
            ship.setPosition(ship.x + 1, ship.y);
            return 1;
        };
        return 0;
    };
    
    ship.moveDown = function() {
        if (ship.y < 50) {
            ship.setPosition(ship.x, ship.y + 1);
            return 1;
        };
        return 0;
    };

    ship.fire = function() {
        if(ship.fint%nyanFireRate == 0){
            eventNewNyanBullet();
            ship.fint = 0;
        }
        ship.fint++;
    };
    /* This function controls how and where nyan cat moves. */
    ship.move = function() {
        if (nyanCat.moveDown() == 0 && nyanCat.mvright == true){
            if(nyanCat.fireBuffer > 200 && nyanCat.fireBuffer < 400) {
                nyanCat.fire();
                nyanCat.fireBuffer++;
            } else if (nyanCat.fireBuffer == 600) {
                nyanCat.fireBuffer = 0;
            } else {
                nyanCat.fireBuffer++;
            };
            if (nyanCat.moveRight() == 0){
                nyanCat.mvright = false;
            };
        } else if (nyanCat.mvright == false) {
            if(nyanCat.fireBuffer > 200 && nyanCat.fireBuffer < 400) {
                nyanCat.fire();
                nyanCat.fireBuffer++;
            }
            else if (nyanCat.fireBuffer == 600) {
                nyanCat.fireBuffer = 0;
            } else {
                nyanCat.fireBuffer++;
            };
            if (nyanCat.moveLeft() == 0){
                nyanCat.mvright = true;
            };
        };
    };
})();
/* This function serves as the definition
 * for the regular enemy objects
 */
var enemyShipType1 = function(x, y, health) {
    var ship = this;

    ship.image = new Image();
    ship.image.src = "images/ship.png";
    ship.width = 30;
    ship.height = 30;
    ship.frames = 1;
    ship.actualFrame = 0;
    ship.x = x;
    ship.y = y;
    ship.originalY = y;
    ship.interval = 0;
    ship.show = true;
    ship.health = health;
    ship.hitAmount = 4;
    ship.frameCounter = 0;
    ship.invincible = 0;

    ship.setPosition = function(x,y) {
        ship.x = x;
        ship.y = y;
    };

    ship.draw = function() {
        try {
            if(ship.show == true) {
                ship.frameCounter++;
                ctx.drawImage(ship.image, 0, ship.height*ship.actualFrame, ship.width, ship.height, ship.x, ship.y, ship.width, ship.height);
            };
        } catch (e) {
            /* Do nothing */
        };
        
        if (ship.interval == 20) {
            if(ship.actualFrame == ship.frames) {
                ship.actualFrame = 0;
            } else {
                ship.actualFrame++;
            };
            ship.interval = 0;
        };
        ship.interval++;
    };
    ship.moveDown = function(rate) {
        /*ship.setPosition(ship.x + Math.cos(0.02*(ship.frameCounter + ship.originalY))*1.5, ship.y + rate);*/
        ship.setPosition(ship.x, ship.y + rate);
        if(ship.y > 50 && ship.frameCounter%20 == 0 && Math.abs(ship.x - player.x) < 2 && Math.random()*100 > 20){
            eventNewEnemyBullet(ship.x + 15, ship.y + ship.height);
        } else if (ship.y > 50 && ship.frameCounter%100 == 0 && Math.random()*100 > 95){
            eventNewEnemyBullet(ship.x + 15, ship.y + ship.height);
        };
    };
};

var newEnemyShipType1 = function(x, y, h) {
    enemyShips.push(new enemyShipType1(x, y, h));
};

var spawnEnemyShips = function() {
    if (enemyShips.length < 20) {
        newEnemyShipType1(Math.random()*(width-30), 0 - (Math.random()*height), 4);
    };
};
/* ENEMy SHIP FUNCTIONS END HERE */

/* PROJECTILE FUNCTIONS BEGIN HERE */
/* Player bullet entity */
var playerBullet = function(x,y,height,width, powerLevel) {
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = width;
    this.show = true;
    this.health = 1;
    this.powerLevel = powerLevel;
    this.hitAmount = 1 * this.powerLevel;
    this.invincible = 0;
};
/* enemy bullet entity */
var enemyBullet = function(x,y,height,width, powerLevel) {
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = width;
    this.show = true;
    this.health = 1;
    this.powerLevel = powerLevel;
    this.hitAmount = 1 * this.powerLevel;
    this.invincible = 0;
};
/* nyan cat rainbow entity */
var nyanBullet = function(x,y) {
    this.x = x;
    this.y = y;
    this.height = 96;
    this.width = 152;
    this.show = true;
    this.health = 1000000;
    this.hitAmount = 1000000;
    this.image = new Image();
    this.image.src = 'images/nyan-rainbow.png';
    this.frames = 1;
    this.actualFrame = 0;
    this.interval = 0;
    this.invincible = 0;
};
/* upgrade item entity */
var upGrade = function(x,y,type) {
    this.x = x;
    this.y = y;
    this.height = 20;
    this.width = 20;
    this.show = true;
    this.type = type;
    this.health = 1;
    this.hitAmount = 0;
    this.actualFrame = 0;
    this.frames = 1;
    this.interval = 0;
    this.image = new Image();
    this.invincible = 0;

    if(this.type == 1){ /* Number */
        this.image.src = "images/upgrade-number.png";
    } else if(this.type == 2){ /* Speed */
        this.image.src = "images/upgrade-speed.png";
    } else if(this.type == 3){ /* Power */
        this.image.src = "images/upgrade-power.png";
    }

    this.draw = function() {
        try {
            if(this.show == true) {
                ctx.drawImage(this.image, 0, this.height*this.actualFrame, this.width, this.height, this.x, this.y, this.width, this.height);
            };
        } catch (e) {
            /* Do nothing */
        };
        
        if (this.interval == 20) {
            if(this.actualFrame == this.frames) {
                this.actualFrame = 0;
            } else {
                this.actualFrame++;
            };
            this.interval = 0;
        };
        this.interval++;
    };

    this.moveDown = function(rate) {
        this.y += rate;
    };
};
/* creates a new upgrade */
var newUpgrade = function(x,y) {
    upgrades.push(new upGrade(x,y, Math.floor(Math.random()*3) + 1))
};
/* What actually handles when the newUpgrade function is called */
var spawnUpgrade = function() {
    if (upgrades.length < 3 && Math.random()*10000 > 9950) {
        newUpgrade(Math.random()*(width - 20) + 10, -20);
    };
};
/* creates new enemy bullet */
var eventNewEnemyBullet = function(x, y) {
    enemyBullets.push(new enemyBullet(x, y, playerBulletHeight, playerBulletWidth, 4));
};
/* What actually handles when the eventNewEnemyBullet function is called */
var eventNewNyanBullet = function() {
    nyanBullets.push(new nyanBullet(nyanCat.x + 64,nyanCat.y + 140));
};
/* Is called by keyboard handlers after pressing space.
 * This actually controls how often a bullet can be fired
 */
var eventNewPlayerBullet = function() {
    if (bulletNumberLevel == 3 && playerBullets.length < playerBulletCount && newPBullet == true && spaceCounter%playerFireSpeed == 0) {
        playerBullets.push(new playerBullet(player.x - 1000, player.y + 15,playerBulletHeight, playerBulletWidth, powerUpLevel));
        playerBullets.push(new playerBullet(player.x + 0, player.y + 15,playerBulletHeight, playerBulletWidth, powerUpLevel));
        playerBullets.push(new playerBullet(player.x + 6, player.y + 12,playerBulletHeight, playerBulletWidth, powerUpLevel));
        playerBullets.push(new playerBullet(player.x + 22, player.y + 12,playerBulletHeight, playerBulletWidth, powerUpLevel));
        playerBullets.push(new playerBullet(player.x + 28, player.y + 15,playerBulletHeight, playerBulletWidth, powerUpLevel));
        spaceCounter++;
    }
    else if (bulletNumberLevel == 2 && playerBullets.length < playerBulletCount && newPBullet == true && spaceCounter%playerFireSpeed == 0) {
        playerBullets.push(new playerBullet(player.x - 1000, player.y + 15,playerBulletHeight, playerBulletWidth, powerUpLevel));
        playerBullets.push(new playerBullet(player.x + 6, player.y + 12,playerBulletHeight, playerBulletWidth, powerUpLevel));
        playerBullets.push(new playerBullet(player.x + 22, player.y + 12,playerBulletHeight, playerBulletWidth, powerUpLevel));
        spaceCounter++;
    }
    else if (bulletNumberLevel == 1 && playerBullets.length < playerBulletCount && newPBullet == true && spaceCounter%playerFireSpeed == 0) {
        playerBullets.push(new playerBullet(player.x + 14, player.y,playerBulletHeight, playerBulletWidth, powerUpLevel));
        spaceCounter++;
    }
    else if (newPBullet) {
        spaceCounter++;
    };
};
/* draws all bullet entities */
var drawBullet = function() {
    for(var i = 0; i < nyanBullets.length; i++) {
        nyanBullets[i].y += 4;
        try {
            ctx.drawImage(nyanBullets[i].image, 0, nyanBullets[i].height * nyanBullets[i].actualFrame, nyanBullets[i].width, nyanBullets[i].height, nyanBullets[i].x, nyanBullets[i].y, nyanBullets[i].width, nyanBullets[i].height);
            ctx.closePath;
        } catch (e) {
            /* Do nothing */
        };

        if (nyanBullets[i].interval == 10) {
            if(nyanBullets[i].actualFrame == nyanBullets[i].frames) {
                nyanBullets[i].actualFrame = 0;
            } else {
                nyanBullets[i].actualFrame++;
            };
            nyanBullets[i].interval = 0;
        };
        nyanBullets[i].interval++;

        if (nyanBullets[i].y > height) {
            nyanBullets.splice(i,1);
            i--;
        };
    };
    for(var i = 0; i < enemyBullets.length; i++) {
        enemyBullets[i].y += 10;
        ctx.fillStyle = 'rgba(255,0,0,1)';
        if (enemyBullets[i].show == true){
            ctx.beginPath();
            ctx.rect(enemyBullets[i].x, enemyBullets[i].y, enemyBullets[i].width, enemyBullets[i].height);
            ctx.closePath();
            ctx.fill();
        }
        if (enemyBullets[i].y > height || enemyBullets[i].show == false) {
            enemyBullets.splice(i,1);
            i--;
        };
    };
    for(var i = 0; i < playerBullets.length; i++) {
        playerBullets[i].y -= 10;
        if (playerBullets[i].powerLevel > 3) {
            ctx.fillStyle = 'rgba(' + Math.floor(Math.random()*255) + ', ' + Math.floor(Math.random()*255) + ', ' + Math.floor(Math.random()*255) + ', 1)';
        } else if (playerBullets[i].powerLevel > 2) {
            ctx.fillStyle = 'rgba(' + 0 + ', ' + 169 + ', ' + 255 + ', 1)';
        } else if (playerBullets[i].powerLevel > 1) {
            ctx.fillStyle = 'rgba(' + 255 + ', ' + 0 + ', ' + 0 + ', 1)';
        } else {
            ctx.fillStyle = 'rgba(' + 0 + ', ' + 255 + ', ' + 0 + ', 1)';
        }
        if (playerBullets[i].show == true) {
            ctx.beginPath();
            ctx.rect(playerBullets[i].x, playerBullets[i].y, playerBullets[i].width, playerBullets[i].height);
            ctx.closePath();
            ctx.fill();
        };
        if (playerBullets[i].y < 0 || playerBullets[i].show == false) {
            playerBullets.splice(i,1);
            i--;
        };
    };
};
/* these functions set the different upgrade values */
var powerUpBullet = function(level) {
    powerUpLevel = level;
};

var speedUpBullet = function(speed) {
    if(speed == 0){
        playerFireSpeed = 12;
    } else {
        playerFireSpeed = playerFireSpeed/2;
    };
};

var powerUpNumber = function(num) {
    if (num == 0) {
        bulletNumberLevel = 1;
    } else {
        if (bulletNumberLevel < 3) {
            bulletNumberLevel++;
        };
    };
};
/* PROJECTILE FUNCTIONS END HERE */

/* COLLISION HANDLING FUNCTION BEGINS HERE */

/* This is where the main magic happens.
 * All of the games objects were designed to
 * have a set of common variables, those being:
 * health, hitAmount, show, height, width, x, and y.
 * health controls how much health the object has
 * hitAmount controls how much the colliding object
 * falls in health.
 * show dictates if the object should be drawn.
 * height is the bounding-box height
 * width is the bounding-box width
 * x is x coordinate on screen, analagous with y.
 * 
 * The x, y, width, and height values are compared
 * to see if a collision occured.
 * If yes, then the two objects fall in health
 * by the other's hitAmount.
 * Then the function returns true or false depending
 * on if there was a hit.
 */
var checkCollision = function(entity1, entity2) {
    /* 0 - LEFT, 1 - RIGHT, 2 - TOP, 3 - BOTTOM */
    if (entity1.y <= (entity2.y + entity2.height) && entity2.y <= (entity1.y + entity1.height)) {
        if (entity1.x <= (entity2.x + entity2.width) && entity2.x <= (entity1.x + entity1.width)) {
            if(entity1.invincible == 0){
                entity1.health -= entity2.hitAmount;
            }
            if(entity2.invincible == 0){
                entity2.health -= entity1.hitAmount;
            }
            if(entity1.health <= 0) {
                entity1.show = false;
            };
            if(entity2.health <= 0) {
                entity2.show = false;
            };
            return true;
        };
    } else {
        return false;
    };
};
/* COLLISION HANDLING FUNCTION ENDS HERE */

/* UI HANDLING FUNCTION BEGINS HERE */
/* Draw the user interface */
var increaseScore = function(amount) {
    score = score + amount;
};

var drawScore = function() {
    ctx.fillStyle = "#FFFFFF";
    ctx.font="30px Arial";
    ctx.fillText(score,55,35);
};

var drawWin = function() {
    ctx.fillStyle = "#FFFFFF";
    ctx.font="30px Arial";
    ctx.fillText("You're",width/2 - 60,height/2 - 20);
    ctx.fillText("Winner !",width/2 - 65,height/2 + 20);
};

var drawLives = function() {
    this.image = new Image();
    this.image.src = "images/ship-center.png";
    this.x = width/2 - 85;
    this.y = height - 41;
    this.width = 30;
    this.height = 32;
    this.actualFrame = 0;
    this.draw = function() {
        for (var i = 0; i < playerLives; i++) {
            try {
                ctx.drawImage(this.image, 0, this.height * this.actualFrame, this.width, this.height, this.x + 35*(i + 1), this.y, this.width, this.height);
                ctx.closePath;
            } catch (e) {
                /* Do nothing */
            };
        };
    };
};

var drawUI = function() {
    this.imageTop = new Image();
    this.imageTop.src = "images/ui-bar-top.png";
    this.imageBottom = new Image();
    this.imageBottom.src = "images/ui-bar-bottom.png";
    this.draw = function() {
        try {
            ctx.drawImage(this.imageTop, 0,0);
            ctx.drawImage(this.imageBottom, 0,height - 50);
        } catch (e) {
        };
    };
    
    /*
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.rect(0, height - 50, width, 50);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.rect(0, 0, width, 50);
    ctx.closePath();
    ctx.fill();
    */
};
/* UI HANDLING FUNCTION ENDS HERE */

/* KEy EVENT HANDLER FUNCTIONS BEGIN HERE */
/* handles the possible key presses */
document.onkeydown = function(e) {
    if (e.keyCode == '73' && endGame == true) { /* i key */
        initialize();
    };
    if (e.keyCode == '80') { /* p key */
        if (powerUpLevel == 1) {
            powerUpBullet(4);
        } else {
            powerUpBullet(1);
        };
    };
    if (e.keyCode == '32' && player.show == true) { /* space key */
        newPBullet = true;     
    };
    if (e.keyCode == '65' || e.keyCode == '37') { /* a or arrow left */
        mLeft = true;
        priority = 0;
    } else if (e.keyCode == '68' || e.keyCode == '39') { /* d or arrow right */
        mRight = true;
        priority = 1;
    } else if (e.keyCode == '87' || e.keyCode == '38') { /* w or arrow up */
        mUp = true;
        priority = 2;
    } else if (e.keyCode == '83' || e.keyCode == '40') { /* s or arrow down */
        mDown = true;
        priority = 3;
    };
};

document.onkeyup = function(e) {
    if (e.keyCode == '32') {
        newPBullet = false;
        spaceCounter = 0;
    };
    if (e.keyCode == '65' || e.keyCode == '37') {
        mLeft = false;
    } else if (e.keyCode == '68' || e.keyCode == '39') {
        mRight = false;
    } else if (e.keyCode == '87' || e.keyCode == '38') {
        mUp = false;
    } else if (e.keyCode == '83' || e.keyCode == '40') {
        mDown = false;
    };
};
/* KEy EVEN HANDLER FUNCTIONS END HERE */

/* MAIN GAME LOOP FUNCTIONS BEGINS HERE */
/* This draws, calls for collision checking, and updates movement */
var draw = function() {
    clear();
    moveStarLayer2(1);
    drawStarLayer2();
    moveStarLayer1(1.5);
    drawStarLayer1();
    eventNewPlayerBullet();
    spawnUpgrade();
    for(var i = 0; i < upgrades.length; i++){
        upgrades[i].moveDown(1);
        upgrades[i].draw();
        var collided = checkCollision(player, upgrades[i]);
        if (collided == true) {
            if(upgrades[i].type == 1) { /* Number */
                powerUpNumber(1);
            } else if(upgrades[i].type == 2) { /* Speed */
                speedUpBullet(1);
            } else if(upgrades[i].type == 3) { /* Power */
                powerUpBullet(powerUpLevel + 1);
            };
        };
        if(upgrades[i].y > height || upgrades[i].show == false) {
            upgrades.splice(i,1);
        }
    };
    if(gameTime > timeTillNyan && enemyShips.length == 0) {
        nyanCat.move();
        checkCollision(player, nyanCat);
        for (var i = 0; i < playerBullets.length; i++){
            checkCollision(playerBullets[i], nyanCat);
        }
        for (var i = 0; i < nyanBullets.length; i++) {
            checkCollision(player, nyanBullets[i]);
        };
        if (nyanCat.show == false) {
            win = true;
        };
    } else if (gameTime <= timeTillNyan) {
        spawnEnemyShips();
        gameTime++;
    };
    player.draw();
    for (var i = 0; i < enemyShips.length; i++) {
        enemyShips[i].moveDown(2);
        for (var j = 0; j < playerBullets.length; j++) {
            if(enemyShips[i].show == true && playerBullets[j].show == true) {
                var collided = checkCollision(enemyShips[i], playerBullets[j]);
                if (collided == true && enemyShips[i].show == false) {
                    increaseScore(10);
                }
            };
        };
        if(enemyShips[i].show == true && player.show == true){
            checkCollision(enemyShips[i], player);
        };
        enemyShips[i].draw();
        if (enemyShips[i].show == false || enemyShips[i].y > height) {
            enemyShips.splice(i,1);
            i--;
        };
    };
    for (var i = 0; i < enemyBullets.length; i++){
        if(player.show == true && enemyBullets[i].show == true){
            var collided = checkCollision(player, enemyBullets[i]);
        };
    };
    nyanCat.draw();
    drawBullet();
    UI.draw();
    drawScore();
    lives.draw();
};
/* Main loop that is called forever until the game ends */
var GameLoop = function() {
    if(player.invincible > 0) {
        player.invincible--;
    };
    draw();
    /* PLAYER CONTROL CODE BEGINS HERE */
    if (mLeft == true && mUp == true && (priority == 0 || priority == 2) ) {
        player.image.src = player.imgLeft;
        player.moveLeft();
        player.moveUp();
    } else if (mLeft == true && mDown == true && (priority == 0 || priority == 3) ) {
        player.image.src = player.imgLeft;
        player.moveLeft();
        player.moveDown();
    } else if (mRight == true && mUp == true && (priority == 1 || priority == 2) ) {
        player.image.src = player.imgRight;
        player.moveRight();
        player.moveUp();
    } else if (mRight == true && mDown == true && (priority == 1 || priority == 3) ) {
        player.image.src = player.imgRight;
        player.moveRight();
        player.moveDown();
    } else if (mLeft == true && priority == 0) {
        player.image.src = player.imgLeft;
        player.moveLeft();
    } else if (mRight == true && priority == 1) {
        player.image.src = player.imgRight;
        player.moveRight();
    } else if (mUp == true && priority == 2) {
        player.image.src = player.imgCenter;
        player.moveUp();
    } else if (mDown == true && priority == 3) {
        player.image.src = player.imgCenter;
        player.moveDown();
    } else if (mLeft == true) {
        player.image.src = player.imgLeft;
        player.moveLeft();
    } else if (mRight == true) {
        player.image.src = player.imgRight;
        player.moveRight();
    } else if (mUp == true) {
        player.image.src = player.imgCenter;
        player.moveUp();
    } else if (mDown == true) {
        player.image.src = player.imgCenter;
        player.moveDown();
    } else {
        player.image.src = player.imgCenter;
    };
    handlePlayerDeath();
    if(nyanCat.show == false && endGame == false) {
        increaseScore(100000000);
        endGame = true;
    };
    /* PLAYER CONTROL CODE ENDS HERE */
};
/* MAIN GAME LOOP FUNCTION ENDS HERE */

/* GAME INITIALIZATION FUNCTION BEGINS HERE */
/* Intializes the game screen and play area */
var initialize = function() {
    lives = new drawLives();
    UI = new drawUI();
    if (endGame == true) {
        gameTime = 0;
    };
    endGame = false;
    gLoop = null;
    player.invincible = 60;
    for (var i = stars1.length; i < starCount1; i++){
        stars1.push([Math.random()*width, Math.random()*height, Math.random()*4, Math.floor(Math.random() * 255), Math.floor(Math.random()*255), Math.floor(Math.random()*255), Math.random()/2]);
    };
    /* 0 - x, 1 - y, 2 - size, 3 - RED, 4 - GREEN, 5 - BLUE, 6 - Transparency */

    for (var i = stars2.length; i < starCount2; i++){
        stars2.push([Math.random()*width, Math.random()*height, Math.random()*4, Math.floor(Math.random() * 255), Math.floor(Math.random()*255), Math.floor(Math.random()*255), Math.random()/2]);
    };
    /* 0 - x, 1 - y, 2 - size, 3 - RED, 4 - GREEN, 5 - BLUE, 6 - Transparency */

    player.setPosition(~~((width-player.width)/2), ~~((height-(player.height + 50))));
    player.show = true;
    GameLoop();
};
/* Called when the game ends via deat or winning */
var gameOver = function() {
    gameTime = 0;
    nyanCat.fint = 0;
    nyanCat.x = width/2 - nyanCat.width/2;
    nyanCat.y = -nyanCat.height;
    nyanCat.health = nyanHealth;
    nyanCat.show = true;
    endGame = true;
    player.show = false;
    gLoop = null;
    draw();
    enemyShips.length = 0;
    playerBullets.length = 0;
    enemyBullets.length = 0;
    upgrades.length = 0;
    nyanBullets.length = 0;
    score = 0;
    playerLives = 3;
    powerUpLevel = 1;
    ctx.fillStyle = "#FFFFFF";
    ctx.font="30px Arial";
    ctx.fillText("Press 'i' to restart!",width/2 - 118,height/2 - 80);
    if (win == true){
        ctx.fillText("You're",width/2 - 50,height/2 - 20);
        ctx.fillText("Winner !",width/2 - 54,height/2 + 20);
        win = false;
    }
};
/* GAME INITIALIZATION FUNCTION ENDS HERE */
initialize();