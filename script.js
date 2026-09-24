const backgroundMusic = document.getElementById('backgroundMusic');
const closingTapeAudio = document.getElementById('closingTapeAudio');
const trainArrive = document.getElementById('trainArrive');
const trainAudio = document.getElementById('trainAudio');
const trainLobbyMusic = document.getElementById('trainLobbyMusic');
const mainMusic = document.getElementById('MainMusic');
const endingMusic = document.getElementById('endingMusic');
let staticRadioStopped = false;
let roseClickCount = 0;
const ROSE_CLICK_TARGET = 15;
let trainDialogueTimer = null;
let pausedDialogueMusic = [];
let trainDialogueOpen = false;
const TRAIN_DIALOGUE_MIN_DELAY = 45000;
const TRAIN_DIALOGUE_MAX_DELAY = 90000;
const trainDialogues = [
  '1B + 3D + 4D + 7A + 6B + 2D + 2C * 3B + 6A + 3A + 7A + 6A + 5A * 4D + 4A * 7A + 6B + 2D * 5C + 2B + 2D * 6B + 4D + 3C * 4B + 3D + 4A + 4D + 2C + 7A + 4B + 3D + 1B + 7A + 2D',
  '3D + 2D + 4C + 7A * 1C + 4D + 3A + 1B + 7A + 6A + 4D + 3D * 3C + 4D + 3D + 7A * 1A + 2D * 2B + 4D * 4A + 2C + 6A + 2D + 3D + 5C + 1C + 2A',
  '5D + 2D + 2C + 6B + 1B + 5D + 2B * 2A + 4D + 4B * 2B + 6B + 4D + 4B + 1C + 5C * 1C + 2D + 1B + 3B + 2D',
  '5D + 1C + 2D + 1B + 2B + 2D * 2C + 2D + 7A + 6B + 6A + 3D + 6D * 2A + 4D + 4B + 2C * 5C + 2D + 3A + 6A + 2B + 6A + 4D + 3D + 2B',
  '5C + 4D * 2A + 4D + 4B * 1C + 6A + 6D + 2D * 7A + 2C + 1B + 6A + 3D * 2B + 2D + 1B + 7A + 2B * 1B + 2B * 5A + 4B + 3A + 6B * 1B + 2B * 6A * 5C + 4D'
];

function clearTrainDialogueTimer() {
  if (!trainDialogueTimer) return;
  clearTimeout(trainDialogueTimer);
  trainDialogueTimer = null;
}

function scheduleTrainDialogue() {
  clearTrainDialogueTimer();
  const activeScreen = document.querySelector('.screen.active')?.id;
  if (activeScreen !== 'mainMenu' && activeScreen !== 'trainArea') return;

  const delay = TRAIN_DIALOGUE_MIN_DELAY + Math.random() *
    (TRAIN_DIALOGUE_MAX_DELAY - TRAIN_DIALOGUE_MIN_DELAY);
  trainDialogueTimer = setTimeout(showTrainDialogue, delay);
}

function pauseMusicForTrainDialogue() {
  pausedDialogueMusic = [backgroundMusic, trainAudio, trainLobbyMusic, mainMusic]
    .filter(audio => audio && !audio.paused)
    .map(audio => ({ audio, volume: audio.volume }));

  pausedDialogueMusic.forEach(({ audio }) => audio.pause());
}

function resumeMusicAfterTrainDialogue() {
  const musicToResume = pausedDialogueMusic;
  pausedDialogueMusic = [];
  musicToResume.forEach(({ audio, volume }) => {
    audio.volume = volume;
    audio.play().catch(() => {
      console.log('Dialogue music is blocked until the user interacts with the page.');
    });
  });
}

function showTrainDialogue() {
  trainDialogueTimer = null;
  const activeScreen = document.querySelector('.screen.active')?.id;
  const overlay = document.getElementById('trainDialogueOverlay');
  const text = document.getElementById('trainDialogueText');
  if (!overlay || !text || (activeScreen !== 'mainMenu' && activeScreen !== 'trainArea')) {
    scheduleTrainDialogue();
    return;
  }

  const dialogue = trainDialogues[Math.floor(Math.random() * trainDialogues.length)];
  text.textContent = dialogue;
  pauseMusicForTrainDialogue();
  trainDialogueOpen = true;
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
}

