// ============================================================================
// CED CRUISIN' USA
// A retirement send-off game for Cedric
//
// Road engine based on javascript-racer by Jake Gordon
// https://github.com/jakesgordon/javascript-racer
// Licensed under MIT - Copyright (c) 2012-2016 Jake Gordon and contributors
// ============================================================================

//=============================================================================
// GAME CONSTANTS & CONFIGURATION
//=============================================================================

var fps            = 60;
var step           = 1/fps;
var width          = 1024;
var height         = 768;
var centrifugal    = 0.3;
var skySpeed       = 0.001;
var hillSpeed      = 0.002;
var treeSpeed      = 0.003;
var skyOffset      = 0;
var hillOffset     = 0;
var treeOffset     = 0;
var segments       = [];
var cars           = [];
var canvas         = Dom.get('canvas');
var ctx            = canvas.getContext('2d');
var background     = null;
var sprites        = null;
var resolution     = null;
var roadWidth      = 2000;
var segmentLength  = 200;
var rumbleLength   = 3;
var trackLength    = null;
var lanes          = 3;
var fieldOfView    = 100;
var cameraHeight   = 1000;
var cameraDepth    = null;
var drawDistance    = 300;
var playerX        = 0;
var playerZ        = null;
var fogDensity     = 5;
var position       = 0;
var speed          = 0;
var maxSpeed       = segmentLength/step;
var accel          = maxSpeed/5;
var breaking       = -maxSpeed;
var decel          = -maxSpeed/5;
var offRoadDecel   = -maxSpeed/2;
var offRoadLimit   = maxSpeed/4;
var totalCars      = 50;

var keyLeft        = false;
var keyRight       = false;
var keyFaster      = false;
var keySlower      = false;

//=============================================================================
// CED CRUISIN' GAME STATE
//=============================================================================

var GAME_STATE = 'menu';  // 'menu', 'playing', 'gameover'

// Trip Vibe
var vibe           = 100;
var vibeMax        = 100;
var vibeWarningTimer = 0;

// Score
var score          = 0;
var stampsCollected = 0;
var totalStamps    = 5;
var memoriesCollected = 0;
var cleanStreak    = 0;
var bestCleanStreak = 0;

// Boost
var boostActive    = false;
var boostTimer     = 0;
var boostCooldown  = 0;
var boostUsed      = false;
var BOOST_DURATION = 1.5;
var BOOST_COOLDOWN = 4.0;
var BOOST_SPEED_MULT = 1.5;

// Hit state
var invulnerable   = false;
var invulnTimer    = 0;
var speedPenalty   = false;
var speedPenaltyTimer = 0;

// Collectibles placed on road
var collectibles   = [];  // {segment, offset, type, collected, source}

// Zone tracking
var currentZone    = 1;
var zoneTransition = 0;  // 0-1 blend progress

// Game over data
var gameOverData   = null;

// Floating text popups
var floatingTexts  = [];  // {x, y, text, color, timer}

// Constant speed for CED (no acceleration, always moving)
var CED_SPEED_RATIO = 0.45;  // fraction of maxSpeed
var cedBaseSpeed    = maxSpeed * CED_SPEED_RATIO;

//=============================================================================
// CED TUNING
//=============================================================================

var CED = {
  VIBE_HAZARD_COST:    15,
  VIBE_OFFROAD_DRAIN:  8,    // per second
  VIBE_PICKUP_GAIN:    5,
  VIBE_CLEAN_GAIN:     0.5,  // per second
  VIBE_WARNING:        25,

  STAMP_POINTS:        250,
  MEMORY_POINTS:       100,
  DISTANCE_DIVISOR:    10,
  CLEAN_5S:            50,
  CLEAN_10S:           150,
  CLEAN_20S:           400,

  HIT_SPEED_PENALTY:   0.6,
  HIT_PENALTY_DUR:     0.8,
  HIT_INVULN_DUR:      1.0,

  RANKS: [
    { min: 8000, name: 'National Treasure', tagline: 'The open road belongs to Ced' },
    { min: 5000, name: 'Road Warrior',      tagline: 'Every stamp, every mile' },
    { min: 2000, name: 'Park Explorer',     tagline: 'Ced knows the road' },
    { min: 0,    name: 'Scenic Tourist',    tagline: 'Not bad for a first trip' },
  ],

  CAPTIONS: ['good call', 'worth it', 'classic', 'scenic route', 'perfect day', 'let\'s go'],
};

//=============================================================================
// ZONE COLORS — 3 acts of the journey
//=============================================================================

var ZONE_COLORS = {
  1: { // Highway — leaving work
    SKY:  '#72D7EE',
    FOG:  '#72D7EE',
    LIGHT: { road: '#6B6B6B', grass: '#10AA10', rumble: '#555555', lane: '#CCCCCC' },
    DARK:  { road: '#696969', grass: '#009A00', rumble: '#BBBBBB' },
  },
  2: { // Parks — retirement life
    SKY:  '#5BA8D0',
    FOG:  '#3D7A3D',
    LIGHT: { road: '#636363', grass: '#0D880D', rumble: '#444444', lane: '#BBBBBB' },
    DARK:  { road: '#606060', grass: '#0A7A0A', rumble: '#999999' },
  },
  3: { // Scenic finish — sunset payoff
    SKY:  '#FF8844',
    FOG:  '#FF8844',
    LIGHT: { road: '#6E6E6E', grass: '#6B8E23', rumble: '#FF6600', lane: '#FFEECC' },
    DARK:  { road: '#6B6B6B', grass: '#5A7D1E', rumble: '#FFEECC' },
  },
};

// Active colors (blended between zones during transitions)
var COLORS = {
  SKY:  '#72D7EE',
  TREE: '#005108',
  FOG:  '#005108',
  LIGHT:  { road: '#6B6B6B', grass: '#10AA10', rumble: '#555555', lane: '#CCCCCC' },
  DARK:   { road: '#696969', grass: '#009A00', rumble: '#BBBBBB' },
  START:  { road: 'white',   grass: 'white',   rumble: 'white' },
  FINISH: { road: 'black',   grass: 'black',   rumble: 'black' }
};

//=============================================================================
// SPRITES (Jake Gordon's spritesheet — placeholder until Phase 2)
//=============================================================================

var BACKGROUND = {
  HILLS: { x:   5, y:   5, w: 1280, h: 480 },
  SKY:   { x:   5, y: 495, w: 1280, h: 480 },
  TREES: { x:   5, y: 985, w: 1280, h: 480 }
};

