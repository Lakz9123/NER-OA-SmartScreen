import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
import { X, Activity, Scan, AlertTriangle, RefreshCw, Info } from 'lucide-react';
import { KinematicsTracker } from '../utils/kinematics';
import { detectSteps } from '../utils/stepDetection';
import type { Landmark } from '../utils/types';
import { assessCaptureQuality } from '../capture/quality';
import { captureConfig } from '../config/captureConfig';

export default function CaptureTracking() {
  const navigate = useNavigate();
  const location = useLocation();
  const { patientId, answers } = location.state || { patientId: 'demo', answers: {} };

  const isDebug = new URLSearchParams(location.search).get('debug') === '1' || localStorage.getItem('devMode') === 'true';

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isInitializing, setIsInitializing] = useState(true);
  
  // States: 'idle' -> 'countdown' -> 'recording' -> 'processing'
  const [captureState, setCaptureState] = useState<'idle' | 'countdown' | 'recording' | 'processing'>('idle');
  const [countdown, setCountdown] = useState(captureConfig.COUNTDOWN_DURATION_SEC);
  const [timeRemaining, setTimeRemaining] = useState(captureConfig.RECORDING_DURATION_MS / 1000);
  
  const [modelError, setModelError] = useState('');
  const [retryTrigger, setRetryTrigger] = useState(0);

  const trackerRef = useRef<KinematicsTracker>(new KinematicsTracker());
  const captureStateRef = useRef(captureState);
  
  // Live status for HUD (synced to state periodically to avoid 30fps re-renders)
  const liveStatusRef = useRef({
    anklesVisible: false,
    kneesVisible: false,
    outOfBounds: false,
    hipsVisible: false,
  });
  const [uiStatus, setUiStatus] = useState({
    anklesVisible: false,
    kneesVisible: false,
    outOfBounds: false,
    hipsVisible: false,
  });

  useEffect(() => {
    captureStateRef.current = captureState;
  }, [captureState]);

  // Periodic UI update loop for live status
  useEffect(() => {
    const interval = setInterval(() => {
      setUiStatus({ ...liveStatusRef.current });
    }, 250);
    return () => clearInterval(interval);
  }, []);

  // Setup Camera and MediaPipe
  useEffect(() => {
    let poseLandmarker: PoseLandmarker | null = null;
    let animationFrameId: number;

    const initializeAI = async () => {
      try {
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: { ideal: 'environment' }, width: { ideal: 640 }, height: { ideal: 480 } } 
          });
        } catch (camErr) {
          console.warn("Could not get environment camera, falling back to default:", camErr);
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

        let lastFrameTime = 0;
        const TARGET_FPS = 15;
        const frameInterval = 1000 / TARGET_FPS;

        const renderLoop = async (timestamp: number) => {
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
                  const frame = results.landmarks[0] as unknown as Landmark[];
                  const drawingUtils = new DrawingUtils(ctx);
                  drawingUtils.drawConnectors(frame as any, PoseLandmarker.POSE_CONNECTIONS, { color: '#2dd4bf', lineWidth: 4 });
                  drawingUtils.drawLandmarks(frame as any, { color: '#14b8a6', radius: 4, fillColor: '#ccfbf1', lineWidth: 2 });
                  
                  if (captureStateRef.current === 'recording') {
                    trackerRef.current.addFrame(frame, startTimeMs);
                  }

                  // Update live status for hints
                  const minVis = captureConfig.MIN_LANDMARK_VISIBILITY;
                  const lHip = frame[23]; const rHip = frame[24];
                  const lKnee = frame[25]; const rKnee = frame[26];
                  const lAnkle = frame[27]; const rAnkle = frame[28];
                  const lShoulder = frame[11]; const rShoulder = frame[12];

                  liveStatusRef.current = {
                    hipsVisible: lHip.visibility > minVis && rHip.visibility > minVis,
                    kneesVisible: lKnee.visibility > minVis && rKnee.visibility > minVis,
                    anklesVisible: lAnkle.visibility > minVis && rAnkle.visibility > minVis,
                    outOfBounds: [lShoulder, rShoulder, lHip, rHip, lKnee, rKnee, lAnkle, rAnkle].some(
                      l => l.visibility > minVis && (l.x < 0.0 || l.x > 1.0 || l.y < 0.0 || l.y > 1.0)
                    )
                  };
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

  const handleStartCaptureFlow = () => {
    setCaptureState('countdown');
    setCountdown(captureConfig.COUNTDOWN_DURATION_SEC);
    
    // Countdown phase
    let currentCountdown = captureConfig.COUNTDOWN_DURATION_SEC;
    const countdownInterval = setInterval(() => {
      currentCountdown -= 1;
      setCountdown(currentCountdown);
      if (currentCountdown <= 0) {
        clearInterval(countdownInterval);
        startRecording();
      }
    }, 1000);
  };

  const startRecording = () => {
    setCaptureState('recording');
    trackerRef.current = new KinematicsTracker(); 
    
    const durationMs = captureConfig.RECORDING_DURATION_MS;
    setTimeRemaining(durationMs / 1000);
    const startMs = performance.now();

    const recordingInterval = setInterval(() => {
      const elapsed = performance.now() - startMs;
      const remaining = Math.max(0, (durationMs - elapsed) / 1000);
      setTimeRemaining(Math.ceil(remaining));

      if (elapsed >= durationMs) {
        clearInterval(recordingInterval);
        finishRecording();
      }
    }, 250);
  };

  const finishRecording = () => {
    setCaptureState('processing');
    
    // Evaluate quality before proceeding
    const quality = assessCaptureQuality(trackerRef.current.rawFrames, trackerRef.current.timestamps);
    
    if (!quality.is_good) {
      navigate('/capture/recapture', { state: { patientId, answers, reason: quality.reason } });
    } else {
      const telemetryData = { ...trackerRef.current.getMetrics(), quality_score: quality.score };
      navigate('/capture/review', { state: { patientId, answers, telemetryData } });
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  // Compute live warnings based on uiStatus
  const showMoveBack = uiStatus.outOfBounds;
  const showLegsCutOff = !uiStatus.anklesVisible || !uiStatus.kneesVisible;

  // Debug Data
  let debugScore = 0;
  let debugMetrics: any = {};
  let debugCadence = 0;
  if (isDebug && captureState === 'recording' && trackerRef.current.rawFrames.length > 0) {
    const q = assessCaptureQuality(trackerRef.current.rawFrames, trackerRef.current.timestamps);
    debugScore = q.score;
    debugMetrics = q.metrics;
    
    // Compute current cadence directly for debug display if possible, or extract from detectSteps if needed
    // detectSteps is used inside assessCaptureQuality. Since metrics doesn't export cadence, let's just 
    // re-run detectSteps for debug UI (it's cheap).
    const { cadence } = detectSteps(trackerRef.current.rawFrames, trackerRef.current.timestamps);
    debugCadence = cadence;
  }

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
            <div className={`w-2 h-2 rounded-full mr-2 ${captureState === 'recording' ? 'bg-rose-500 animate-pulse' : 'bg-slate-500'}`}></div>
            <span className="font-mono text-sm tracking-wider">
              {captureState === 'idle' ? 'STANDBY' : captureState === 'countdown' ? 'PREPARING' : captureState === 'recording' ? 'RECORDING' : 'PROCESSING'}
            </span>
          </div>
          
          {captureState === 'recording' && (
            <div className="bg-slate-900/50 backdrop-blur-md p-3 rounded-xl border border-teal-500/30 w-32 flex flex-col items-center">
              <Activity className="h-5 w-5 text-teal-400 mb-1" />
              <span className="font-mono text-teal-400 text-xs">Time Left</span>
              <span className="font-mono text-white text-lg font-bold">{timeRemaining}s</span>
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
            
            {/* Rule of Thirds Grid */}
            <div className="absolute top-1/3 left-0 w-full h-[1px] bg-white/10"></div>
            <div className="absolute top-2/3 left-0 w-full h-[1px] bg-white/10"></div>
            <div className="absolute top-0 left-1/3 w-[1px] h-full bg-white/10"></div>
            <div className="absolute top-0 left-2/3 w-[1px] h-full bg-white/10"></div>
          </div>
        </div>

        {/* Countdown Overlay */}
        {captureState === 'countdown' && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <span className="text-white text-9xl font-black font-mono animate-ping">{countdown}</span>
          </div>
        )}

        {/* Live Warnings Overlay */}
        {(captureState === 'idle' || captureState === 'recording') && !isInitializing && (
          <div className="absolute bottom-10 left-0 w-full flex flex-col items-center space-y-2 z-20 pointer-events-none">
            {showMoveBack && (
              <div className="bg-rose-600/90 text-white px-6 py-2 rounded-full font-bold shadow-lg animate-pulse">
                Move Back! (Subject out of frame)
              </div>
            )}
            {showLegsCutOff && (
              <div className="bg-amber-600/90 text-white px-6 py-2 rounded-full font-bold shadow-lg">
                Legs cut off!
              </div>
            )}
            {!showMoveBack && !showLegsCutOff && uiStatus.hipsVisible && (
              <div className="bg-teal-600/80 text-white px-6 py-2 rounded-full font-bold shadow-lg">
                Subject in Frame
              </div>
            )}
          </div>
        )}

        {/* Debug Overlay */}
        {isDebug && captureState === 'recording' && (
          <div className="absolute top-24 left-6 bg-black/70 border border-teal-500/50 p-4 rounded-xl text-teal-300 font-mono text-xs z-30 pointer-events-none space-y-1">
            <div className="flex items-center text-teal-400 font-bold mb-2 text-sm"><Info className="h-4 w-4 mr-1"/> Debug Mode</div>
            <p>Score: {debugScore}/100</p>
            <p>Steps: {debugMetrics.stepCount || 0}</p>
            <p>Cadence: {debugCadence.toFixed(1)} SPM</p>
            <p className={`font-bold ${debugCadence >= 30 && debugCadence <= 200 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {debugCadence === 0 ? 'WAITING' : (debugCadence >= 30 && debugCadence <= 200 ? 'VALID WALK' : 'INVALID WALK')}
            </p>
            <p>Frames: {debugMetrics.frameCount || 0}</p>
            <p>Ankles Vis: {(debugMetrics.anklesVisible * 100 || 0).toFixed(1)}%</p>
            <p>Knees Vis: {(debugMetrics.kneesVisible * 100 || 0).toFixed(1)}%</p>
            <p>In Frame: {debugMetrics.wholeBodyInFrame ? 'YES' : 'NO'}</p>
          </div>
        )}

      </div>

      {/* Bottom Controls */}
      <div className="bg-slate-950 p-8 flex flex-col items-center justify-center border-t border-slate-900 z-20 h-40">
        {captureState === 'idle' ? (
          <button 
            onClick={handleStartCaptureFlow}
            disabled={isInitializing || !!modelError}
            className="group relative flex items-center justify-center w-20 h-20 bg-transparent border-4 border-white rounded-full hover:border-teal-400 transition-colors disabled:opacity-50"
          >
            <div className="w-14 h-14 bg-white rounded-full group-hover:bg-teal-400 transition-colors group-hover:scale-90"></div>
          </button>
        ) : (
          <div className="w-full max-w-md text-center">
            <p className="text-teal-400 font-mono font-bold animate-pulse">
              {captureState === 'countdown' ? 'PREPARING...' : captureState === 'processing' ? 'PROCESSING DATA...' : 'RECORDING...'}
            </p>
          </div>
        )}
        <p className="text-slate-500 text-sm mt-6 font-medium text-center">
          {captureState === 'idle' ? 'Ask patient to walk. Tap to begin countdown.' : 'Patient should walk side-to-side across the screen.'}
        </p>
      </div>

    </div>
  );
}