function closeTrainDialogue() {
  const overlay = document.getElementById('trainDialogueOverlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  if (trainDialogueOpen) {
    trainDialogueOpen = false;
    resumeMusicAfterTrainDialogue();
  }
  scheduleTrainDialogue();
}

function dismissTrainDialogueWithoutResume() {
  const overlay = document.getElementById('trainDialogueOverlay');
  if (overlay) {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
  }
  trainDialogueOpen = false;
  pausedDialogueMusic = [];
  clearTrainDialogueTimer();
}

function setAudioVolume(audio, volume) {
  if (!audio) return;
  audio.volume = Math.max(0, Math.min(1, volume));
  audio.muted = false;
}

function forceAudioLoad(audio) {
  if (!audio) return;
  audio.preload = 'auto';
  audio.load();
}

function startBackgroundMusic() {
  if (!backgroundMusic || staticRadioStopped) return;

  setAudioVolume(backgroundMusic, 0.22);
  backgroundMusic.muted = false;
  forceAudioLoad(backgroundMusic);

  const playPromise = backgroundMusic.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      console.log('Audio is blocked until the user interacts with the page.');
    });
  }
}

window.addEventListener('pointerdown', startBackgroundMusic, { once: true });
window.addEventListener('keydown', startBackgroundMusic, { once: true });

function playClosingTape() {
  staticRadioStopped = true;

  if (backgroundMusic) {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    backgroundMusic.volume = 0;
    backgroundMusic.muted = false;
  }

  if (!closingTapeAudio) return;

  forceAudioLoad(closingTapeAudio);
  setAudioVolume(closingTapeAudio, 0.7);
  closingTapeAudio.currentTime = 0;
  closingTapeAudio.play().catch(() => {
    console.log('Closing tape audio is blocked until user interaction.');
  });
}

function startTrainMenuAudio() {
  [trainAudio, trainLobbyMusic].forEach(audio => {
    if (!audio) return;
    safePlayAudio(audio, { volume: 0.35, duration: 1500, loop: true });
  });
}

