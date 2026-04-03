import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import BreathingExercise from '@/components/BreathingExercise';
import AnimatedBot from '@/components/AnimatedBot';
import { Wind, Snowflake, Eye, Gamepad2, Brain, Heart, ArrowLeft } from 'lucide-react';

type ExerciseType = 'overview' | 'breathing' | 'grounding' | 'cold' | 'games';

const Exercises = () => {
  const navigate = useNavigate();
  const [activeExercise, setActiveExercise] = useState<ExerciseType>('overview');

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    navigate('/');
  };

  const exercises = [
    {
      id: 'breathing' as const,
      icon: Wind,
      title: 'Breathing Exercise',
      description: '4-4-6-2 pattern to activate your parasympathetic nervous system',
      color: 'primary-gradient',
    },
    {
      id: 'grounding' as const,
      icon: Eye,
      title: '5-4-3-2-1 Grounding',
      description: 'Use your senses to ground yourself in the present moment',
      color: 'bg-highlight',
    },
    {
      id: 'cold' as const,
      icon: Snowflake,
      title: 'Cold Compression',
      description: 'Guided cold therapy to reduce anxiety quickly',
      color: 'bg-accent',
    },
    {
      id: 'games' as const,
      icon: Gamepad2,
      title: 'Calming Games',
      description: 'Therapeutic mini-games designed to reduce stress',
      color: 'bg-success',
    },
  ];

  const renderExercise = () => {
    switch (activeExercise) {
      case 'breathing':
        return <BreathingExercise />;
      
      case 'grounding':
        return (
          <Card variant="glass" className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">5-4-3-2-1 Grounding Technique</CardTitle>
              <CardDescription>Use your senses to anchor yourself in the present</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { count: 5, sense: 'SEE', prompt: 'Name 5 things you can see around you', emoji: '👁️' },
                { count: 4, sense: 'TOUCH', prompt: 'Name 4 things you can physically feel', emoji: '✋' },
                { count: 3, sense: 'HEAR', prompt: 'Name 3 things you can hear right now', emoji: '👂' },
                { count: 2, sense: 'SMELL', prompt: 'Name 2 things you can smell', emoji: '👃' },
                { count: 1, sense: 'TASTE', prompt: 'Name 1 thing you can taste', emoji: '👅' },
              ].map((item, index) => (
                <div
                  key={item.sense}
                  className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-14 h-14 rounded-full primary-gradient flex items-center justify-center text-2xl shadow-glow">
                    {item.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-primary">{item.count}</span>
                      <span className="text-sm font-semibold text-muted-foreground">{item.sense}</span>
                    </div>
                    <p className="text-foreground">{item.prompt}</p>
                  </div>
                </div>
              ))}
              
              <div className="text-center pt-4">
                <p className="text-sm text-muted-foreground">
                  Take your time with each step. There's no rush.
                </p>
              </div>
            </CardContent>
          </Card>
        );
      
      case 'cold':
        return (
          <Card variant="glass" className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-xl flex items-center justify-center gap-2">
                <Snowflake className="w-6 h-6 text-highlight" />
                Cold Compression Therapy
              </CardTitle>
              <CardDescription>A quick technique to activate your dive reflex and calm anxiety</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-8 rounded-2xl bg-highlight/10 border border-highlight/20">
                <div className="text-6xl mb-4">🧊</div>
                <h3 className="font-semibold text-foreground mb-2">What you'll need:</h3>
                <p className="text-muted-foreground">A bowl of cold water or ice pack</p>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Steps:</h4>
                {[
                  'Fill a bowl with cold water (add ice if available)',
                  'Take a deep breath and hold it',
                  'Submerge your face in the water for 30 seconds, or hold the ice pack to your face',
                  'Focus on the cold sensation',
                  'Repeat 2-3 times if needed',
                ].map((step, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                    <span className="w-7 h-7 rounded-full primary-gradient flex items-center justify-center text-sm font-bold text-primary-foreground shrink-0">
                      {index + 1}
                    </span>
                    <p className="text-foreground pt-0.5">{step}</p>
                  </div>
                ))}
              </div>
              
              <Card variant="calm" className="p-4">
                <div className="flex items-start gap-3">
                  <Brain className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Why it works:</p>
                    <p className="text-sm text-muted-foreground">
                      Cold water activates the "dive reflex" which slows your heart rate and triggers your parasympathetic nervous system.
                    </p>
                  </div>
                </div>
              </Card>
            </CardContent>
          </Card>
        );
      
      case 'games':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Calming Games</h2>
              <p className="text-muted-foreground">Choose a game to help reduce stress and anxiety</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: 'Color Match',
                  description: 'A peaceful matching game with calming colors',
                  emoji: '🎨',
                  color: 'bg-secondary',
                },
                {
                  title: 'Bubble Pop',
                  description: 'Pop bubbles at your own pace',
                  emoji: '🫧',
                  color: 'bg-highlight/20',
                },
                {
                  title: 'Zen Garden',
                  description: 'Create patterns in a virtual sand garden',
                  emoji: '🪨',
                  color: 'bg-success/20',
                },
                {
                  title: 'Memory Flow',
                  description: 'Gentle memory game with nature themes',
                  emoji: '🌿',
                  color: 'bg-accent/20',
                },
              ].map((game, index) => (
                <Card 
                  key={game.title} 
                  variant="interactive"
                  className="fade-in-up cursor-pointer"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6">
                    <div className={`w-16 h-16 rounded-2xl ${game.color} flex items-center justify-center text-3xl mb-4`}>
                      {game.emoji}
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{game.title}</h3>
                    <p className="text-sm text-muted-foreground">{game.description}</p>
                    <Button variant="ghost" size="sm" className="mt-4" onClick={() => navigate('/games')}>
                      Play Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <p className="text-center text-sm text-muted-foreground mt-8">
              Games are designed to be non-competitive and calming
            </p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar userRole="user" onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-8">
        {activeExercise === 'overview' ? (
          <div className="space-y-8 fade-in-up">
            {/* Header */}
            <div className="text-center">
              <AnimatedBot size="lg" mood="happy" className="mx-auto mb-6" />
              <h1 className="font-serif text-4xl font-bold text-foreground mb-4">
                Therapeutic Exercises
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Choose an exercise to help calm your mind and body. Each one is designed to reduce stress and anxiety.
              </p>
            </div>

            {/* Exercise Cards */}
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {exercises.map((exercise, index) => (
                <Card
                  key={exercise.id}
                  variant="interactive"
                  className="fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => {
                    if (exercise.id === 'games') navigate('/games');
                    else setActiveExercise(exercise.id);
                  }}
                >
                  <CardContent className="p-6">
                    <div className={`w-16 h-16 rounded-2xl ${exercise.color} flex items-center justify-center mb-4 shadow-glow`}>
                      <exercise.icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                      {exercise.title}
                    </h3>
                    <p className="text-muted-foreground">{exercise.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Tip */}
            <Card variant="calm" className="max-w-2xl mx-auto">
              <CardContent className="p-6 flex items-center gap-4">
                <Heart className="w-10 h-10 text-accent shrink-0" />
                <div>
                  <p className="font-medium text-foreground">
                    Remember: Consistency is key
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Regular practice of these exercises can help build resilience against stress over time.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <Button
              variant="ghost"
              onClick={() => setActiveExercise('overview')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Exercises
            </Button>
            
            {renderExercise()}
          </div>
        )}
      </main>
    </div>
  );
};

export default Exercises;