var SPRITES = {
  PALM_TREE:              { x:    5, y:    5, w:  215, h:  540 },
  BILLBOARD08:            { x:  230, y:    5, w:  385, h:  265 },
  TREE1:                  { x:  625, y:    5, w:  360, h:  360 },
  DEAD_TREE1:             { x:    5, y:  555, w:  135, h:  332 },
  BILLBOARD09:            { x:  150, y:  555, w:  328, h:  282 },
  BOULDER3:               { x:  230, y:  280, w:  320, h:  220 },
  COLUMN:                 { x:  995, y:    5, w:  200, h:  315 },
  BILLBOARD01:            { x:  625, y:  375, w:  300, h:  170 },
  BILLBOARD06:            { x:  488, y:  555, w:  298, h:  190 },
  BILLBOARD05:            { x:    5, y:  897, w:  298, h:  190 },
  BILLBOARD07:            { x:  313, y:  897, w:  298, h:  190 },
  BOULDER2:               { x:  621, y:  897, w:  298, h:  140 },
  TREE2:                  { x: 1205, y:    5, w:  282, h:  295 },
  BILLBOARD04:            { x: 1205, y:  310, w:  268, h:  170 },
  DEAD_TREE2:             { x: 1205, y:  490, w:  150, h:  260 },
  BOULDER1:               { x: 1205, y:  760, w:  168, h:  248 },
  BUSH1:                  { x:    5, y: 1097, w:  240, h:  155 },
  CACTUS:                 { x:  929, y:  897, w:  235, h:  118 },
  BUSH2:                  { x:  255, y: 1097, w:  232, h:  152 },
  BILLBOARD03:            { x:    5, y: 1262, w:  230, h:  220 },
  BILLBOARD02:            { x:  245, y: 1262, w:  215, h:  220 },
  STUMP:                  { x:  995, y:  330, w:  195, h:  140 },
  SEMI:                   { x: 1365, y:  490, w:  122, h:  144 },
  TRUCK:                  { x: 1365, y:  644, w:  100, h:   78 },
  CAR03:                  { x: 1383, y:  760, w:   88, h:   55 },
  CAR02:                  { x: 1383, y:  825, w:   80, h:   59 },
  CAR04:                  { x: 1383, y:  894, w:   80, h:   57 },
  CAR01:                  { x: 1205, y: 1018, w:   80, h:   56 },
  PLAYER_UPHILL_LEFT:     { x: 1383, y:  961, w:   80, h:   45 },
  PLAYER_UPHILL_STRAIGHT: { x: 1295, y: 1018, w:   80, h:   45 },
  PLAYER_UPHILL_RIGHT:    { x: 1385, y: 1018, w:   80, h:   45 },
  PLAYER_LEFT:            { x:  995, y:  480, w:   80, h:   41 },
  PLAYER_STRAIGHT:        { x: 1085, y:  480, w:   80, h:   41 },
  PLAYER_RIGHT:           { x:  995, y:  531, w:   80, h:   41 }
};

SPRITES.SCALE = 0.3 * (1/SPRITES.PLAYER_STRAIGHT.w);
SPRITES.BILLBOARDS = [SPRITES.BILLBOARD01, SPRITES.BILLBOARD02, SPRITES.BILLBOARD03, SPRITES.BILLBOARD04, SPRITES.BILLBOARD05, SPRITES.BILLBOARD06, SPRITES.BILLBOARD07, SPRITES.BILLBOARD08, SPRITES.BILLBOARD09];
SPRITES.PLANTS     = [SPRITES.TREE1, SPRITES.TREE2, SPRITES.DEAD_TREE1, SPRITES.DEAD_TREE2, SPRITES.PALM_TREE, SPRITES.BUSH1, SPRITES.BUSH2, SPRITES.CACTUS, SPRITES.STUMP, SPRITES.BOULDER1, SPRITES.BOULDER2, SPRITES.BOULDER3];
SPRITES.CARS       = [SPRITES.CAR01, SPRITES.CAR02, SPRITES.CAR03, SPRITES.CAR04, SPRITES.SEMI, SPRITES.TRUCK];

//=============================================================================
// SFX — Procedural Web Audio
//=============================================================================

var SFX = {
  ctx: null, masterGain: null, engineOsc: null, engineGain: null,

  init: function() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.3;
      this.masterGain.connect(this.ctx.destination);
    } catch(e) {}
  },
  resume: function() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); },
  tone: function(freq, dur, type, vol) {
    if (!this.ctx) return;
    var osc = this.ctx.createOscillator();
    var gain = this.ctx.createGain();
    osc.type = type || 'sine'; osc.frequency.value = freq;
    gain.gain.value = vol || 0.3;
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
    osc.connect(gain); gain.connect(this.masterGain);
    osc.start(); osc.stop(this.ctx.currentTime + dur);
  },
  pickup: function() { this.tone(880, 0.1, 'sine', 0.25); },
  stamp: function() {
    if (!this.ctx) return;
    var now = this.ctx.currentTime;
    var self = this;
    [660, 880, 1100].forEach(function(f, i) {
      var osc = self.ctx.createOscillator();
      var gain = self.ctx.createGain();
      osc.type = 'sine'; osc.frequency.value = f;
      gain.gain.value = 0.2;
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07*(i+1) + 0.08);
      osc.connect(gain); gain.connect(self.masterGain);
      osc.start(now + 0.07*i); osc.stop(now + 0.07*(i+1) + 0.08);
    });
  },
  collision: function() {
    if (!this.ctx) return;
    this.tone(200, 0.2, 'sine', 0.3);
    var bufferSize = this.ctx.sampleRate * 0.1;
    var buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) data[i] = (Math.random()*2-1)*0.3;
    var noise = this.ctx.createBufferSource(); noise.buffer = buffer;
    var gain = this.ctx.createGain(); gain.gain.value = 0.15;
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    noise.connect(gain); gain.connect(this.masterGain); noise.start();
  },
  boost: function() {
    if (!this.ctx) return;
    var osc = this.ctx.createOscillator(); var gain = this.ctx.createGain();
    osc.type = 'sawtooth'; osc.frequency.value = 200;
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.3);
    gain.gain.value = 0.12;
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);
    osc.connect(gain); gain.connect(this.masterGain);
    osc.start(); osc.stop(this.ctx.currentTime + 0.4);
  },
  vibeWarning: function() { this.tone(120, 0.15, 'sine', 0.12); },
};