function fadeOutAudio(audio, duration = 1800) {
  if (!audio) return;

  const startVolume = audio.volume || 0.35;
  const startTime = performance.now();

  function updateVolume(now) {
    const progress = Math.min(1, (now - startTime) / duration);
    audio.volume = startVolume * (1 - progress);
    if (progress < 1) {
      requestAnimationFrame(updateVolume);
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  requestAnimationFrame(updateVolume);
}

function safePlayAudio(audio, { volume = 0.45, duration = 2200, loop = true } = {}) {
  if (!audio) return Promise.resolve(false);

  audio.preload = 'auto';
  audio.muted = false;
  audio.loop = loop;
  audio.volume = 0;
  audio.load();
  audio.currentTime = 0;

  return new Promise((resolve) => {
    let retryCount = 0;

    const attemptPlay = () => {
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.then(() => {
          if (duration > 0) {
            const startTime = performance.now();
            const fade = (now) => {
              const progress = Math.min(1, (now - startTime) / duration);
              audio.volume = volume * progress;
              if (progress < 1) {
                requestAnimationFrame(fade);
              }
            };
            requestAnimationFrame(fade);
          } else {
            audio.volume = volume;
          }
          resolve(true);
        }).catch(() => {
          retryCount += 1;
          if (retryCount < 12) {
            setTimeout(attemptPlay, 200);
            return;
          }
          resolve(false);
        });
      } else {
        if (duration > 0) {
          const startTime = performance.now();
          const fade = (now) => {
            const progress = Math.min(1, (now - startTime) / duration);
            audio.volume = volume * progress;
            if (progress < 1) {
              requestAnimationFrame(fade);
            }
          };
          requestAnimationFrame(fade);
        } else {
          audio.volume = volume;
        }
        resolve(true);
      }
    };

    attemptPlay();
  });
}

function startMissionPrelude() {
  staticRadioStopped = true;
  const mainMenu = document.getElementById('mainMenu');
  const mainArea = document.getElementById('mainArea');

  if (backgroundMusic) {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    backgroundMusic.volume = 0;
    backgroundMusic.muted = false;
  }

  if (mainMenu) {
    mainMenu.classList.remove('fadeIn', 'fadeOut');
    mainMenu.classList.add('fadeOut');
    setTimeout(() => {
      mainMenu.classList.remove('active', 'fadeOut');
      mainMenu.style.display = 'none';
      mainMenu.style.opacity = '0';
      mainMenu.style.visibility = 'hidden';

      if (mainArea) {
        showScreen('mainArea');
      }
    }, 1200);
  }

  [trainAudio, trainLobbyMusic].forEach(audio => {
    if (!audio) return;
    if (audio === trainLobbyMusic) {
      fadeOutAudio(audio, 1800);
      return;
    }
    audio.pause();
    audio.currentTime = 0;
  });

  safePlayAudio(mainMusic, { volume: 0.45, duration: 2200, loop: true });
}

function showMenuOverlay(type) {
  const overlay = document.getElementById('menuOverlay');
  const title = document.getElementById('menuOverlayTitle');
  const content = document.getElementById('menuOverlayContent');
  if (!overlay || !title || !content) return;

  const sections = {
    instructions: {
      title: 'Instructions',
      content: '<ul><li>Use your mouse to click and drag to move and interact with objects.</li><li>Inspect each area carefully for clues.</li><li>Keep a tab open for possible ciphers.</li><li>Document your findings for the DSE.</li><li>Good luck on your mission.</li></ul>'
    },
    credits: {
      title: 'Credits',
      content: '<p>Game: MayMeru / 4UrMel</p><p>Idea: MayMeru / 4UrMel, ItAintCZ</p><p>Music: Heaven Pierce Her / Hakita</p><p>SFX: pixabay.com</p><p>With the permission of Pak Engkus</p>'
    },
    cipherHint: {
      title: 'Cipher Hint',
      content: '<p>Home to the city of Oslo.</p>'
    }
  };

  const section = sections[type];
  if (!section) return;

  title.textContent = section.title;
  content.innerHTML = section.content;
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
}

function showInstructions() {
  showMenuOverlay('instructions');
}

function showCredits() {
  showMenuOverlay('credits');
}

function showCipherHint() {
  showMenuOverlay('cipherHint');
}

function openLeftArea() {
  showScreen('leftArea');
}

function openFrontArea() {
  showScreen('frontArea');
}

function returnToMainArea() {
  showScreen('mainArea');
}

function returnToMainAreaFront() {
  showScreen('mainArea');
}

function returnToMainAreaFromTrain() {
  showScreen('mainArea');
}

function returnToFrontArea() {
  showScreen('frontArea');
}

function openTrainArea() {
  closeFindingForm();
  showScreen('trainArea');
}

function openFindingForm() {
  const form = document.getElementById('findingFormCard');
  const trainScene = document.getElementById('trainAreaScene');
  if (!form) return;
  form.classList.add('open');
  form.setAttribute('aria-hidden', 'false');
  if (trainScene) {
    trainScene.classList.add('form-open');
  }
}

function closeFindingForm() {
  const form = document.getElementById('findingFormCard');
  const trainScene = document.getElementById('trainAreaScene');
  if (!form) return;
  form.classList.remove('open');
  form.setAttribute('aria-hidden', 'true');
  if (trainScene) {
    trainScene.classList.remove('form-open');
  }
}

function submitFindings() {
  const entityName = document.getElementById('entityNameInput')?.value?.trim();
  const classification = document.getElementById('entityClassificationInput')?.value?.trim();
  const locationName = document.getElementById('locationNameInput')?.value?.trim();
  const nextLocationName = document.getElementById('nextLocationNameInput')?.value?.trim();
  const verification = document.getElementById('findingVerification');

  const normalizeFinding = value => value.toLowerCase().replace(/\s+/g, ' ').trim();
  const expectedFindings = {
    entityName: 'viva rosa',
    classification: 'not dangerous',
    locationName: 'pluviasilva mira',
    nextLocationName: 'fungi o wonder'
  };
  const submittedFindings = {
    entityName: normalizeFinding(entityName),
    classification: normalizeFinding(classification),
    locationName: normalizeFinding(locationName),
    nextLocationName: normalizeFinding(nextLocationName)
  };
  const findingHints = {
    entityName: 'Perhaps poking at those flowers at the start will help?',
    classification: 'Did you read the description right?',
    locationName: 'Did you know? Certain countries have their own cipher.',
    nextLocationName: '[website]/[user]/status/[tweet id] and perhaps use UTF-8 and ROT13?'
  };
  const hintElements = {
    entityName: document.getElementById('entityNameHint'),
    classification: document.getElementById('entityClassificationHint'),
    locationName: document.getElementById('locationNameHint'),
    nextLocationName: document.getElementById('nextLocationNameHint')
  };
  const incorrectFields = Object.keys(expectedFindings).filter(field => {
    const isCorrect = submittedFindings[field] === expectedFindings[field];
    const hintElement = hintElements[field];
    if (hintElement) {
      hintElement.textContent = isCorrect ? '' : findingHints[field];
      hintElement.className = isCorrect ? 'findingHint' : 'findingHint visible';
    }
    return !isCorrect;
  });
  const isVerified = incorrectFields.length === 0;

  if (!isVerified) {
    if (verification) {
      verification.textContent = 'Verification failed. Check the highlighted hints and try again.';
      verification.className = 'invalid';
    }
    return;
  }

  const findings = { entityName, classification, locationName, nextLocationName };
  console.log('Submitted findings:', findings);
  if (verification) {
    verification.textContent = 'Report verified. Findings saved.';
    verification.className = 'verified';
  }
  showEndingScreen();
}

function getRandomEndingWhisper() {
  const entries = [
    { text: 'we need you', weight: 70 },
    { text: "It's all yours. -P", weight: 12 },
    { text: "Whatever you do, at the crossroads don't turn left.", weight: 8 },
    { text: 'THE WORLD IS YOUR CANVAS. SO TAKE UP YOUR BRUSH. AND PAINT. THE WORLD. RED.', weight: 5 },
    { text: '07/23/26', weight: 3 },
    { text: "Hellooooo! I'm Verity, your personal helper friend! Ask me anything, I know everything!", weight: 6 },
    { text: "SUPER SIGMA RONIN", weight: 2 }
  ];

  const totalWeight = entries.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const entry of entries) {
    roll -= entry.weight;
    if (roll <= 0) return entry.text;
  }

  return entries[0].text;
}

