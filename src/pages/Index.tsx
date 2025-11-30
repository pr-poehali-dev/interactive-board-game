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
};

type CellType = 'normal' | 'bonus' | 'speed';

type GameCell = {
  id: number;
  type: CellType;
  label: string;
};

const characters: Character[] = [
  { id: '1', name: 'Зайчик', emoji: '🐰', color: 'bg-purple-500' },
  { id: '2', name: 'Котик', emoji: '🐱', color: 'bg-orange-500' },
  { id: '3', name: 'Панда', emoji: '🐼', color: 'bg-blue-500' }
];

const generateBoard = (): GameCell[] => {
  const cells: GameCell[] = [];
  for (let i = 0; i < 20; i++) {
    let type: CellType = 'normal';
    let label = `${i + 1}`;
    
    if ([4, 9, 14].includes(i)) {
      type = 'bonus';
      label = '⭐ +1 ход';
    } else if ([7, 16].includes(i)) {
      type = 'speed';
      label = '⚡ Ускорение';
    }
    
    cells.push({ id: i, type, label });
  }
  return cells;
};

const Index = () => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'achievements'>('menu');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [playerPosition, setPlayerPosition] = useState(0);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [wins, setWins] = useState(0);
  const [bonusesCollected, setBonusesCollected] = useState(0);
  const [extraMoves, setExtraMoves] = useState(0);
  const [board] = useState(generateBoard());

  useEffect(() => {
    const saved = localStorage.getItem('game-stats');
    if (saved) {
      const stats = JSON.parse(saved);
      setGamesPlayed(stats.gamesPlayed || 0);
      setWins(stats.wins || 0);
      setBonusesCollected(stats.bonusesCollected || 0);
    }
  }, []);

  const saveStats = (newGames: number, newWins: number, newBonuses: number) => {
    localStorage.setItem('game-stats', JSON.stringify({
      gamesPlayed: newGames,
      wins: newWins,
      bonusesCollected: newBonuses
    }));
  };

  const startGame = (character: Character) => {
    setSelectedCharacter(character);
    setPlayerPosition(0);
    setDiceValue(null);
    setExtraMoves(0);
    setGameState('playing');
  };

  const rollDice = () => {
    if (isRolling) return;
    
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

  const movePlayer = (steps: number) => {
    const newPosition = Math.min(playerPosition + steps, 19);
    setPlayerPosition(newPosition);
    
    const cell = board[newPosition];
    
    if (cell.type === 'bonus') {
      setExtraMoves(prev => prev + 1);
      setBonusesCollected(prev => {
        const newCount = prev + 1;
        saveStats(gamesPlayed, wins, newCount);
        return newCount;
      });
      toast.success('Бонус! +1 дополнительный ход! 🎉');
    } else if (cell.type === 'speed') {
      const speedBonus = Math.floor(Math.random() * 3) + 1;
      const speedPosition = Math.min(newPosition + speedBonus, 19);
      setTimeout(() => {
        setPlayerPosition(speedPosition);
        toast.success(`Ускорение! +${speedBonus} клеток! ⚡`);
        checkWin(speedPosition);
      }, 500);
      setIsRolling(false);
      return;
    }
    
    checkWin(newPosition);
    setIsRolling(false);
  };

  const checkWin = (position: number) => {
    if (position >= 19) {
      setTimeout(() => {
        toast.success('🎉 Поздравляем! Ты победил!');
        const newGames = gamesPlayed + 1;
        const newWins = wins + 1;
        setGamesPlayed(newGames);
        setWins(newWins);
        saveStats(newGames, newWins, bonusesCollected);
        setTimeout(() => setGameState('achievements'), 1000);
      }, 500);
    }
  };

  const renderMenu = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
      <div className="text-center space-y-8 animate-slide-in">
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-bold text-primary font-caveat animate-bounce-soft">
            Весёлая ходилка! 🎲
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground">
            Выбери персонажа и начни приключение
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {characters.map((character) => (
            <Card
              key={character.id}
              className="p-8 cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-2xl border-4"
              onClick={() => startGame(character)}
            >
              <div className="text-center space-y-4">
                <div className={`text-8xl animate-wiggle ${character.color} w-32 h-32 rounded-full mx-auto flex items-center justify-center shadow-xl`}>
                  {character.emoji}
                </div>
                <h3 className="text-3xl font-bold font-caveat">{character.name}</h3>
                <Button size="lg" className="w-full text-lg">
                  Играть
                  <Icon name="Play" className="ml-2" size={20} />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <Button
          variant="outline"
          size="lg"
          onClick={() => setGameState('achievements')}
          className="text-lg"
        >
          <Icon name="Trophy" className="mr-2" size={20} />
          Достижения
        </Button>
      </div>
    </div>
  );

  const renderGame = () => (
    <div className="min-h-screen p-4 bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setGameState('menu')}
          >
            <Icon name="ArrowLeft" className="mr-2" size={20} />
            В меню
          </Button>
          
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-xl px-6 py-3">
              {selectedCharacter?.emoji} {selectedCharacter?.name}
            </Badge>
            {extraMoves > 0 && (
              <Badge className="text-xl px-6 py-3 animate-pulse-glow bg-yellow-500">
                +{extraMoves} ход
              </Badge>
            )}
          </div>
        </div>

        <Card className="p-8">
          <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
            {board.map((cell, index) => {
              const isPlayerHere = playerPosition === index;
              const cellColors = {
                normal: 'bg-white border-primary',
                bonus: 'bg-yellow-100 border-yellow-500 animate-pulse-glow',
                speed: 'bg-blue-100 border-blue-500 animate-pulse-glow'
              };
              
              return (
                <div
                  key={cell.id}
                  className={`
                    relative aspect-square rounded-xl border-4 flex flex-col items-center justify-center
                    transition-all duration-300 ${cellColors[cell.type]}
                    ${isPlayerHere ? 'scale-110 shadow-2xl' : ''}
                  `}
                >
                  <div className="text-xs font-bold text-center px-1">
                    {cell.type === 'normal' ? cell.id + 1 : cell.label}
                  </div>
                  {isPlayerHere && (
                    <div className="text-4xl absolute -top-8 animate-bounce-soft">
                      {selectedCharacter?.emoji}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <div className="flex flex-col items-center gap-6">
          <Card className="p-8 w-full max-w-md">
            <div className="text-center space-y-6">
              <div className="text-7xl mx-auto w-32 h-32 flex items-center justify-center bg-white rounded-3xl border-8 border-primary shadow-xl">
                {diceValue ? (
                  <span className={isRolling ? 'animate-spin' : 'animate-bounce-soft'}>
                    🎲
                  </span>
                ) : (
                  '🎲'
                )}
              </div>
              {diceValue && !isRolling && (
                <div className="text-6xl font-bold text-primary animate-pulse-glow">
                  {diceValue}
                </div>
              )}
              <Button
                size="lg"
                onClick={rollDice}
                disabled={isRolling || (playerPosition >= 19)}
                className="w-full text-xl py-6"
              >
                {isRolling ? 'Бросаем...' : 'Бросить кубик'}
              </Button>
            </div>
          </Card>

          <div className="grid grid-cols-3 gap-4 w-full max-w-md">
            <Card className="p-4 text-center">
              <div className="text-3xl mb-2">🎯</div>
              <div className="text-sm text-muted-foreground">Позиция</div>
              <div className="text-2xl font-bold">{playerPosition + 1}/20</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-3xl mb-2">⭐</div>
              <div className="text-sm text-muted-foreground">Бонусы</div>
              <div className="text-2xl font-bold">{bonusesCollected}</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-3xl mb-2">🏆</div>
              <div className="text-sm text-muted-foreground">Победы</div>
              <div className="text-2xl font-bold">{wins}</div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAchievements = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
      <div className="max-w-2xl w-full space-y-8 animate-slide-in">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-primary mb-4 font-caveat">
            Достижения 🏆
          </h1>
        </div>

        <div className="grid gap-6">
          <Card className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-5xl">🎮</div>
                <div>
                  <h3 className="text-2xl font-bold">Игр сыграно</h3>
                  <p className="text-muted-foreground">Всего партий</p>
                </div>
              </div>
              <div className="text-5xl font-bold text-primary">{gamesPlayed}</div>
            </div>
          </Card>

          <Card className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-5xl">🏆</div>
                <div>
                  <h3 className="text-2xl font-bold">Победы</h3>
                  <p className="text-muted-foreground">Дошёл до финиша</p>
                </div>
              </div>
              <div className="text-5xl font-bold text-primary">{wins}</div>
            </div>
          </Card>

          <Card className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-5xl">⭐</div>
                <div>
                  <h3 className="text-2xl font-bold">Бонусов собрано</h3>
                  <p className="text-muted-foreground">Дополнительные ходы</p>
                </div>
              </div>
              <div className="text-5xl font-bold text-primary">{bonusesCollected}</div>
            </div>
          </Card>

          {wins > 0 && (
            <Card className="p-8 bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-500 border-4">
              <div className="text-center space-y-4">
                <div className="text-7xl animate-bounce-soft">🎉</div>
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
              setExtraMoves(0);
              setGameState('playing');
            }}
            disabled={!selectedCharacter}
            className="flex-1 text-lg"
          >
            <Icon name="Play" className="mr-2" size={20} />
            Играть ещё
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {gameState === 'menu' && renderMenu()}
      {gameState === 'playing' && renderGame()}
      {gameState === 'achievements' && renderAchievements()}
    </>
  );
};

export default Index;
