import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Maximize, 
  Film, 
  RotateCcw,
  Sparkles
} from 'lucide-react';


const VIDEO_URL = '';

export const HoodieVideoShowcase: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(Boolean(VIDEO_URL));
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // ضمان كتم الصوت نهائياً وتشغيل الفيديو تلقائياً عند وجود رابط
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.volume = 0;
      if (VIDEO_URL) {
        videoRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          setIsPlaying(false);
        });
      }
    }
  }, []);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleTogglePlay = () => {
    if (!videoRef.current || !VIDEO_URL) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.log('Video play caught:', err);
      });
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = Math.max(0, Math.min(duration, (clickX / rect.width) * duration));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleRestart = () => {
    if (!videoRef.current || !VIDEO_URL) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="relative w-full max-w-5xl mx-auto my-4">
      {/* إضاءة خلفية احترافية حول الفريم */}
      <div className="absolute -inset-1.5 bg-gradient-to-r from-sky-500/20 via-indigo-500/15 to-amber-500/20 rounded-[28px] blur-xl pointer-events-none" />

      <div
        ref={containerRef}
        className="relative w-full rounded-3xl bg-gradient-to-b from-[#1E293B] to-[#0B1120] border border-slate-700/90 p-3 sm:p-4 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.75)] overflow-hidden group"
      >
        {/* الشريط العلوي للفريم */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/95 backdrop-blur-md rounded-2xl mb-3 border border-slate-800/90">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <Film className="w-4 h-4 text-[#38BDF8]" />
            <span className="text-xs sm:text-sm font-mono font-bold tracking-wider text-slate-100 uppercase">
              OFFICIAL VIDEO SHOWCASE
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] sm:text-xs font-mono font-semibold bg-sky-500/15 text-[#38BDF8] border border-sky-500/30 px-2.5 py-0.5 rounded-md">
              DTF 4K
            </span>
            <span className="text-[11px] sm:text-xs font-mono font-semibold bg-amber-500/15 text-[#F59E0B] border border-amber-500/30 px-2.5 py-0.5 rounded-md">
              IS CLASS '27
            </span>
          </div>
        </div>

        {/* شاشة عرض الفيديو الكبيرة */}
        <div className="relative aspect-video min-h-[280px] sm:min-h-[380px] lg:min-h-[440px] w-full rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center select-none border border-slate-800">
          <video
            ref={videoRef}
            className="w-full h-full object-cover cursor-pointer"
            playsInline
            muted
            autoPlay
            loop
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onClick={handleTogglePlay}
          >
            {VIDEO_URL ? <source src={VIDEO_URL} type="video/mp4" /> : null}
            متصفحك لا يدعم تشغيل الفيديو.
          </video>

          {/* شاشة العرض الافتراضية في حالة عدم وضع رابط فيديو في الكود بعد */}
          {!VIDEO_URL && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-black">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-sky-500/10 border border-sky-500/30 text-[#38BDF8] flex items-center justify-center mb-5 shadow-2xl shadow-sky-500/10">
                <Film className="w-10 h-10 sm:w-12 sm:h-12 text-[#38BDF8]" />
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-xs sm:text-sm font-semibold text-slate-200 mb-3">
                <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                <span>فيديو استعراض هودي تخرج نظم المعلومات 2027</span>
              </div>

              <h4 className="text-lg sm:text-2xl font-extrabold text-white mb-2">
                مساحة العرض السينمائي المعتمدة
              </h4>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
                لإضافة الفيديو، ضع مسار الملف داخل المتغير <code className="text-[#38BDF8] font-mono bg-slate-900 px-1.5 py-0.5 rounded">VIDEO_URL</code> في أعلى ملف الكود ليتم تشغيله تلقائياً بدون صوت.
              </p>
            </div>
          )}

          {/* تدرج إضاءة سينمائي خفيف */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/15 pointer-events-none" />

          {/* زر التشغيل الكبير في المنتصف عند الإيقاف المؤقت */}
          {VIDEO_URL && !isPlaying && (
            <button
              type="button"
              onClick={handleTogglePlay}
              className="absolute inset-0 m-auto w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-[#38BDF8]/95 text-slate-950 flex items-center justify-center shadow-2xl shadow-sky-500/30 hover:scale-110 transition-transform cursor-pointer"
              title="تشغيل الفيديو"
            >
              <Play className="w-9 h-9 fill-current ml-1" />
            </button>
          )}
        </div>

        {/* شريط التحكم السفلي (بدون صوت وبدون زر رفع) */}
        <div className="flex items-center justify-between px-4 py-3 mt-3 bg-slate-900/90 backdrop-blur-md rounded-2xl text-xs text-slate-300 border border-slate-800/90">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={handleTogglePlay}
              disabled={!VIDEO_URL}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors flex items-center justify-center disabled:opacity-40 cursor-pointer"
              title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            <button
              type="button"
              onClick={handleRestart}
              disabled={!VIDEO_URL}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-40 cursor-pointer"
              title="إعادة التشغيل من البداية"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <span className="font-mono text-xs text-slate-400">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* شريط التقدم التفاعلي */}
          <div
            onClick={handleProgressClick}
            dir="ltr"
            className="flex-1 mx-4 max-w-md hidden sm:block cursor-pointer py-2"
          >
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#38BDF8] to-[#F59E0B] h-full rounded-full transition-all duration-150"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleFullscreen}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="ملء الشاشة"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};