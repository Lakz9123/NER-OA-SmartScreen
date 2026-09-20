import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
import { X, Activity, Scan, AlertTriangle, RefreshCw } from 'lucide-react';
import { KinematicsTracker } from '../utils/kinematics';
import type { Landmark } from '../utils/kinematics';
import { assessCaptureQuality } from '../capture/quality';

export default function CaptureTracking() {
  const navigate = useNavigate();
  const location = useLocation();
  const { patientId, answers } = location.state || { patientId: 'demo', answers: {} };

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isInitializing, setIsInitializing] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [modelError, setModelError] = useState('');
  const [retryTrigger, setRetryTrigger] = useState(0);

  const trackerRef = useRef<KinematicsTracker>(new KinematicsTracker());
  const isRecordingRef = useRef(false);

  // Setup Camera and MediaPipe
  useEffect(() => {
    let poseLandmarker: PoseLandmarker | null = null;
    let animationFrameId: number;

    const initializeAI = async () => {
      try {
        let stream: MediaStream;
        try {
          // Try to get environment camera first (rear camera) - Lower resolution for performance
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: { ideal: 'environment' }, width: { ideal: 640 }, height: { ideal: 480 } } 
          });
        } catch (camErr) {
          console.warn("Could not get environment camera, falling back to default:", camErr);
          // Fallback to any available camera
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        }
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try {
            await videoRef.current.play();
          } catch (playErr) {
            console.warn("Video play interrupted, likely by StrictMode", playErr);
          }
        }

        const vision = await FilesetResolver.forVisionTasks("/mediapipe/wasm");

        let poseLandmarkerConfig: any = {
          baseOptions: {
            modelAssetPath: "/mediapipe/pose_landmarker_lite.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numPoses: 1
        };

        try {
          poseLandmarker = await PoseLandmarker.createFromOptions(vision, poseLandmarkerConfig);
        } catch (gpuError) {
          console.warn("GPU delegate failed, falling back to CPU", gpuError);
          poseLandmarkerConfig.baseOptions.delegate = "CPU";
          poseLandmarker = await PoseLandmarker.createFromOptions(vision, poseLandmarkerConfig);
        }

        setModelError('');
        setIsInitializing(false);

        // Rendering loop with FPS throttling for mobile performance
        let lastFrameTime = 0;
        const TARGET_FPS = 15;
        const frameInterval = 1000 / TARGET_FPS;

        const renderLoop = async (timestamp: number) => {
          // Throttle FPS to prevent UI blocking on mobile
          if (timestamp - lastFrameTime < frameInterval) {
            animationFrameId = requestAnimationFrame(renderLoop);
            return;
          }
          lastFrameTime = timestamp;

          if (videoRef.current && canvasRef.current && poseLandmarker) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            
            if (video.videoWidth > 0 && video.videoHeight > 0) {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              
              if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                let startTimeMs = performance.now();
                const results = poseLandmarker.detectForVideo(video, startTimeMs);
                
                if (results.landmarks && results.landmarks.length > 0) {
                  const drawingUtils = new DrawingUtils(ctx);
                  for (const landmark of results.landmarks) {
                    drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS, { color: '#2dd4bf', lineWidth: 4 });
                    drawingUtils.drawLandmarks(landmark, { color: '#14b8a6', radius: 4, fillColor: '#ccfbf1', lineWidth: 2 });
                  }
                  
                  if (isRecordingRef.current) {
                    trackerRef.current.addFrame(results.landmarks[0] as unknown as Landmark[], performance.now());
                  }
                }
              }
            }
          }
          animationFrameId = requestAnimationFrame(renderLoop);
        };
        
        renderLoop(performance.now());
        
      } catch (err: any) {
        console.error(err);
        setModelError(err.message || "Failed to initialize camera or AI model.");
        setIsInitializing(false);
      }
    };

    initializeAI();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (poseLandmarker) poseLandmarker.close();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [retryTrigger]);

  const handleStartRecording = () => {
    setIsRecording(true);
    isRecordingRef.current = true;
    trackerRef.current = new KinematicsTracker(); // Reset tracker
    let currentProgress = 0;
    
    // Simulate a 5-second capture
    const interval = setInterval(() => {
      currentProgress += 5; // 20 ticks of 250ms = 5000ms
      setProgress(currentProgress);
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        isRecordingRef.current = false;

        // Evaluate quality before proceeding
        const quality = assessCaptureQuality(trackerRef.current.rawFrames);
        
        if (!quality.is_good) {
          navigate('/capture/recapture', { state: { patientId, answers, reason: quality.reason } });
        } else {
          // Send real telemetry data and quality score to next screen
          const telemetryData = { ...trackerRef.current.getMetrics(), quality_score: quality.score };
          navigate('/capture/review', { state: { patientId, answers, telemetryData } });
        }
      }
    }, 250);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="h-screen bg-black flex flex-col font-sans overflow-hidden relative">
      
      {/* Top HUD */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col space-y-2 pointer-events-auto">
          <button onClick={handleCancel} className="bg-slate-900/50 backdrop-blur-md p-3 rounded-full text-white hover:bg-rose-500/80 transition-colors border border-white/10">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex flex-col items-end space-y-3 pointer-events-auto">
          <div className="bg-slate-900/50 backdrop-blur-md px-4 py-2 rounded-xl text-white border border-white/10 flex items-center shadow-lg">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse mr-2"></div>
            <span className="font-mono text-sm tracking-wider">{isRecording ? 'CAPTURING' : 'STANDBY'}</span>
          </div>
          
          {isRecording && (
            <div className="bg-slate-900/50 backdrop-blur-md p-3 rounded-xl border border-teal-500/30 w-32 flex flex-col items-center">
              <Activity className="h-5 w-5 text-teal-400 mb-1" />
              <span className="font-mono text-teal-400 text-xs">Tracking</span>
              <span className="font-mono text-white text-lg font-bold">{progress}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Viewfinder */}
      <div className="flex-1 relative flex items-center justify-center bg-slate-900">
        
        {isInitializing && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm">
            <Scan className="h-16 w-16 text-teal-500 animate-pulse-glow mb-4" />
            <p className="text-teal-400 font-mono tracking-widest text-sm">LOADING EDGE AI MODEL...</p>
          </div>
        )}

        {modelError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/90 p-6 text-center">
            <AlertTriangle className="h-16 w-16 text-rose-500 mb-4" />
            <p className="text-white font-bold text-lg mb-2">System Error</p>
            <p className="text-slate-400 max-w-md mb-6">{modelError}</p>
            <button 
              onClick={() => { setModelError(''); setIsInitializing(true); setRetryTrigger(prev => prev + 1); }}
              className="flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Retry Connection
            </button>
          </div>
        )}

        {/* Video & Canvas Stack */}
        <div className="relative w-full h-full max-h-full aspect-video md:aspect-auto overflow-hidden">
          <video 
            ref={videoRef} 
            className="absolute inset-0 w-full h-full object-cover" 
            playsInline muted 
          />
          <canvas 
            ref={canvasRef} 
            className="absolute inset-0 w-full h-full object-cover pointer-events-none" 
          />
          
          {/* Cyberpunk Scanning Grid Overlay */}
          <div className="absolute inset-0 pointer-events-none border-[1px] border-teal-500/20 shadow-[inset_0_0_100px_rgba(13,148,136,0.2)]">
            {/* Corner Brackets */}
            <div className="absolute top-8 left-8 w-16 h-16 border-t-4 border-l-4 border-teal-500/70 rounded-tl-xl"></div>
            <div className="absolute top-8 right-8 w-16 h-16 border-t-4 border-r-4 border-teal-500/70 rounded-tr-xl"></div>
            <div className="absolute bottom-8 left-8 w-16 h-16 border-b-4 border-l-4 border-teal-500/70 rounded-bl-xl"></div>
            <div className="absolute bottom-8 right-8 w-16 h-16 border-b-4 border-r-4 border-teal-500/70 rounded-br-xl"></div>
            
            {/* Scanning Laser */}
            {isRecording && (
              <div className="absolute top-0 left-0 w-full h-1 bg-teal-400 shadow-[0_0_15px_rgba(45,212,191,1)] animate-[laser-scan_2s_linear_infinite]"></div>
            )}
            
            {/* Rule of Thirds Grid */}
            <div className="absolute top-1/3 left-0 w-full h-[1px] bg-white/10"></div>
            <div className="absolute top-2/3 left-0 w-full h-[1px] bg-white/10"></div>
            <div className="absolute top-0 left-1/3 w-[1px] h-full bg-white/10"></div>
            <div className="absolute top-0 left-2/3 w-[1px] h-full bg-white/10"></div>
          </div>
        </div>

      </div>

      {/* Bottom Controls */}
      <div className="bg-slate-950 p-8 flex flex-col items-center justify-center border-t border-slate-900 z-20">
        {!isRecording ? (
          <button 
            onClick={handleStartRecording}
            disabled={isInitializing || !!modelError}
            className="group relative flex items-center justify-center w-20 h-20 bg-transparent border-4 border-white rounded-full hover:border-teal-400 transition-colors disabled:opacity-50"
          >
            <div className="w-14 h-14 bg-white rounded-full group-hover:bg-teal-400 transition-colors group-hover:scale-90"></div>
          </button>
        ) : (
          <div className="w-full max-w-md">
            <div className="flex justify-between text-teal-400 font-mono text-xs mb-2">
              <span>EXTRACTING KINEMATICS...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div 
                className="h-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.8)] transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
        <p className="text-slate-500 text-sm mt-6 font-medium">
          {!isRecording ? 'Ask the patient to walk back and forth. Tap to capture.' : 'Patient is walking... Keep device steady.'}
        </p>
      </div>

    </div>
  );
}
