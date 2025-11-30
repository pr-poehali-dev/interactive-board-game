import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

type Character = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  ability: string;
};

type CellType = 'normal' | 'mushroom' | 'swamp' | 'flower' | 'tree';

type GameCell = {
  id: number;
  type: CellType;
  emoji: string;
  label: string;
};

const characters: Character[] = [
  { id: '1', name: 'Лисичка', emoji: '🦊', color: 'bg-orange-500', ability: 'Хитрость' },
  { id: '2', name: 'Ёжик', emoji: '🦔', color: 'bg-amber-700', ability: 'Стойкость' },
  { id: '3', name: 'Белочка', emoji: '🐿️', color: 'bg-amber-500', ability: 'Ловкость' }
];

const forestEvents = [
  { emoji: '🦉', text: 'Мудрая сова дала совет! +2 клетки' },
  { emoji: '🦌', text: 'Олень подвёз тебя! +3 клетки' },
  { emoji: '🐻', text: 'Встретил медведя! Пропуск хода' },
  { emoji: '🦋', text: 'Бабочка показала короткий путь! +1 клетка' },
  { emoji: '🐸', text: 'Лягушка квакнула - задержка! -1 клетка' }
];

const generateForestBoard = (): GameCell[] => {
  const cells: GameCell[] = [];
  for (let i = 0; i < 25; i++) {
    let type: CellType = 'normal';
    let emoji = '🌿';
    let label = `${i + 1}`;
    
    if ([5, 12, 19].includes(i)) {
      type = 'mushroom';
      emoji = '🍄';
      label = 'Гриб +2';
    } else if ([8, 16].includes(i)) {
      type = 'swamp';
      emoji = '🌊';
      label = 'Болото -1';
    } else if ([10, 20].includes(i)) {
      type = 'flower';
      emoji = '🌸';
      label = 'Цветок';
    } else if ([14, 22].includes(i)) {
      type = 'tree';
      emoji = '🌳';
      label = 'Дерево';
    }
    
    cells.push({ id: i, type, emoji, label });
  }
  return cells;
};

