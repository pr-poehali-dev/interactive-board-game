import { useState } from 'react';
import { Card } from '@/components/ui/card';

type Animal = {
  id: string;
  emoji: string;
  sound: string;
  color: string;
  name: string;
  audioUrl: string;
};

const animals: Animal[] = [
  { id: '1', emoji: '🐶', sound: 'Гав-гав!', color: 'bg-amber-400', name: 'Собачка', audioUrl: 'https://cdn.freesound.org/previews/362/362195_5121236-lq.mp3' },
  { id: '2', emoji: '🐱', sound: 'Мяу-мяу!', color: 'bg-orange-400', name: 'Котик', audioUrl: 'https://cdn.freesound.org/previews/634/634822_12366888-lq.mp3' },
  { id: '3', emoji: '🐮', sound: 'Му-у-у!', color: 'bg-pink-400', name: 'Коровка', audioUrl: 'https://cdn.freesound.org/previews/58/58277_634166-lq.mp3' },
  { id: '4', emoji: '🐷', sound: 'Хрю-хрю!', color: 'bg-rose-400', name: 'Свинка', audioUrl: 'https://cdn.freesound.org/previews/387/387234_1676145-lq.mp3' },
  { id: '5', emoji: '🐸', sound: 'Ква-ква!', color: 'bg-green-400', name: 'Лягушка', audioUrl: 'https://cdn.freesound.org/previews/521/521603_7037-lq.mp3' },
  { id: '6', emoji: '🐔', sound: 'Ко-ко-ко!', color: 'bg-yellow-400', name: 'Курочка', audioUrl: 'https://cdn.freesound.org/previews/610/610493_1015240-lq.mp3' },
  { id: '7', emoji: '🦆', sound: 'Кря-кря!', color: 'bg-blue-400', name: 'Уточка', audioUrl: 'https://cdn.freesound.org/previews/506/506053_1648170-lq.mp3' },
  { id: '8', emoji: '🐑', sound: 'Бе-е-е!', color: 'bg-slate-300', name: 'Овечка', audioUrl: 'https://cdn.freesound.org/previews/410/410366_6045088-lq.mp3' },
  { id: '9', emoji: '🐴', sound: 'И-го-го!', color: 'bg-amber-600', name: 'Лошадка', audioUrl: 'https://cdn.freesound.org/previews/66/66717_634166-lq.mp3' },
  { id: '10', emoji: '🦁', sound: 'Р-р-р!', color: 'bg-orange-600', name: 'Львёнок', audioUrl: 'https://cdn.freesound.org/previews/485/485281_8561196-lq.mp3' },
  { id: '11', emoji: '🐘', sound: 'Ту-у-у!', color: 'bg-gray-400', name: 'Слонёнок', audioUrl: 'https://cdn.freesound.org/previews/490/490493_10341326-lq.mp3' },
  { id: '12', emoji: '🐒', sound: 'У-у-а!', color: 'bg-amber-500', name: 'Обезьянка', audioUrl: 'https://cdn.freesound.org/previews/329/329026_3248244-lq.mp3' },
  { id: '13', emoji: '🐺', sound: 'А-у-у!', color: 'bg-gray-600', name: 'Волчок', audioUrl: 'https://cdn.freesound.org/previews/418/418174_6406134-lq.mp3' },
  { id: '14', emoji: '🐻', sound: 'У-р-р!', color: 'bg-amber-700', name: 'Мишка', audioUrl: 'https://cdn.freesound.org/previews/552/552045_10398852-lq.mp3' },
  { id: '15', emoji: '🐼', sound: 'Мя-я-у!', color: 'bg-slate-400', name: 'Панда', audioUrl: 'https://cdn.freesound.org/previews/634/634822_12366888-lq.mp3' }
];

const shapes = [
  { emoji: '⭐', color: 'bg-yellow-400', name: 'Звёздочка' },
  { emoji: '❤️', color: 'bg-red-400', name: 'Сердечко' },
  { emoji: '🔵', color: 'bg-blue-500', name: 'Кружок' },
  { emoji: '🟢', color: 'bg-green-500', name: 'Зелёный' },
  { emoji: '🟡', color: 'bg-yellow-400', name: 'Жёлтый' },
  { emoji: '🔴', color: 'bg-red-500', name: 'Красный' }
];

const Index = () => {
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [score, setScore] = useState(0);

  const handleAnimalClick = (animal: Animal) => {
    setSelectedAnimal(animal);
    setScore(prev => prev + 1);
    
    const audio = new Audio(animal.audioUrl);
    audio.volume = 0.8;
    audio.play().catch(err => console.log('Audio play error:', err));
    
    setTimeout(() => {
      setSelectedAnimal(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 p-4">
      <div className="max-w-7xl mx-auto space-y-8 py-8">
        <div className="text-center space-y-4">
          <h1 className="text-7xl md:text-9xl font-bold text-primary animate-bounce-soft drop-shadow-2xl">
            Животные! 🎉
          </h1>
          <div className="flex justify-center gap-4 flex-wrap">
            {shapes.map((shape) => (
              <div
                key={shape.emoji}
                className={`text-6xl md:text-8xl animate-wiggle ${shape.color} w-20 h-20 md:w-28 md:h-28 rounded-3xl flex items-center justify-center shadow-2xl`}
              >
                {shape.emoji}
              </div>
            ))}
          </div>
        </div>

        {selectedAnimal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm pointer-events-none">
            <Card className="p-16 bg-white/95 animate-scale-in shadow-2xl">
              <div className="text-center space-y-8">
                <div className="text-[200px] animate-bounce-soft">
                  {selectedAnimal.emoji}
                </div>
                <h2 className="text-7xl font-bold text-primary font-caveat">
                  {selectedAnimal.sound}
                </h2>
                <p className="text-5xl font-bold text-muted-foreground">
                  {selectedAnimal.name}
                </p>
              </div>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          {animals.map((animal) => (
            <button
              key={animal.id}
              onClick={() => handleAnimalClick(animal)}
              className={`
                ${animal.color} rounded-3xl p-8 md:p-12
                transform transition-all duration-200
                hover:scale-110 active:scale-95
                shadow-2xl hover:shadow-3xl
                border-8 border-white
                group
              `}
            >
              <div className="text-center space-y-4">
                <div className="text-8xl md:text-[180px] group-hover:animate-wiggle transition-transform">
                  {animal.emoji}
                </div>
                <p className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
                  {animal.name}
                </p>
              </div>
            </button>
          ))}
        </div>

        <div className="fixed bottom-8 right-8 bg-white rounded-full p-6 shadow-2xl border-8 border-primary">
          <div className="text-center">
            <div className="text-5xl mb-2">⭐</div>
            <div className="text-4xl font-bold text-primary">{score}</div>
          </div>
        </div>

        <div className="flex justify-center gap-4 flex-wrap mt-12">
          <div className="bg-red-500 w-32 h-32 rounded-full animate-bounce-soft shadow-2xl"></div>
          <div className="bg-blue-500 w-32 h-32 rounded-full animate-bounce-soft animation-delay-100 shadow-2xl"></div>
          <div className="bg-green-500 w-32 h-32 rounded-full animate-bounce-soft animation-delay-200 shadow-2xl"></div>
          <div className="bg-yellow-400 w-32 h-32 rounded-full animate-bounce-soft animation-delay-300 shadow-2xl"></div>
        </div>
      </div>
    </div>
  );
};

export default Index;