//=============================================================================
// UPDATE — CED CRUISIN' GAME LOGIC
//=============================================================================

function update(dt) {
  if (GAME_STATE !== 'playing') return;

  var playerSegment = findSegment(position + playerZ);
  var playerW       = SPRITES.PLAYER_STRAIGHT.w * SPRITES.SCALE;
  var speedPercent  = speed/maxSpeed;
  var dx            = dt * 2 * speedPercent;
  var startPosition = position;

  updateCars(dt, playerSegment, playerW);

  // --- Constant forward speed (CED doesn't brake/accelerate, just drives) ---
  var effectiveSpeed = cedBaseSpeed;
  if (boostActive) effectiveSpeed *= BOOST_SPEED_MULT;
  if (speedPenalty) effectiveSpeed *= CED.HIT_SPEED_PENALTY;
  speed = effectiveSpeed;

  position = Util.increase(position, dt * speed, trackLength);

  // --- Steering ---
  dx = dt * 2 * (speed/maxSpeed);
  if (keyLeft)  playerX = playerX - dx;
  if (keyRight) playerX = playerX + dx;

  playerX = playerX - (dx * speedPercent * playerSegment.curve * centrifugal);

  // --- Off-road handling ---
  if ((playerX < -1) || (playerX > 1)) {
    // Vibe drain for off-road
    vibe -= CED.VIBE_OFFROAD_DRAIN * dt;

    // Sprite collision (trees, billboards)
    for (var n = 0; n < playerSegment.sprites.length; n++) {
      var sprite = playerSegment.sprites[n];
      var spriteW = sprite.source.w * SPRITES.SCALE;
      if (Util.overlap(playerX, playerW, sprite.offset + spriteW/2 * (sprite.offset > 0 ? 1 : -1), spriteW)) {
        onHazardHit();
        position = Util.increase(playerSegment.p1.world.z, -playerZ, trackLength);
        break;
      }
    }
  }

  // --- Car/hazard collision ---
  if (!invulnerable) {
    for (var n = 0; n < playerSegment.cars.length; n++) {
      var car = playerSegment.cars[n];
      var carW = car.sprite.w * SPRITES.SCALE;
      if (speed > car.speed) {
        if (Util.overlap(playerX, playerW, car.offset, carW, 0.8)) {
          onHazardHit();
          speed = car.speed * (car.speed/speed);
          position = Util.increase(car.z, -playerZ, trackLength);
          break;
        }
      }
    }
  }

  // --- Collectible checking ---
  for (var i = 0; i < collectibles.length; i++) {
    var c = collectibles[i];
    if (c.collected) continue;
    var cSeg = findSegment(c.segmentZ);
    if (cSeg === playerSegment || cSeg.index === playerSegment.index + 1 || cSeg.index === playerSegment.index - 1) {
      var cW = 0.15;  // collectible width in road units
      if (Util.overlap(playerX, playerW, c.offset, cW)) {
        onPickupCollect(c);
      }
    }
  }

  playerX = Util.limit(playerX, -3, 3);
  speed   = Util.limit(speed, 0, maxSpeed);

  // --- Boost update ---
  if (boostActive) {
    boostTimer -= dt;
    if (boostTimer <= 0) { boostActive = false; boostCooldown = BOOST_COOLDOWN; }
  } else if (boostCooldown > 0) {
    boostCooldown -= dt;
  }

  // Boost activation
  if (keyFaster && !boostActive && boostCooldown <= 0) {
    boostActive = true;
    boostTimer = BOOST_DURATION;
    boostUsed = true;
    SFX.boost();
  }

  // --- Hit timers ---
  if (invulnerable) {
    invulnTimer -= dt;
    if (invulnTimer <= 0) invulnerable = false;
  }
  if (speedPenalty) {
    speedPenaltyTimer -= dt;
    if (speedPenaltyTimer <= 0) speedPenalty = false;
  }

  // --- Clean driving streak ---
  if (!invulnerable && playerX >= -1 && playerX <= 1) {
    cleanStreak += dt;
    vibe += CED.VIBE_CLEAN_GAIN * dt;

    if (cleanStreak >= 20 && cleanStreak - dt < 20) addScore(CED.CLEAN_20S, 'Zen Mode!');
    else if (cleanStreak >= 10 && cleanStreak - dt < 10) addScore(CED.CLEAN_10S, 'Smooth!');
    else if (cleanStreak >= 5 && cleanStreak - dt < 5) addScore(CED.CLEAN_5S, 'Clean!');
  }
  if (cleanStreak > bestCleanStreak) bestCleanStreak = cleanStreak;

  // --- Vibe clamp and check ---
  vibe = Util.limit(vibe, 0, vibeMax);

  if (vibe <= CED.VIBE_WARNING && vibe > 0) {
    vibeWarningTimer -= dt;
    if (vibeWarningTimer <= 0) { SFX.vibeWarning(); vibeWarningTimer = 2.0; }
  }

  if (vibe <= 0) { endRun(false); return; }

  // --- Zone tracking ---
  var segIdx = findSegment(position).index;
  var totalSegs = segments.length;
  if (segIdx > totalSegs * 0.67) currentZone = 3;
  else if (segIdx > totalSegs * 0.33) currentZone = 2;
  else currentZone = 1;

  // --- Distance score ---
  score = Math.floor(position / segmentLength / CED.DISTANCE_DIVISOR) * 10;

  // --- Check finish ---
  if (position >= trackLength - segmentLength * 5) {
    endRun(true);
    return;
  }

  // --- Background parallax ---
  skyOffset  = Util.increase(skyOffset,  skySpeed  * playerSegment.curve * (position-startPosition)/segmentLength, 1);
  hillOffset = Util.increase(hillOffset, hillSpeed * playerSegment.curve * (position-startPosition)/segmentLength, 1);
  treeOffset = Util.increase(treeOffset, treeSpeed * playerSegment.curve * (position-startPosition)/segmentLength, 1);

  // --- Floating text decay ---
  for (var i = floatingTexts.length - 1; i >= 0; i--) {
    floatingTexts[i].timer -= dt;
    floatingTexts[i].y -= 30 * dt;
    if (floatingTexts[i].timer <= 0) floatingTexts.splice(i, 1);
  }
}