function showEndingScreen() {
  [mainMusic, trainAudio, trainLobbyMusic].forEach(audio => {
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  });

  const endingWhisper = document.getElementById('endingWhisper');
  if (endingWhisper) {
    const whisperText = getRandomEndingWhisper();
    endingWhisper.textContent = whisperText || 'we need you';
  }

  if (endingMusic) {
    safePlayAudio(endingMusic, { volume: 0.45, duration: 1800, loop: true });
  }

  showScreen('endingScreen');
}

function showMushroomDialogue() {
  const overlay = document.getElementById('mushroomDialogueOverlay');
  if (!overlay) return;
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
}

function closeMushroomDialogue() {
  const overlay = document.getElementById('mushroomDialogueOverlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
}

function closeMenuOverlay() {
  const overlay = document.getElementById('menuOverlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
}

function showVivaRosaOverlay() {
  const overlay = document.getElementById('vivaRosaOverlay');
  if (!overlay) return;
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
}

function closeVivaRosaOverlay() {
  const overlay = document.getElementById('vivaRosaOverlay');
  const mainArea = document.getElementById('mainArea');
  if (!overlay) return;
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');

  if (mainArea) {
    mainArea.style.display = 'flex';
    mainArea.style.opacity = '1';
    mainArea.style.visibility = 'visible';
    mainArea.classList.add('active');
  }
}

function playVivaRosaCutscene() {
  const mainArea = document.getElementById('mainArea');
  const cutscene = document.getElementById('vivaRosaCutscene');
  if (!cutscene) return;

  if (mainArea) {
    mainArea.classList.remove('active', 'fadeIn', 'fadeOut');
    mainArea.style.display = 'none';
    mainArea.style.opacity = '0';
    mainArea.style.visibility = 'hidden';
  }

  cutscene.classList.add('open');
  cutscene.setAttribute('aria-hidden', 'false');

  setTimeout(() => {
    cutscene.classList.remove('open');
    cutscene.setAttribute('aria-hidden', 'true');
    showVivaRosaOverlay();
  }, 4000);
}

function handleRoseClick(event) {
  const rose = event.currentTarget;
  if (roseClickCount >= ROSE_CLICK_TARGET) return;

  roseClickCount += 1;
  const counter = document.getElementById('roseCounter');
  if (counter) {
    counter.textContent = `Roses discovered: ${roseClickCount} / ${ROSE_CLICK_TARGET}`;
  }

  if (roseClickCount === ROSE_CLICK_TARGET) {
    rose.remove();
    playVivaRosaCutscene();
  }
}

function initRoseDiscovery() {
  document.querySelectorAll('.redRose').forEach(rose => {
    rose.addEventListener('click', handleRoseClick);
  });
}

function fadeInAudio(audio, targetVolume, duration) {
  if (!audio) return;

  forceAudioLoad(audio);
  audio.currentTime = 0;
  audio.muted = false;
  audio.volume = 0;

  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      console.log('Train arrival audio is blocked until user interaction.');
    });
  }

  const startTime = performance.now();

  function updateVolume(now) {
    const progress = Math.min(1, (now - startTime) / duration);
    audio.volume = targetVolume * progress;
    if (progress < 1) requestAnimationFrame(updateVolume);
  }

  requestAnimationFrame(updateVolume);
}

