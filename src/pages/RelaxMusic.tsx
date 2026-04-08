


import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Repeat, Heart } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: string;
  category: string;
  emoji: string;
  gradient: string;
  url: string;
  description: string;
}

const tracks: Track[] = [
  { id: '1', title: 'Rain on Leaves', artist: 'Nature Sounds', category: 'rain', emoji: '🌧️', gradient: 'from-slate-400 to-blue-500', description: 'Gentle rain falling on forest leaves', url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_270f626311.mp3' },
  { id: '2', title: 'Ocean Waves', artist: 'Nature Sounds', category: 'nature', emoji: '🌊', gradient: 'from-blue-400 to-cyan-500', description: 'Peaceful waves on a calm shore', url: 'https://cdn.pixabay.com/download/audio/2021/09/06/audio_bb630b37d5.mp3' },
  { id: '3', title: 'Forest Ambience', artist: 'Nature Sounds', category: 'nature', emoji: '🌲', gradient: 'from-green-400 to-emerald-600', description: 'Birds and breeze in a quiet forest', url: 'https://cdn.pixabay.com/download/audio/2022/02/12/audio_8ca49a7f20.mp3' },
  { id: '4', title: 'Meditation Bells', artist: 'Zen Studio', category: 'meditation', emoji: '🔔', gradient: 'from-purple-400 to-violet-600', description: 'Tibetan singing bowls for deep calm', url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1bab.mp3' },
  { id: '5', title: 'Soft Piano', artist: 'Calm Keys', category: 'ambient', emoji: '🎹', gradient: 'from-pink-400 to-rose-500', description: 'Gentle piano melodies for relaxation', url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3' },
  { id: '6', title: 'Night Crickets', artist: 'Nature Sounds', category: 'nature', emoji: '🦗', gradient: 'from-indigo-400 to-purple-600', description: 'Peaceful night sounds in nature', url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_8bdd1cd1a8.mp3' },
  { id: '7', title: 'Zen Garden', artist: 'Zen Studio', category: 'meditation', emoji: '🪷', gradient: 'from-teal-400 to-cyan-600', description: 'Tranquil sounds for mindful meditation', url: 'https://cdn.pixabay.com/download/audio/2021/11/01/audio_cb51908d32.mp3' },
  { id: '8', title: 'Cosmic Drift', artist: 'Ambient Space', category: 'ambient', emoji: '🌌', gradient: 'from-amber-400 to-orange-500', description: 'Deep space ambient soundscape', url: 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe92c21.mp3' },
  { id: '9', title: 'Campfire Crackling', artist: 'Nature Sounds', category: 'nature', emoji: '🔥', gradient: 'from-orange-400 to-red-500', description: 'Warm crackling fire on a quiet night', url: 'https://cdn.pixabay.com/download/audio/2022/01/27/audio_d0ef johnsonf7c6.mp3' },
  { id: '10', title: 'Thunderstorm', artist: 'Nature Sounds', category: 'rain', emoji: '⛈️', gradient: 'from-gray-500 to-slate-700', description: 'Distant thunder with steady rainfall', url: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_dc39bde8e6.mp3' },
  { id: '11', title: 'Mountain Stream', artist: 'Nature Sounds', category: 'nature', emoji: '🏔️', gradient: 'from-sky-400 to-blue-600', description: 'Crystal clear stream over smooth rocks', url: 'https://cdn.pixabay.com/download/audio/2022/06/07/audio_aab78e9788.mp3' },
  { id: '12', title: 'Wind Chimes', artist: 'Zen Studio', category: 'meditation', emoji: '🎐', gradient: 'from-yellow-400 to-amber-500', description: 'Gentle wind chimes in a soft breeze', url: 'https://cdn.pixabay.com/download/audio/2022/04/27/audio_a3bac51a9e.mp3' },
  { id: '13', title: 'Lofi Chill', artist: 'Lofi Beats', category: 'ambient', emoji: '🎧', gradient: 'from-violet-400 to-purple-600', description: 'Relaxing lofi hip hop beats', url: 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_946b3855a0.mp3' },
  { id: '14', title: 'Whale Songs', artist: 'Ocean Depths', category: 'meditation', emoji: '🐋', gradient: 'from-blue-500 to-indigo-700', description: 'Soothing whale calls from the deep ocean', url: 'https://cdn.pixabay.com/download/audio/2021/10/25/audio_5fc584b8ea.mp3' },
  { id: '15', title: 'Morning Birds', artist: 'Nature Sounds', category: 'nature', emoji: '🐦', gradient: 'from-lime-400 to-green-500', description: 'Peaceful dawn chorus of birds', url: 'https://cdn.pixabay.com/download/audio/2022/03/17/audio_f49dc5bd4e.mp3' },
  { id: '16', title: 'Soft Guitar', artist: 'Acoustic Dreams', category: 'ambient', emoji: '🎸', gradient: 'from-rose-400 to-pink-600', description: 'Fingerpicked acoustic guitar lullaby', url: 'https://cdn.pixabay.com/download/audio/2022/11/22/audio_febc508520.mp3' },
  { id: '17', title: 'Snowfall Silence', artist: 'Winter Sounds', category: 'ambient', emoji: '❄️', gradient: 'from-blue-200 to-slate-400', description: 'Pure silence of softly falling snow', url: 'https://cdn.pixabay.com/download/audio/2022/12/01/audio_cb16da8148.mp3' },
  { id: '18', title: 'Flute & Nature', artist: 'Zen Studio', category: 'meditation', emoji: '🎵', gradient: 'from-emerald-400 to-teal-600', description: 'Native flute blended with nature sounds', url: 'https://cdn.pixabay.com/download/audio/2022/09/13/audio_29870e4af2.mp3' },
  { id: '19', title: 'Deep Sleep', artist: 'Sleep Lab', category: 'ambient', emoji: '😴', gradient: 'from-slate-500 to-gray-700', description: 'Low frequency tones for deep sleep', url: 'https://cdn.pixabay.com/download/audio/2022/07/04/audio_c8f55b3921.mp3' },
  { id: '20', title: 'Spring Rain', artist: 'Nature Sounds', category: 'rain', emoji: '🌸', gradient: 'from-pink-300 to-purple-400', description: 'Light spring shower with birdsong', url: 'https://cdn.pixabay.com/download/audio/2022/05/13/audio_4e48017d8d.mp3' },
];

const categories = [
  { id: 'all', label: 'All', emoji: '🎵' },
  { id: 'nature', label: 'Nature', emoji: '🌿' },
  { id: 'rain', label: 'Rain', emoji: '🌧️' },
  { id: 'meditation', label: 'Meditation', emoji: '🧘' },
  { id: 'ambient', label: 'Ambient', emoji: '✨' },
];

const RelaxMusic = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [repeat, setRepeat] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const filtered = activeCategory === 'all' ? tracks : tracks.filter(t => t.category === activeCategory);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.loop = true;
    return () => { audioRef.current?.pause(); };
  }, []);

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.pause();
      audioRef.current.src = currentTrack.url;
      audioRef.current.volume = isMuted ? 0 : volume / 100;
      if (isPlaying) audioRef.current.play().catch(console.error);
    }
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.play().catch(console.error);
      else audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume / 100;
  }, [volume, isMuted]);

  const handleTrackClick = (track: Track) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    const idx = tracks.findIndex(t => t.id === currentTrack?.id);
    const next = tracks[(idx + 1) % tracks.length];
    setCurrentTrack(next);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    const idx = tracks.findIndex(t => t.id === currentTrack?.id);
    const prev = tracks[(idx - 1 + tracks.length) % tracks.length];
    setCurrentTrack(prev);
    setIsPlaying(true);
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar userRole="user" onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-8 max-w-6xl">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-serif font-bold text-white mb-2">🎵 Relaxation Music</h1>
          <p className="text-purple-200 text-lg">Soothing sounds to calm your mind and restore balance</p>
        </div>

        {/* Now Playing */}
        {currentTrack && (
          <div className={`bg-gradient-to-r ${currentTrack.gradient} rounded-3xl p-6 mb-8 shadow-2xl`}>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-4xl flex-shrink-0 shadow-lg">
                {currentTrack.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/70 text-xs uppercase tracking-widest font-semibold mb-1">Now Playing</p>
                <h2 className="text-white text-2xl font-bold truncate">{currentTrack.title}</h2>
                <p className="text-white/80 text-sm mt-1">{currentTrack.description}</p>
              </div>
              <div className="flex flex-col items-end gap-3">
                {/* Controls */}
                <div className="flex items-center gap-3">
                  <button onClick={handlePrev} className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all">
                    <SkipBack className="w-4 h-4" />
                  </button>
                  <button onClick={() => setIsPlaying(!isPlaying)}
                    className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-105 transition-all">
                    {isPlaying
                      ? <Pause className="w-6 h-6 text-gray-800" />
                      : <Play className="w-6 h-6 text-gray-800 ml-1" />}
                  </button>
                  <button onClick={handleNext} className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all">
                    <SkipForward className="w-4 h-4" />
                  </button>
                  <button onClick={() => setRepeat(!repeat)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all ${repeat ? 'bg-white/40' : 'bg-white/20 hover:bg-white/30'}`}>
                    <Repeat className="w-4 h-4" />
                  </button>
                </div>
                {/* Volume */}
                <div className="flex items-center gap-2">
                  <button onClick={() => setIsMuted(!isMuted)} className="text-white/80 hover:text-white">
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input type="range" min="0" max="100" value={isMuted ? 0 : volume}
                    onChange={e => { setVolume(Number(e.target.value)); setIsMuted(false); }}
                    className="w-28 accent-white" />
                  <span className="text-white/70 text-xs w-8">{isMuted ? 0 : volume}%</span>
                </div>
              </div>
            </div>
            {/* Animated bars */}
            {isPlaying && (
              <div className="flex items-end gap-1 mt-4 h-8">
                {[...Array(24)].map((_, i) => (
                  <div key={i} className="bg-white/40 rounded-full w-1.5 animate-pulse"
                    style={{ height: `${20 + Math.random() * 60}%`, animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Category Filter */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-purple-500 text-white shadow-lg scale-105'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}>
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* Track Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(track => (
            <div key={track.id}
              className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-105 hover:shadow-2xl ${
                currentTrack?.id === track.id ? 'ring-2 ring-white shadow-2xl scale-105' : ''
              }`}
              onClick={() => handleTrackClick(track)}>
              <div className={`bg-gradient-to-br ${track.gradient} p-5`}>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{track.emoji}</span>
                  <div className="flex gap-2">
                    <button onClick={e => { e.stopPropagation(); toggleFavorite(track.id); }}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        favorites.includes(track.id) ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
                      }`}>
                      <Heart className="w-3 h-3" fill={favorites.includes(track.id) ? 'white' : 'none'} />
                    </button>
                    {currentTrack?.id === track.id && isPlaying && (
                      <div className="flex items-end gap-0.5 h-7 px-2 bg-white/20 rounded-full">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="bg-white w-0.5 rounded-full animate-bounce"
                            style={{ height: '60%', animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <h3 className="text-white font-bold text-sm leading-tight">{track.title}</h3>
                <p className="text-white/70 text-xs mt-1">{track.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-white/60 text-xs capitalize">{track.category}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentTrack?.id === track.id && isPlaying ? 'bg-white' : 'bg-white/30'
                  }`}>
                    {currentTrack?.id === track.id && isPlaying
                      ? <Pause className="w-3 h-3 text-gray-800" />
                      : <Play className="w-3 h-3 text-white ml-0.5" />}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer tip */}
        <p className="text-center text-white/40 text-xs mt-8">
          🎧 Use headphones for the best relaxation experience · All sounds loop continuously
        </p>
      </main>
    </div>
  );
};

export default RelaxMusic;