//=============================================================================
// CED-SPECIFIC EVENT HANDLERS
//=============================================================================

function onHazardHit() {
  if (invulnerable) return;
  SFX.collision();
  vibe -= CED.VIBE_HAZARD_COST;
  cleanStreak = 0;
  speedPenalty = true;
  speedPenaltyTimer = CED.HIT_PENALTY_DUR;
  invulnerable = true;
  invulnTimer = CED.HIT_INVULN_DUR;
}

function onPickupCollect(c) {
  c.collected = true;
  if (c.isStamp) {
    stampsCollected++;
    addScore(CED.STAMP_POINTS, '+' + CED.STAMP_POINTS);
    SFX.stamp();
  } else {
    memoriesCollected++;
    var caption = CED.CAPTIONS[Math.floor(Math.random() * CED.CAPTIONS.length)];
    addScore(CED.MEMORY_POINTS, caption);
    SFX.pickup();
  }
  vibe = Util.limit(vibe + CED.VIBE_PICKUP_GAIN, 0, vibeMax);
}

function addScore(points, text) {
  score += points;
  if (text) {
    floatingTexts.push({
      x: width/2,
      y: height * 0.6,
      text: text,
      color: points >= CED.STAMP_POINTS ? '#FFD700' : '#FFFFFF',
      timer: 0.8,
    });
  }
}

function endRun(won) {
  GAME_STATE = 'gameover';
  var rawScore = score;
  var vibeMultiplier = won ? Math.max(vibe / 100, 0.1) : 0.1;
  var finalScore = Math.round(rawScore * vibeMultiplier);

  var rank = CED.RANKS[CED.RANKS.length - 1];
  for (var i = 0; i < CED.RANKS.length; i++) {
    if (finalScore >= CED.RANKS[i].min) { rank = CED.RANKS[i]; break; }
  }

  gameOverData = {
    won: won,
    rawScore: rawScore,
    finalScore: finalScore,
    stampsCollected: stampsCollected,
    memoriesCollected: memoriesCollected,
    bestCleanStreak: Math.floor(bestCleanStreak),
    finalVibe: Math.floor(vibe),
    vibeMultiplier: Math.round(vibeMultiplier * 100) / 100,
    rank: rank.name,
    rankTagline: rank.tagline,
    distance: Math.floor(position / segmentLength),
  };
}

//=============================================================================
// CAR AI (from Jake Gordon — other vehicles on road)
//=============================================================================

function updateCars(dt, playerSegment, playerW) {
  for (var n = 0; n < cars.length; n++) {
    var car = cars[n];
    var oldSegment = findSegment(car.z);
    car.offset = car.offset + updateCarOffset(car, oldSegment, playerSegment, playerW);
    car.z = Util.increase(car.z, dt * car.speed, trackLength);
    car.percent = Util.percentRemaining(car.z, segmentLength);
    var newSegment = findSegment(car.z);
    if (oldSegment != newSegment) {
      var index = oldSegment.cars.indexOf(car);
      oldSegment.cars.splice(index, 1);
      newSegment.cars.push(car);
    }
  }
}

function updateCarOffset(car, carSegment, playerSegment, playerW) {
  var i, j, dir, segment, otherCar, otherCarW, lookahead = 20, carW = car.sprite.w * SPRITES.SCALE;
  if ((carSegment.index - playerSegment.index) > drawDistance) return 0;
  for (i = 1; i < lookahead; i++) {
    segment = segments[(carSegment.index+i) % segments.length];
    if ((segment === playerSegment) && (car.speed > speed) && (Util.overlap(playerX, playerW, car.offset, carW, 1.2))) {
      if (playerX > 0.5) dir = -1;
      else if (playerX < -0.5) dir = 1;
      else dir = (car.offset > playerX) ? 1 : -1;
      return dir * 1/i * (car.speed-speed)/maxSpeed;
    }
    for (j = 0; j < segment.cars.length; j++) {
      otherCar = segment.cars[j];
      otherCarW = otherCar.sprite.w * SPRITES.SCALE;
      if ((car.speed > otherCar.speed) && Util.overlap(car.offset, carW, otherCar.offset, otherCarW, 1.2)) {
        if (otherCar.offset > 0.5) dir = -1;
        else if (otherCar.offset < -0.5) dir = 1;
        else dir = (car.offset > otherCar.offset) ? 1 : -1;
        return dir * 1/i * (car.speed-otherCar.speed)/maxSpeed;
      }
    }
  }
  if (car.offset < -0.9) return 0.1;
  else if (car.offset > 0.9) return -0.1;
  return 0;
}

//=============================================================================
// RENDER
//=============================================================================