function openMainMenuAfterTrainArrival() {
  if (!trainArrive) {
    showScreen('mainMenu');
    startTrainMenuAudio();
    return;
  }

  const mazeScreen = document.getElementById('maze');
  const MAZE_FADE_OUT_DURATION = 2200;

  if (mazeScreen) {
    mazeScreen.classList.remove('fadeIn', 'fadeOut');
    mazeScreen.classList.add('mazeExit');
  }

  setTimeout(() => {
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active', 'fadeIn', 'fadeOut', 'mazeExit');
      screen.style.display = 'none';
      screen.style.opacity = '0';
      screen.style.visibility = 'hidden';
    });

    trainArrive.currentTime = 0;
    trainArrive.onended = () => {
      showScreen('mainMenu');
      startTrainMenuAudio();
    };
    safePlayAudio(trainArrive, { volume: 0.9, duration: 2500, loop: false });
  }, MAZE_FADE_OUT_DURATION);
}

function showScreen(id){
  if (trainDialogueOpen || document.getElementById('trainDialogueOverlay')?.classList.contains('open')) {
    dismissTrainDialogueWithoutResume();
  }
  clearTrainDialogueTimer();
  const screens = document.querySelectorAll('.screen');
  screens.forEach(s => {
    s.classList.remove('active', 'fadeIn', 'fadeOut');
    s.style.display = 'none';
    s.style.opacity = '0';
    s.style.visibility = 'hidden';
  });

  const target = document.getElementById(id);
  if (!target) return;

  target.style.display = (id === 'mainMenu' || id === 'mainArea' || id === 'leftArea' || id === 'frontArea' || id === 'trainArea' || id === 'endingScreen') ? 'flex' : 'block';
  target.style.opacity = '0';
  target.style.visibility = 'hidden';
  target.classList.add('active');

  requestAnimationFrame(() => {
    target.classList.add('fadeIn');
    target.style.visibility = 'visible';
    target.style.opacity = '1';
  });

  setTimeout(() => {
    target.classList.remove('fadeIn');
  }, 1200);

  if (id === 'mainMenu' || id === 'trainArea') {
    scheduleTrainDialogue();
  }
}

function beginMissionSequence() {
  startBackgroundMusic();

  const missionDetails = document.getElementById('missionDetails');
  const startMenu = document.getElementById('startMenu');

  const PRE_FADE_IN_DELAY = 300;
  const MISSION_DETAILS_DELAY = 5000;

  if (startMenu) {
    startMenu.classList.remove('fadeIn');
    startMenu.classList.add('fadeOut');
    setTimeout(() => {
      startMenu.classList.remove('active', 'fadeOut');
      startMenu.style.display = 'none';
      startMenu.style.opacity = '0';
      startMenu.style.visibility = 'hidden';
    }, 1200);
  }

  if (missionDetails) {
    missionDetails.style.display = 'block';
    missionDetails.style.opacity = '0';
    missionDetails.style.visibility = 'hidden';
    missionDetails.classList.remove('fadeIn', 'fadeOut');
    missionDetails.classList.add('active');

    setTimeout(() => {
      missionDetails.classList.add('fadeIn');
      missionDetails.style.visibility = 'visible';
      missionDetails.style.opacity = '1';
    }, PRE_FADE_IN_DELAY);

    setTimeout(() => {
      missionDetails.classList.remove('fadeIn');
      playClosingTape();
      missionDetails.style.display = 'none';
      missionDetails.style.opacity = '0';
      missionDetails.style.visibility = 'hidden';
      startMaze(openMainMenuAfterTrainArrival);
    }, PRE_FADE_IN_DELAY + MISSION_DETAILS_DELAY);
  } else {
    startMaze(openMainMenuAfterTrainArrival);
  }
}