const Index = () => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'stats'>('menu');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [playerPosition, setPlayerPosition] = useState(0);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [wins, setWins] = useState(0);
  const [eventsTriggered, setEventsTriggered] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [board] = useState(generateForestBoard());
  const [skipNextTurn, setSkipNextTurn] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('forest-game-stats');
    if (saved) {
      const stats = JSON.parse(saved);
      setGamesPlayed(stats.gamesPlayed || 0);
      setWins(stats.wins || 0);
      setEventsTriggered(stats.eventsTriggered || 0);
      setBestTime(stats.bestTime || null);
    }
  }, []);

  const saveStats = (newGames: number, newWins: number, newEvents: number, time?: number) => {
    const stats: any = {
      gamesPlayed: newGames,
      wins: newWins,
      eventsTriggered: newEvents,
      bestTime: bestTime
    };
    
    if (time && (!bestTime || time < bestTime)) {
      stats.bestTime = time;
      setBestTime(time);
    }
    
    localStorage.setItem('forest-game-stats', JSON.stringify(stats));
  };

  const startGame = (character: Character) => {
    setSelectedCharacter(character);
    setPlayerPosition(0);
    setDiceValue(null);
    setSkipNextTurn(false);
    setStartTime(Date.now());
    setGameState('playing');
  };

  const rollDice = () => {
    if (isRolling) return;
    
    if (skipNextTurn) {
      toast.error('Пропускаешь ход из-за препятствия! 😅');
      setSkipNextTurn(false);
      return;
    }
    
    setIsRolling(true);
    setDiceValue(null);
    
    let rolls = 0;
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      rolls++;
      
      if (rolls > 10) {
        clearInterval(interval);
        const finalValue = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalValue);
        setTimeout(() => movePlayer(finalValue), 300);
      }
    }, 100);
  };

  const triggerRandomEvent = () => {
    const event = forestEvents[Math.floor(Math.random() * forestEvents.length)];
    const newEvents = eventsTriggered + 1;
    setEventsTriggered(newEvents);
    saveStats(gamesPlayed, wins, newEvents);
    
    if (event.text.includes('+2')) {
      const newPos = Math.min(playerPosition + 2, 24);
      setTimeout(() => setPlayerPosition(newPos), 500);
      toast.success(`${event.emoji} ${event.text}`);
    } else if (event.text.includes('+3')) {
      const newPos = Math.min(playerPosition + 3, 24);
      setTimeout(() => setPlayerPosition(newPos), 500);
      toast.success(`${event.emoji} ${event.text}`);
    } else if (event.text.includes('+1')) {
      const newPos = Math.min(playerPosition + 1, 24);
      setTimeout(() => setPlayerPosition(newPos), 500);
      toast.success(`${event.emoji} ${event.text}`);
    } else if (event.text.includes('Пропуск')) {
      setSkipNextTurn(true);
      toast.error(`${event.emoji} ${event.text}`);
    } else if (event.text.includes('-1')) {
      const newPos = Math.max(playerPosition - 1, 0);
      setTimeout(() => setPlayerPosition(newPos), 500);
      toast.error(`${event.emoji} ${event.text}`);
    }
  };

  const movePlayer = (steps: number) => {
    const newPosition = Math.min(playerPosition + steps, 24);
    setPlayerPosition(newPosition);
    
    const cell = board[newPosition];
    
    if (cell.type === 'mushroom') {
      setTimeout(() => {
        const mushroomPos = Math.min(newPosition + 2, 24);
        setPlayerPosition(mushroomPos);
        toast.success('Волшебный гриб! +2 клетки вперёд! 🍄');
        checkWin(mushroomPos);
      }, 500);
    } else if (cell.type === 'swamp') {
      setTimeout(() => {
        const swampPos = Math.max(newPosition - 1, 0);
        setPlayerPosition(swampPos);
        toast.error('Застрял в болоте! -1 клетка назад! 🌊');
        setIsRolling(false);
      }, 500);
      return;
    } else if (cell.type === 'flower') {
      toast.success('Волшебный цветок! Случайное событие! 🌸');
      setTimeout(() => triggerRandomEvent(), 500);
    } else if (cell.type === 'tree') {
      toast.info('Отдыхаешь под деревом 🌳');
    }
    
    checkWin(newPosition);
    setIsRolling(false);
  };

  const checkWin = (position: number) => {
    if (position >= 24) {
      const endTime = Date.now();
      const gameTime = startTime ? Math.floor((endTime - startTime) / 1000) : 0;
      
      setTimeout(() => {
        toast.success('🎉 Поздравляем! Ты прошёл весь лес!');
        const newGames = gamesPlayed + 1;
        const newWins = wins + 1;
        setGamesPlayed(newGames);
        setWins(newWins);
        saveStats(newGames, newWins, eventsTriggered, gameTime);
        setTimeout(() => setGameState('stats'), 1000);
      }, 500);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderMenu = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl animate-bounce-soft">🍃</div>
        <div className="absolute top-20 right-20 text-5xl animate-wiggle">🦋</div>
        <div className="absolute bottom-20 left-20 text-7xl animate-pulse-glow">🌸</div>
        <div className="absolute bottom-10 right-10 text-6xl animate-bounce-soft">🍄</div>
      </div>
      
      <div className="text-center space-y-8 animate-slide-in relative z-10">
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-bold text-primary font-caveat animate-bounce-soft drop-shadow-lg">
            Сказочный лес! 🌲✨
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground">
            Выбери персонажа и пройди через волшебный лес
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {characters.map((character) => (
            <Card
              key={character.id}
              className="p-8 cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-2xl border-4 border-primary/30 bg-white/90 backdrop-blur"
              onClick={() => startGame(character)}
            >
              <div className="text-center space-y-4">
                <div className={`text-8xl animate-wiggle ${character.color} w-32 h-32 rounded-full mx-auto flex items-center justify-center shadow-xl`}>
                  {character.emoji}
                </div>
                <h3 className="text-3xl font-bold font-caveat">{character.name}</h3>
                <Badge variant="secondary" className="text-lg">
                  {character.ability}
                </Badge>
                <Button size="lg" className="w-full text-lg">
                  В путь!
                  <Icon name="TreePine" className="ml-2" size={20} />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <Button
          variant="outline"
          size="lg"
          onClick={() => setGameState('stats')}
          className="text-lg"
        >
          <Icon name="Award" className="mr-2" size={20} />
          Статистика
        </Button>
      </div>
    </div>
  );

  const renderGame = () => {
    const currentTime = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
    
    return (
      <div className="min-h-screen p-4 bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <Button
              variant="outline"
              onClick={() => setGameState('menu')}
            >
              <Icon name="ArrowLeft" className="mr-2" size={20} />
              В меню
            </Button>
            
            <div className="flex items-center gap-4 flex-wrap">
              <Badge variant="secondary" className="text-xl px-6 py-3">
                {selectedCharacter?.emoji} {selectedCharacter?.name}
              </Badge>
              <Badge className="text-xl px-6 py-3 bg-blue-500">
                ⏱️ {formatTime(currentTime)}
              </Badge>
              {skipNextTurn && (
                <Badge className="text-xl px-6 py-3 bg-red-500 animate-pulse">
                  Пропуск хода!
                </Badge>
              )}
            </div>
          </div>

          <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="grid grid-cols-5 gap-3">
              {board.map((cell, index) => {
                const isPlayerHere = playerPosition === index;
                const cellColors = {
                  normal: 'bg-white border-green-500',
                  mushroom: 'bg-amber-100 border-amber-500 animate-pulse-glow',
                  swamp: 'bg-blue-200 border-blue-600',
                  flower: 'bg-pink-100 border-pink-500 animate-pulse-glow',
                  tree: 'bg-green-200 border-green-700'
                };
                
                return (
                  <div
                    key={cell.id}
                    className={`
                      relative aspect-square rounded-2xl border-4 flex flex-col items-center justify-center
                      transition-all duration-300 ${cellColors[cell.type]}
                      ${isPlayerHere ? 'scale-110 shadow-2xl ring-4 ring-primary' : ''}
                    `}
                  >
                    <div className="text-3xl mb-1">{cell.emoji}</div>
                    <div className="text-xs font-bold text-center px-1">
                      {cell.type === 'normal' ? cell.id + 1 : cell.label}
                    </div>
                    {isPlayerHere && (
                      <div className="text-5xl absolute -top-10 animate-bounce-soft drop-shadow-lg">
                        {selectedCharacter?.emoji}
                      </div>
                    )}
                    {cell.id === 24 && (
                      <div className="absolute -top-8 text-4xl animate-bounce-soft">
                        🏆
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="flex flex-col items-center gap-6">
            <Card className="p-8 w-full max-w-md bg-white/90 backdrop-blur">
              <div className="text-center space-y-6">
                <div className="text-7xl mx-auto w-32 h-32 flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200 rounded-3xl border-8 border-primary shadow-2xl">
                  {diceValue ? (
                    <span className={isRolling ? 'animate-spin' : 'animate-bounce-soft'}>
                      🎲
                    </span>
                  ) : (
                    '🎲'
                  )}
                </div>
                {diceValue && !isRolling && (
                  <div className="text-6xl font-bold text-primary animate-pulse-glow font-caveat">
                    {diceValue}
                  </div>
                )}
                <Button
                  size="lg"
                  onClick={rollDice}
                  disabled={isRolling || (playerPosition >= 24)}
                  className="w-full text-xl py-6"
                >
                  {skipNextTurn ? 'Пропустить ход 😢' : isRolling ? 'Бросаем...' : 'Бросить кубик'}
                </Button>
              </div>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
              <Card className="p-4 text-center bg-white/90">
                <div className="text-3xl mb-2">🎯</div>
                <div className="text-sm text-muted-foreground">Позиция</div>
                <div className="text-2xl font-bold">{playerPosition + 1}/25</div>
              </Card>
              <Card className="p-4 text-center bg-white/90">
                <div className="text-3xl mb-2">🦉</div>
                <div className="text-sm text-muted-foreground">События</div>
                <div className="text-2xl font-bold">{eventsTriggered}</div>
              </Card>
              <Card className="p-4 text-center bg-white/90">
                <div className="text-3xl mb-2">🏆</div>
                <div className="text-sm text-muted-foreground">Побед</div>
                <div className="text-2xl font-bold">{wins}</div>
              </Card>
              <Card className="p-4 text-center bg-white/90">
                <div className="text-3xl mb-2">⚡</div>
                <div className="text-sm text-muted-foreground">Рекорд</div>
                <div className="text-lg font-bold">{bestTime ? formatTime(bestTime) : '--:--'}</div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStats = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100">
      <div className="max-w-2xl w-full space-y-8 animate-slide-in">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-primary mb-4 font-caveat">
            Статистика путешествий 📊
          </h1>
        </div>

        <div className="grid gap-6">
          <Card className="p-8 bg-white/90 backdrop-blur">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-5xl">🎮</div>
                <div>
                  <h3 className="text-2xl font-bold">Путешествий</h3>
                  <p className="text-muted-foreground">Всего игр</p>
                </div>
              </div>
              <div className="text-5xl font-bold text-primary">{gamesPlayed}</div>
            </div>
          </Card>

          <Card className="p-8 bg-white/90 backdrop-blur">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-5xl">🏆</div>
                <div>
                  <h3 className="text-2xl font-bold">Побед</h3>
                  <p className="text-muted-foreground">Прошёл лес до конца</p>
                </div>
              </div>
              <div className="text-5xl font-bold text-primary">{wins}</div>
            </div>
          </Card>

          <Card className="p-8 bg-white/90 backdrop-blur">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-5xl">🦉</div>
                <div>
                  <h3 className="text-2xl font-bold">Событий</h3>
                  <p className="text-muted-foreground">Встреч с лесными жителями</p>
                </div>
              </div>
              <div className="text-5xl font-bold text-primary">{eventsTriggered}</div>
            </div>
          </Card>

          {bestTime && (
            <Card className="p-8 bg-gradient-to-r from-yellow-100 to-amber-100 border-yellow-500 border-4">
              <div className="text-center space-y-4">
                <div className="text-7xl animate-bounce-soft">⚡</div>
                <h3 className="text-3xl font-bold font-caveat">
                  Лучшее время: {formatTime(bestTime)}
                </h3>
              </div>
            </Card>
          )}

          {wins > 0 && (
            <Card className="p-8 bg-gradient-to-r from-green-100 to-emerald-100 border-green-500 border-4">
              <div className="text-center space-y-4">
                <div className="text-7xl animate-bounce-soft">🌟</div>
                <h3 className="text-3xl font-bold font-caveat">
                  Процент побед: {Math.round((wins / gamesPlayed) * 100)}%
                </h3>
              </div>
            </Card>
          )}
        </div>

        <div className="flex gap-4">
          <Button
            size="lg"
            variant="outline"
            onClick={() => setGameState('menu')}
            className="flex-1 text-lg"
          >
            <Icon name="Home" className="mr-2" size={20} />
            В меню
          </Button>
          <Button
            size="lg"
            onClick={() => {
              setPlayerPosition(0);
              setDiceValue(null);
              setSkipNextTurn(false);
              setStartTime(Date.now());
              setGameState('playing');
            }}
            disabled={!selectedCharacter}
            className="flex-1 text-lg"
          >
            <Icon name="TreePine" className="mr-2" size={20} />
            В лес!
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {gameState === 'menu' && renderMenu()}
      {gameState === 'playing' && renderGame()}
      {gameState === 'stats' && renderStats()}
    </>
  );
};

export default Index;