function render() {
  if (GAME_STATE === 'menu') { renderMenu(); return; }

  var baseSegment   = findSegment(position);
  var basePercent   = Util.percentRemaining(position, segmentLength);
  var playerSegment = findSegment(position+playerZ);
  var playerPercent = Util.percentRemaining(position+playerZ, segmentLength);
  var playerY       = Util.interpolate(playerSegment.p1.world.y, playerSegment.p2.world.y, playerPercent);
  var maxy          = height;
  var x  = 0;
  var dx = -(baseSegment.curve * basePercent);

  ctx.clearRect(0, 0, width, height);

  // Background
  Render.background(ctx, background, width, height, BACKGROUND.SKY,   skyOffset,  resolution * skySpeed  * playerY);
  Render.background(ctx, background, width, height, BACKGROUND.HILLS, hillOffset, resolution * hillSpeed * playerY);
  Render.background(ctx, background, width, height, BACKGROUND.TREES, treeOffset, resolution * treeSpeed * playerY);

  // Road segments — front to back
  var n, i, segment, car, sprite, spriteScale, spriteX, spriteY;
  for (n = 0; n < drawDistance; n++) {
    segment = segments[(baseSegment.index + n) % segments.length];
    segment.looped = segment.index < baseSegment.index;
    segment.fog    = Util.exponentialFog(n/drawDistance, fogDensity);
    segment.clip   = maxy;

    Util.project(segment.p1, (playerX * roadWidth) - x,      playerY + cameraHeight, position - (segment.looped ? trackLength : 0), cameraDepth, width, height, roadWidth);
    Util.project(segment.p2, (playerX * roadWidth) - x - dx, playerY + cameraHeight, position - (segment.looped ? trackLength : 0), cameraDepth, width, height, roadWidth);

    x  = x + dx;
    dx = dx + segment.curve;

    if ((segment.p1.camera.z <= cameraDepth) ||
        (segment.p2.screen.y >= segment.p1.screen.y) ||
        (segment.p2.screen.y >= maxy))
      continue;

    Render.segment(ctx, width, lanes,
      segment.p1.screen.x, segment.p1.screen.y, segment.p1.screen.w,
      segment.p2.screen.x, segment.p2.screen.y, segment.p2.screen.w,
      segment.fog, segment.color);

    maxy = segment.p1.screen.y;
  }

  // Sprites — back to front
  for (n = (drawDistance-1); n > 0; n--) {
    segment = segments[(baseSegment.index + n) % segments.length];

    for (i = 0; i < segment.cars.length; i++) {
      car = segment.cars[i];
      spriteScale = Util.interpolate(segment.p1.screen.scale, segment.p2.screen.scale, car.percent);
      spriteX = Util.interpolate(segment.p1.screen.x, segment.p2.screen.x, car.percent) + (spriteScale * car.offset * roadWidth * width/2);
      spriteY = Util.interpolate(segment.p1.screen.y, segment.p2.screen.y, car.percent);
      Render.sprite(ctx, width, height, resolution, roadWidth, sprites, car.sprite, spriteScale, spriteX, spriteY, -0.5, -1, segment.clip);
    }

    for (i = 0; i < segment.sprites.length; i++) {
      sprite = segment.sprites[i];
      spriteScale = segment.p1.screen.scale;
      spriteX = segment.p1.screen.x + (spriteScale * sprite.offset * roadWidth * width/2);
      spriteY = segment.p1.screen.y;
      Render.sprite(ctx, width, height, resolution, roadWidth, sprites, sprite.source, spriteScale, spriteX, spriteY, (sprite.offset < 0 ? -1 : 0), -1, segment.clip);
    }

    // Render collectibles on this segment as glowing markers
    for (i = 0; i < collectibles.length; i++) {
      var c = collectibles[i];
      if (c.collected) continue;
      var cSegIdx = Math.floor(c.segmentZ / segmentLength) % segments.length;
      if (cSegIdx === segment.index) {
        spriteScale = segment.p1.screen.scale;
        spriteX = segment.p1.screen.x + (spriteScale * c.offset * roadWidth * width/2);
        spriteY = segment.p1.screen.y;
        if (spriteY < segment.clip) {
          var size = Math.max(4, Math.round(spriteScale * roadWidth * 40));
          var pulse = 1 + 0.15 * Math.sin(Date.now() * 0.006);
          var r = size * pulse;
          // Glow
          ctx.globalAlpha = 0.3;
          ctx.fillStyle = c.isStamp ? '#FFD700' : '#44DDFF';
          ctx.beginPath(); ctx.arc(spriteX, spriteY - r, r * 1.6, 0, Math.PI*2); ctx.fill();
          // Solid marker
          ctx.globalAlpha = 0.9;
          ctx.fillStyle = c.isStamp ? '#FFD700' : '#44DDFF';
          ctx.beginPath(); ctx.arc(spriteX, spriteY - r, r, 0, Math.PI*2); ctx.fill();
          // Inner highlight
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath(); ctx.arc(spriteX, spriteY - r, r * 0.4, 0, Math.PI*2); ctx.fill();
          // Label for stamps
          if (c.isStamp && r > 8) {
            ctx.fillStyle = '#8B4513';
            ctx.font = 'bold ' + Math.max(8, Math.round(r*0.7)) + 'px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('★', spriteX, spriteY - r + r*0.25);
          }
          ctx.globalAlpha = 1;
        }
      }
    }

    if (segment == playerSegment) {
      // Player car with invuln flash
      var alpha = 1;
      if (invulnerable) alpha = Math.sin(Date.now() * 0.02) > 0 ? 1 : 0.4;
      ctx.globalAlpha = alpha;
      Render.player(ctx, width, height, resolution, roadWidth, sprites, speed/maxSpeed,
        cameraDepth/playerZ, width/2,
        (height/2) - (cameraDepth/playerZ * Util.interpolate(playerSegment.p1.camera.y, playerSegment.p2.camera.y, playerPercent) * height/2),
        speed * (keyLeft ? -1 : keyRight ? 1 : 0),
        playerSegment.p2.world.y - playerSegment.p1.world.y);
      ctx.globalAlpha = 1;
    }
  }

  // --- HUD ---
  renderHUD();

  // --- Floating text ---
  for (i = 0; i < floatingTexts.length; i++) {
    var ft = floatingTexts[i];
    ctx.globalAlpha = Math.max(0, ft.timer / 0.8);
    ctx.fillStyle = ft.color;
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.globalAlpha = 1;
  }

  // --- Game over overlay ---
  if (GAME_STATE === 'gameover') renderGameOver();
}

//=============================================================================
// HUD RENDERING
//=============================================================================

function renderHUD() {
  // Top bar background
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, width, 40);

  // Score
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('Score: ' + score, 20, 27);

  // Stamp counter
  ctx.textAlign = 'right';
  ctx.fillText(stampsCollected + '/' + totalStamps + ' Stamps', width - 20, 27);

  // Trip Vibe bar
  var vibeW = 220, vibeH = 16;
  var vibeX = (width - vibeW) / 2, vibeY = 12;

  ctx.fillStyle = '#333';
  ctx.fillRect(vibeX, vibeY, vibeW, vibeH);

  var vibeRatio = Util.limit(vibe / vibeMax, 0, 1);
  var vibeColor = vibe >= 75 ? '#4CAF50' : vibe >= 50 ? '#FFC107' : vibe >= 25 ? '#FF9800' : '#F44336';
  ctx.fillStyle = vibeColor;
  ctx.fillRect(vibeX + 1, vibeY + 1, (vibeW - 2) * vibeRatio, vibeH - 2);

  ctx.fillStyle = '#AAA';
  ctx.font = '9px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('TRIP VIBE', width/2, vibeY - 1);

  // Boost meter (bottom right, only after first use)
  if (boostUsed) {
    var bx = width - 100, by = height - 20, bw = 80, bh = 8;
    ctx.fillStyle = '#333';
    ctx.fillRect(bx, by, bw, bh);

    var boostRatio;
    if (boostActive) {
      boostRatio = boostTimer / BOOST_DURATION;
      ctx.fillStyle = '#00BCD4';
    } else if (boostCooldown > 0) {
      boostRatio = 1 - (boostCooldown / BOOST_COOLDOWN);
      ctx.fillStyle = '#FF5722';
    } else {
      boostRatio = 1;
      ctx.fillStyle = '#00BCD4';
    }
    ctx.fillRect(bx + 1, by + 1, (bw - 2) * Util.limit(boostRatio, 0, 1), bh - 2);

    ctx.fillStyle = '#AAA';
    ctx.font = '9px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('BOOST', bx - 4, by + 8);
  }

  // Zone indicator
  var zoneNames = { 1: 'THE HIGHWAY', 2: 'NATIONAL PARKS', 3: 'SCENIC ROUTE' };
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = '10px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(zoneNames[currentZone] || '', 20, height - 10);
}