/* ================= MAZE ENGINE (trace with the cursor, entry only) ================= */
const MAZE_COLS = 9, MAZE_ROWS = 9, CELL = 30, MARGIN = 6;
let mazeCells = null, mazeWalls = null;
let mazeCtx, mazeCanvasEl;
let mazeDragging = false, mazePos = null, mazeStartPt, mazeEndPt, mazeSolvedCallback = null;

function generateMazeCells(cols, rows){
  const cells = [];
  for(let r=0;r<rows;r++){
    const row=[];
    for(let c=0;c<cols;c++) row.push({N:true,E:true,S:true,W:true,visited:false});
    cells.push(row);
  }
  const stack=[{r:0,c:0}];
  cells[0][0].visited = true;
  const opposite = {N:'S',S:'N',E:'W',W:'E'};
  while(stack.length){
    const {r,c} = stack[stack.length-1];
    const neighbors = [];
    if(r>0 && !cells[r-1][c].visited) neighbors.push({r:r-1,c,dir:'N'});
    if(r<rows-1 && !cells[r+1][c].visited) neighbors.push({r:r+1,c,dir:'S'});
    if(c>0 && !cells[r][c-1].visited) neighbors.push({r,c:c-1,dir:'W'});
    if(c<cols-1 && !cells[r][c+1].visited) neighbors.push({r,c:c+1,dir:'E'});
    if(!neighbors.length){ stack.pop(); continue; }
    const n = neighbors[Math.floor(Math.random()*neighbors.length)];
    cells[r][c][n.dir] = false;
    cells[n.r][n.c][opposite[n.dir]] = false;
    cells[n.r][n.c].visited = true;
    stack.push({r:n.r, c:n.c});
  }
  return cells;
}
function buildWallSegments(cells, cols, rows, cell, margin){
  const walls=[];
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      const x = margin + c*cell, y = margin + r*cell;
      const w = cells[r][c];
      if(w.N) walls.push([x,y,x+cell,y]);
      if(w.W) walls.push([x,y,x,y+cell]);
      if(r===rows-1 && w.S) walls.push([x,y+cell,x+cell,y+cell]);
      if(c===cols-1 && w.E) walls.push([x+cell,y,x+cell,y+cell]);
    }
  }
  return walls;
}
function segIntersect(p1,p2,p3,p4){
  function ccw(a,b,c){ return (c[1]-a[1])*(b[0]-a[0]) > (b[1]-a[1])*(c[0]-a[0]); }
  return ccw(p1,p3,p4) !== ccw(p2,p3,p4) && ccw(p1,p2,p3) !== ccw(p1,p2,p4);
}
function cellCenter(r,c,cell,margin){ return [margin + c*cell + cell/2, margin + r*cell + cell/2]; }

function initMazeCanvas(){
  mazeCanvasEl = document.getElementById('mazeCanvas');
  mazeCanvasEl.width = MARGIN*2 + MAZE_COLS*CELL;
  mazeCanvasEl.height = MARGIN*2 + MAZE_ROWS*CELL;
  mazeCtx = mazeCanvasEl.getContext('2d');
  mazeCanvasEl.addEventListener('pointerdown', mazePointerDown);
  mazeCanvasEl.addEventListener('pointermove', mazePointerMove);
  window.addEventListener('pointerup', () => { mazeDragging = false; });
}