//=============================================================================
// MENU SCREEN
//=============================================================================

function renderMenu() {
  ctx.clearRect(0, 0, width, height);

  // Dark gradient background
  var grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, '#1a1a2e');
  grad.addColorStop(1, '#16213e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Title
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 52px Arial Black, Impact, sans-serif';
  ctx.textAlign = 'center';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 4;
  ctx.strokeText('CED CRUISIN\' USA', width/2, 200);
  ctx.fillText('CED CRUISIN\' USA', width/2, 200);

  // Subtitle
  ctx.fillStyle = '#FFE4B5';
  ctx.font = '20px Georgia, serif';
  ctx.fillText('Ced hits the open road', width/2, 250);

  // Controls
  ctx.fillStyle = '#AAA';
  ctx.font = '14px monospace';
  ctx.fillText('LEFT / RIGHT  or  A / D  —  Steer', width/2, 400);
  ctx.fillText('UP  or  W  —  Boost', width/2, 425);

  // Start prompt (pulsing)
  var alpha = 0.5 + 0.5 * Math.sin(Date.now() * 0.004);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 24px Arial';
  ctx.fillText('Press SPACE to Start', width/2, 520);
  ctx.globalAlpha = 1;

  // Credit
  ctx.fillStyle = '#555';
  ctx.font = '11px Arial';
  ctx.fillText('Road engine by Jake Gordon | Made for Ced\'s retirement', width/2, height - 20);
}

//=============================================================================
// GAME OVER SCREEN
//=============================================================================

function renderGameOver() {
  if (!gameOverData) return;
  var d = gameOverData;

  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(0, 0, width, height);

  var cx = width/2;
  var y = 120;

  // Header
  ctx.textAlign = 'center';
  if (d.won) {
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 40px Arial Black, Impact';
    ctx.fillText('TRIP COMPLETE', cx, y);
  } else {
    ctx.fillStyle = '#FF8888';
    ctx.font = '32px Georgia, serif';
    ctx.fillText('The vibe faded...', cx, y);
  }

  // Stats
  y += 70;
  ctx.fillStyle = '#CCC';
  ctx.font = '16px monospace';
  var lines = [
    'Distance: ' + d.distance + ' segments',
    'Stamps: ' + d.stampsCollected + '/' + totalStamps,
    'Memories: ' + d.memoriesCollected,
    'Best Clean Streak: ' + d.bestCleanStreak + 's',
    'Trip Vibe: ' + d.finalVibe + '%  (x' + d.vibeMultiplier + ')',
    '',
    'Score: ' + d.rawScore + '  →  Final: ' + d.finalScore,
  ];
  for (var i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], cx, y);
    y += 26;
  }

  // Rank
  y += 20;
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 36px Arial Black, Impact';
  ctx.fillText(d.rank, cx, y);

  y += 40;
  ctx.fillStyle = '#AAA';
  ctx.font = 'italic 16px Georgia';
  ctx.fillText(d.rankTagline, cx, y);

  // Retirement message
  y += 50;
  ctx.fillStyle = '#FFF8E7';
  ctx.font = '20px Georgia';
  ctx.fillText('Enjoy the road ahead, Ced.', cx, y);

  // Controls
  y += 45;
  ctx.fillStyle = '#666';
  ctx.font = '14px monospace';
  ctx.fillText('R — Play Again    ESC — Menu', cx, y);
}

//=============================================================================
// ROAD BUILDING — CED'S 3-ACT JOURNEY
//=============================================================================

// Extra key codes not in Jake Gordon's original
KEY.SPACE = 32;
KEY.R     = 82;
KEY.ESC   = 27;

var ROAD = {
  LENGTH: { NONE: 0, SHORT: 25, MEDIUM: 50, LONG: 100 },
  HILL:   { NONE: 0, LOW: 20, MEDIUM: 40, HIGH: 60 },
  CURVE:  { NONE: 0, EASY: 2, MEDIUM: 4, HARD: 6 }
};

function lastY() { return (segments.length == 0) ? 0 : segments[segments.length-1].p2.world.y; }

function addSegment(curve, y) {
  var n = segments.length;
  segments.push({
    index: n,
    p1: { world: { y: lastY(), z:  n   *segmentLength }, camera: {}, screen: {} },
    p2: { world: { y: y,       z: (n+1)*segmentLength }, camera: {}, screen: {} },
    curve: curve,
    sprites: [],
    cars: [],
    color: Math.floor(n/rumbleLength)%2 ? COLORS.DARK : COLORS.LIGHT
  });
}

function addSprite(n, sprite, offset) {
  if (n >= 0 && n < segments.length) segments[n].sprites.push({ source: sprite, offset: offset });
}

function addRoad(enter, hold, leave, curve, y) {
  var startY = lastY();
  var endY   = startY + (Util.toInt(y, 0) * segmentLength);
  var n, total = enter + hold + leave;
  for (n = 0; n < enter; n++)
    addSegment(Util.easeIn(0, curve, n/enter), Util.easeInOut(startY, endY, n/total));
  for (n = 0; n < hold; n++)
    addSegment(curve, Util.easeInOut(startY, endY, (enter+n)/total));
  for (n = 0; n < leave; n++)
    addSegment(Util.easeInOut(curve, 0, n/leave), Util.easeInOut(startY, endY, (enter+hold+n)/total));
}