function startMaze(onSolved){
  if(!mazeCells) mazeCells = generateMazeCells(MAZE_COLS, MAZE_ROWS);
  mazeWalls = buildWallSegments(mazeCells, MAZE_COLS, MAZE_ROWS, CELL, MARGIN);
  mazeSolvedCallback = onSolved;
  mazeStartPt = cellCenter(0,0,CELL,MARGIN);
  mazeEndPt   = cellCenter(MAZE_ROWS-1, MAZE_COLS-1, CELL, MARGIN);
  mazePos = mazeStartPt.slice();
  mazeDragging = false;
  document.getElementById('mazeStatus').textContent = 'Trace a path through the maze. Touching a wall sends you back to the start.';
  document.getElementById('mazeTitle').textContent = 'MAZE — ENTRY';

  const mazeScreen = document.getElementById('maze');
  if (mazeScreen) {
    document.querySelectorAll('.screen').forEach(s => {
      s.classList.remove('active', 'fadeIn', 'fadeOut');
      s.style.display = 'none';
      s.style.opacity = '0';
      s.style.visibility = 'hidden';
    });

    mazeScreen.style.display = 'block';
    mazeScreen.style.opacity = '0';
    mazeScreen.style.visibility = 'hidden';
    mazeScreen.classList.add('active');

    requestAnimationFrame(() => {
      mazeScreen.classList.add('fadeIn');
      mazeScreen.style.visibility = 'visible';
      mazeScreen.style.opacity = '1';
    });

    setTimeout(() => {
      mazeScreen.classList.remove('fadeIn');
    }, 1200);
  }

  drawMaze();
}
function drawMaze(){
  const ctx = mazeCtx;
  ctx.clearRect(0,0,mazeCanvasEl.width, mazeCanvasEl.height);
  ctx.strokeStyle = 'rgba(242,237,228,0.7)';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  mazeWalls.forEach(w => {
    ctx.beginPath();
    ctx.moveTo(w[0], w[1]);
    ctx.lineTo(w[2], w[3]);
    ctx.stroke();
  });
  ctx.fillStyle = '#c0925a';
  ctx.beginPath(); ctx.arc(mazeEndPt[0], mazeEndPt[1], 6, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#c11e1e';
  ctx.beginPath(); ctx.arc(mazePos[0], mazePos[1], 6, 0, Math.PI*2); ctx.fill();
  }
function getCanvasPos(e){
  const rect = mazeCanvasEl.getBoundingClientRect();
  const scaleX = mazeCanvasEl.width / rect.width;
  const scaleY = mazeCanvasEl.height / rect.height;
  return [ (e.clientX-rect.left)*scaleX, (e.clientY-rect.top)*scaleY ];
}
function mazePointerDown(e){
  const p = getCanvasPos(e);
  const dx = p[0]-mazePos[0], dy = p[1]-mazePos[1];
  if(Math.sqrt(dx*dx+dy*dy) < 20){ mazeDragging = true; }
}
function mazePointerMove(e){
  if(!mazeDragging) return;
  const target = getCanvasPos(e);
  const dist = Math.hypot(target[0]-mazePos[0], target[1]-mazePos[1]);
  const steps = Math.min(60, Math.max(1, Math.ceil(dist / 4)));
  let cur = mazePos.slice();
  let blocked = false;
  for(let i=1; i<=steps; i++){
    const t = i/steps;
    const next = [ mazePos[0] + (target[0]-mazePos[0])*t, mazePos[1] + (target[1]-mazePos[1])*t ];
    if(mazeWalls.some(w => segIntersect(cur, next, [w[0],w[1]], [w[2],w[3]]))){
      blocked = true;
      break;
    }
    cur = next;
  }
  if(blocked){
    mazeDragging = false;
    mazePos = mazeStartPt.slice();
    document.getElementById('mazeStatus').textContent = 'Blocked. Back to the start.';
    drawMaze();
    return;
  }
  mazePos = target;
  drawMaze();
  const ed = Math.hypot(target[0]-mazeEndPt[0], target[1]-mazeEndPt[1]);
  if(ed < 12){
    mazeDragging = false;
    document.getElementById('mazeStatus').textContent = 'Path clear.';
    const cb = mazeSolvedCallback;
    setTimeout(() => { if(cb) cb(); }, 500);
  }
}
initMazeCanvas();
initRoseDiscovery();
showScreen('startMenu');