function addStraight(num)          { addRoad(num || ROAD.LENGTH.MEDIUM, num || ROAD.LENGTH.MEDIUM, num || ROAD.LENGTH.MEDIUM, 0, 0); }
function addHill(num, height)      { addRoad(num || ROAD.LENGTH.MEDIUM, num || ROAD.LENGTH.MEDIUM, num || ROAD.LENGTH.MEDIUM, 0, height || ROAD.HILL.MEDIUM); }
function addCurve(num, curve, h)   { addRoad(num || ROAD.LENGTH.MEDIUM, num || ROAD.LENGTH.MEDIUM, num || ROAD.LENGTH.MEDIUM, curve || ROAD.CURVE.MEDIUM, h || ROAD.HILL.NONE); }
function addDownhillToEnd(num)     { num = num || 200; addRoad(num, num, num, -ROAD.CURVE.EASY, -lastY()/segmentLength); }

function addLowRollingHills(num, height) {
  num = num || ROAD.LENGTH.SHORT; height = height || ROAD.HILL.LOW;
  addRoad(num, num, num, 0, height/2);
  addRoad(num, num, num, 0, -height);
  addRoad(num, num, num, ROAD.CURVE.EASY, height);
  addRoad(num, num, num, 0, 0);
  addRoad(num, num, num, -ROAD.CURVE.EASY, height/2);
  addRoad(num, num, num, 0, 0);
}

function addSCurves() {
  addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, -ROAD.CURVE.EASY,   ROAD.HILL.NONE);
  addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,  ROAD.CURVE.MEDIUM, ROAD.HILL.MEDIUM);
  addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,  ROAD.CURVE.EASY,  -ROAD.HILL.LOW);
  addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, -ROAD.CURVE.EASY,   ROAD.HILL.MEDIUM);
  addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, -ROAD.CURVE.MEDIUM,-ROAD.HILL.MEDIUM);
}

function addBumps() {
  addRoad(10,10,10,0, 5); addRoad(10,10,10,0,-2); addRoad(10,10,10,0,-5);
  addRoad(10,10,10,0, 8); addRoad(10,10,10,0, 5); addRoad(10,10,10,0,-7);
  addRoad(10,10,10,0, 5); addRoad(10,10,10,0,-2);
}

function resetRoad() {
  segments = [];

  // === ZONE 1: HIGHWAY — Leaving work ===
  addStraight(ROAD.LENGTH.SHORT);
  addLowRollingHills();
  addCurve(ROAD.LENGTH.MEDIUM, ROAD.CURVE.EASY);
  addStraight(ROAD.LENGTH.SHORT);
  addHill(ROAD.LENGTH.MEDIUM, ROAD.HILL.LOW);
  addCurve(ROAD.LENGTH.MEDIUM, -ROAD.CURVE.EASY, ROAD.HILL.LOW);
  addStraight(ROAD.LENGTH.SHORT);

  // === ZONE 2: NATIONAL PARKS — Retirement life ===
  addSCurves();
  addHill(ROAD.LENGTH.MEDIUM, ROAD.HILL.MEDIUM);
  addCurve(ROAD.LENGTH.LONG, ROAD.CURVE.MEDIUM, ROAD.HILL.LOW);
  addLowRollingHills(ROAD.LENGTH.MEDIUM, ROAD.HILL.MEDIUM);
  addCurve(ROAD.LENGTH.LONG, -ROAD.CURVE.MEDIUM, ROAD.HILL.MEDIUM);
  addBumps();
  addStraight(ROAD.LENGTH.SHORT);
  addHill(ROAD.LENGTH.LONG, ROAD.HILL.HIGH);
  addCurve(ROAD.LENGTH.MEDIUM, ROAD.CURVE.HARD, -ROAD.HILL.LOW);

  // === ZONE 3: SCENIC FINISH — Sunset payoff ===
  addCurve(ROAD.LENGTH.LONG*2, ROAD.CURVE.MEDIUM, ROAD.HILL.HIGH);
  addStraight(ROAD.LENGTH.SHORT);
  addHill(ROAD.LENGTH.MEDIUM, -ROAD.HILL.HIGH);
  addSCurves();
  addHill(ROAD.LENGTH.LONG, ROAD.HILL.HIGH);
  addCurve(ROAD.LENGTH.LONG, -ROAD.CURVE.MEDIUM);
  addDownhillToEnd();

  // Finish line colors
  for (var n = 0; n < rumbleLength; n++)
    segments[segments.length-1-n].color = COLORS.FINISH;

  trackLength = segments.length * segmentLength;

  // Zone-based colors
  var zone1End = Math.floor(segments.length * 0.33);
  var zone2End = Math.floor(segments.length * 0.67);
  for (var i = 0; i < segments.length; i++) {
    var zone;
    if (i < zone1End) zone = ZONE_COLORS[1];
    else if (i < zone2End) zone = ZONE_COLORS[2];
    else zone = ZONE_COLORS[3];

    segments[i].color = (Math.floor(i/rumbleLength) % 2) ? zone.DARK : zone.LIGHT;
  }
  // Re-apply finish colors
  for (var n = 0; n < rumbleLength * 3; n++)
    segments[segments.length-1-n].color = COLORS.FINISH;

  resetSprites();
  resetCollectibles();
  resetCars();
}

function resetSprites() {
  var n, i, side, offset, zone1End = Math.floor(segments.length * 0.33), zone2End = Math.floor(segments.length * 0.67);

  // Zone 1: Highway — palm trees, billboards, bushes (California start)
  for (n = 10; n < zone1End; n += 3 + Math.floor(n/100)) {
    addSprite(n, SPRITES.PALM_TREE, Util.randomChoice([1,-1]) * (1.8 + Math.random()*2));
  }
  for (n = 20; n < zone1End; n += 50) {
    addSprite(n, Util.randomChoice(SPRITES.BILLBOARDS), Util.randomChoice([-1.5, 1.5]));
  }
  for (n = 5; n < zone1End; n += 10) {
    addSprite(n, Util.randomChoice([SPRITES.BUSH1, SPRITES.BUSH2]), Util.randomChoice([1,-1]) * (2.5 + Math.random()*3));
  }

  // Zone 2: National Parks — dense pines, rocks, fences, billboards
  for (n = zone1End; n < zone2End; n += 3) {
    side = Util.randomChoice([1, -1]);
    addSprite(n, Util.randomChoice([SPRITES.TREE1, SPRITES.TREE2]), side * (2 + Math.random()*4));
  }
  for (n = zone1End; n < zone2End; n += 15) {
    addSprite(n, Util.randomChoice([SPRITES.BOULDER1, SPRITES.BOULDER2, SPRITES.BOULDER3]), Util.randomChoice([1,-1]) * (2 + Math.random()*3));
  }
  for (n = zone1End; n < zone2End; n += 60) {
    addSprite(n, Util.randomChoice(SPRITES.BILLBOARDS), Util.randomChoice([-1.5, 1.5]));
  }
  for (n = zone1End; n < zone2End; n += 8) {
    addSprite(n, Util.randomChoice([SPRITES.BUSH1, SPRITES.BUSH2]), Util.randomChoice([1,-1]) * (2 + Math.random()*4));
  }

  // Zone 3: Scenic — sparser, dramatic, dead trees and stumps for character
  for (n = zone2End; n < segments.length - 50; n += 5) {
    side = Util.randomChoice([1, -1]);
    addSprite(n, Util.randomChoice([SPRITES.TREE1, SPRITES.TREE2, SPRITES.DEAD_TREE1, SPRITES.DEAD_TREE2]), side * (2.5 + Math.random()*5));
  }
  for (n = zone2End; n < segments.length - 50; n += 30) {
    addSprite(n, Util.randomChoice([SPRITES.STUMP, SPRITES.BOULDER1]), Util.randomChoice([1,-1]) * (2 + Math.random()*3));
  }
}

function resetCollectibles() {
  collectibles = [];

  var zone1End = Math.floor(segments.length * 0.33);
  var zone2End = Math.floor(segments.length * 0.67);

  // 5 Park stamps — distributed across the journey
  var stampSegments = [
    Math.floor(segments.length * 0.15),
    Math.floor(segments.length * 0.35),
    Math.floor(segments.length * 0.50),
    Math.floor(segments.length * 0.65),
    Math.floor(segments.length * 0.85),
  ];
  for (var i = 0; i < stampSegments.length; i++) {
    var seg = stampSegments[i];
    collectibles.push({
      segmentZ: seg * segmentLength,
      offset: Util.randomChoice([-0.4, 0, 0.4]),
      isStamp: true,
      collected: false,
      source: null,  // rendered as glowing marker, not sprite
    });
  }

  // Memory pickups — scattered throughout
  for (var n = 30; n < segments.length - 30; n += 25 + Math.floor(Math.random()*20)) {
    collectibles.push({
      segmentZ: n * segmentLength,
      offset: Util.randomChoice([-0.5, -0.2, 0, 0.2, 0.5]),
      isStamp: false,
      collected: false,
      source: null,  // rendered as glowing marker, not sprite
    });
  }
}

function resetCars() {
  cars = [];
  for (var n = 0; n < totalCars; n++) {
    var offset = Math.random() * Util.randomChoice([-0.8, 0.8]);
    var z = Math.floor(Math.random() * segments.length) * segmentLength;
    var sprite = Util.randomChoice([SPRITES.SEMI, SPRITES.TRUCK]);  // RVs and trucks as "hazards"
    var carSpeed = maxSpeed/8 + Math.random() * maxSpeed/6;  // slow traffic
    var car = { offset: offset, z: z, sprite: sprite, speed: carSpeed };
    var segment = findSegment(car.z);
    segment.cars.push(car);
    cars.push(car);
  }
}

function findSegment(z) {
  return segments[Math.floor(z/segmentLength) % segments.length];
}

//=============================================================================
// GAME LOOP
//=============================================================================

Game.run({
  canvas: canvas, render: render, update: update, step: step,
  stats: { update: function(){}, domElement: document.createElement('div') },  // no stats
  images: ["background", "sprites"],
  keys: [
    { keys: [KEY.LEFT,  KEY.A], mode: 'down', action: function() { keyLeft   = true;  } },
    { keys: [KEY.RIGHT, KEY.D], mode: 'down', action: function() { keyRight  = true;  } },
    { keys: [KEY.UP,    KEY.W], mode: 'down', action: function() { keyFaster = true;  } },
    { keys: [KEY.DOWN,  KEY.S], mode: 'down', action: function() { keySlower = true;  } },
    { keys: [KEY.LEFT,  KEY.A], mode: 'up',   action: function() { keyLeft   = false; } },
    { keys: [KEY.RIGHT, KEY.D], mode: 'up',   action: function() { keyRight  = false; } },
    { keys: [KEY.UP,    KEY.W], mode: 'up',   action: function() { keyFaster = false; } },
    { keys: [KEY.DOWN,  KEY.S], mode: 'up',   action: function() { keySlower = false; } },
    { keys: [KEY.SPACE],        mode: 'down', action: function() {
      if (GAME_STATE === 'menu') { startGame(); }
    }},
    { keys: [KEY.R],            mode: 'down', action: function() {
      if (GAME_STATE === 'gameover') { startGame(); }
    }},
    { keys: [KEY.ESC],          mode: 'down', action: function() {
      if (GAME_STATE === 'gameover') { GAME_STATE = 'menu'; }
    }},
  ],
  ready: function(images) {
    background = images[0];
    sprites    = images[1];
    reset();
    SFX.init();
    canvas.focus();
    // Click to start from menu or game over
    canvas.addEventListener('click', function() {
      if (GAME_STATE === 'menu') startGame();
      else if (GAME_STATE === 'gameover') startGame();
    });
  }
});

function reset(options) {
  options       = options || {};
  canvas.width  = width  = Util.toInt(options.width,  width);
  canvas.height = height = Util.toInt(options.height, height);
  cameraDepth   = 1 / Math.tan((fieldOfView/2) * Math.PI/180);
  playerZ       = (cameraHeight * cameraDepth);
  resolution    = height/480;

  if (segments.length === 0)
    resetRoad();
}

function startGame() {
  SFX.resume();
  GAME_STATE = 'playing';
  position = 0;
  speed = cedBaseSpeed;
  playerX = 0;
  vibe = 100;
  score = 0;
  stampsCollected = 0;
  memoriesCollected = 0;
  cleanStreak = 0;
  bestCleanStreak = 0;
  boostActive = false;
  boostTimer = 0;
  boostCooldown = 0;
  boostUsed = false;
  invulnerable = false;
  speedPenalty = false;
  floatingTexts = [];
  gameOverData = null;
  currentZone = 1;
  skyOffset = 0;
  hillOffset = 0;
  treeOffset = 0;

  resetRoad();

  // Start music
  var music = Dom.get('music');
  if (music) { music.currentTime = 0; music.volume = 0.15; music.play().catch(function(){}); }
}
