import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import confetti from 'canvas-confetti';
import { 
  QrCode, 
  Camera, 
  CameraOff, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  RotateCcw, 
  Upload, 
  Search, 
  ArrowRight, 
  Check, 
  User, 
  Calendar, 
  MapPin, 
  Ticket, 
  Clock,
  Sparkles,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { eventService } from '../../services/eventService';
import { useAuth } from '../../context/AuthContext';
import { cardStyle, inputStyle, labelStyle, headingStyle, subTextStyle } from '../../styles/pageStyles';

export default function QRScanner() {
  const { user } = useAuth();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const animFrameId = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [processing, setProcessing] = useState(false);
  const [scanResult, setScanResult] = useState(null); // { valid, message, already_checked_in, registration }
  const [recentScans, setRecentScans] = useState([]);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (back) or 'user' (front)
  const [stream, setStream] = useState(null);

  // Play synthesized audio chime for quick audio confirmation
  const playSound = (type = 'success') => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else if (type === 'warning') {
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.setValueAtTime(370, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        osc.frequency.setValueAtTime(150, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      }
    } catch {
      // AudioContext not allowed or not supported; ignore gracefully
    }
  };

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError('Unable to access camera. Please check permissions or type the Pass Code manually below.');
      setCameraActive(false);
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
    }
    setCameraActive(false);
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  // Video Frame Scanning Loop with jsQR
  useEffect(() => {
    if (!cameraActive) return;

    const scanFrame = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data && !processing) {
            handleVerifyPass(code.data);
            return; // Pause scanning while processing
          }
        }
      }
      animFrameId.current = requestAnimationFrame(scanFrame);
    };

    animFrameId.current = requestAnimationFrame(scanFrame);
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [cameraActive, processing]);

  // Handle Verification and Check-in
  const handleVerifyPass = async (rawCode, action = 'check_in') => {
    if (!rawCode || processing) return;
    setProcessing(true);
    setCameraError(null);

    // Extract token if code was an encoded URL or raw EVTHUB-XXX string
    let token = String(rawCode).trim();
    if (token.includes('token=')) {
      token = token.split('token=')[1].split('&')[0];
    } else if (token.includes('/pass/')) {
      token = token.split('/pass/')[1].split('?')[0];
    }

    try {
      const res = await eventService.checkInPass(token, action);
      setScanResult(res);

      if (res.valid && !res.already_checked_in && action === 'check_in') {
        playSound('success');
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } else if (res.already_checked_in) {
        playSound('warning');
      } else {
        playSound('error');
      }

      // Add to recent scans list
      setRecentScans(prev => [
        {
          id: Date.now(),
          token,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          attendee_name: res.registration?.attendee_name || 'Attendee',
          event_title: res.registration?.event_title || 'Event',
          status: res.already_checked_in ? 'Already Scanned' : (res.valid ? 'Checked In' : 'Denied'),
          color: res.already_checked_in ? 'amber' : (res.valid ? 'emerald' : 'rose')
        },
        ...prev.slice(0, 9)
      ]);
    } catch (err) {
      playSound('error');
      const errorMsg = err.message || 'Pass not found or invalid.';
      setScanResult({
        valid: false,
        message: `❌ ${errorMsg}`,
        registration: null
      });
      setRecentScans(prev => [
        {
          id: Date.now(),
          token,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          attendee_name: 'Unknown',
          event_title: 'N/A',
          status: 'Invalid / Error',
          color: 'rose'
        },
        ...prev.slice(0, 9)
      ]);
    } finally {
      setProcessing(false);
    }
  };

  // Image Upload Decoding
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code && code.data) {
          handleVerifyPass(code.data);
        } else {
          alert('Could not detect a QR Code in this image. Please ensure the QR code is clearly visible.');
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleVerifyPass(manualCode.trim());
      setManualCode('');
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    if (!cameraActive) {
      startCamera();
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role={user?.role || 'organizer'} />

      <main className="dashboard-main min-h-screen pb-16 bg-slate-50 dark:bg-slate-950">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-purple-600/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
                <QrCode className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Attendee QR Scanner & Check-in
              </h1>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Scan attendee ticket QR codes or enter pass codes to verify entry in real time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors shadow-sm"
              title="Flip Camera"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Flip Camera
            </button>

            <button
              onClick={cameraActive ? stopCamera : startCamera}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg text-white shadow-sm transition-all ${
                cameraActive 
                  ? 'bg-rose-600 hover:bg-rose-700' 
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {cameraActive ? (
                <>
                  <CameraOff className="w-3.5 h-3.5" /> Stop Camera
                </>
              ) : (
                <>
                  <Camera className="w-3.5 h-3.5" /> Start Camera
                </>
              )}
            </button>
          </div>
        </div>

        {/* Hidden Canvas for QR Extraction */}
        <canvas ref={canvasRef} className="hidden" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Camera Viewport & Result Card */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Camera Viewport Container */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl aspect-[4/3] flex items-center justify-center">
              
              {/* Live Video Feed */}
              <video
                ref={videoRef}
                className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                autoPlay
                playsInline
                muted
              />

              {/* Inactive State Screen */}
              {!cameraActive && (
                <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center mb-3 text-slate-500">
                    <CameraOff className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">Camera Inactive</h3>
                  <p className="text-xs text-slate-400 max-w-xs mb-4">
                    {cameraError || 'Click below to turn on the camera or type the pass code manually.'}
                  </p>
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition shadow-lg"
                  >
                    Activate Camera
                  </button>
                </div>
              )}

              {/* Scanning Overlay (Target Box + Scanning Laser) */}
              {cameraActive && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                  {/* Dark Vignette Frame */}
                  <div className="relative w-64 h-64 sm:w-72 sm:h-72 border-2 border-dashed border-purple-400/80 rounded-2xl shadow-[0_0_0_9999px_rgba(15,23,42,0.45)] flex items-center justify-center overflow-hidden">
                    
                    {/* Corner Target Markers */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-purple-500 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-purple-500 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-purple-500 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-purple-500 rounded-br-lg" />

                    {/* Animated Scanning Laser Line */}
                    <div 
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent shadow-[0_0_12px_#a855f7]"
                      style={{
                        animation: 'scannerLaser 2.2s ease-in-out infinite alternate'
                      }}
                    />

                    {/* Center Crosshair */}
                    <div className="w-2 h-2 rounded-full bg-purple-400/80" />
                  </div>

                  <p className="text-xs font-medium text-white/90 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full mt-4 shadow-md">
                    Position attendee QR Code within the frame
                  </p>
                </div>
              )}

              {/* Loading Indicator when Processing Scan */}
              {processing && (
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center text-white z-20">
                  <RefreshCw className="w-10 h-10 text-purple-400 animate-spin mb-3" />
                  <p className="text-sm font-bold tracking-wide">Validating Pass with Database...</p>
                </div>
              )}
            </div>

            {/* Verification Result Banner / Card */}
            {scanResult && (
              <div className={`p-6 rounded-2xl border shadow-xl transition-all duration-300 ${
                scanResult.valid && !scanResult.already_checked_in
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                  : scanResult.already_checked_in
                  ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-500/30 text-amber-900 dark:text-amber-200'
                  : 'bg-rose-50 dark:bg-rose-950/30 border-rose-500/30 text-rose-900 dark:text-rose-200'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className={`p-2.5 rounded-xl ${
                      scanResult.valid && !scanResult.already_checked_in
                        ? 'bg-emerald-600 text-white'
                        : scanResult.already_checked_in
                        ? 'bg-amber-600 text-white'
                        : 'bg-rose-600 text-white'
                    }`}>
                      {scanResult.valid && !scanResult.already_checked_in ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : scanResult.already_checked_in ? (
                        <AlertCircle className="w-6 h-6" />
                      ) : (
                        <XCircle className="w-6 h-6" />
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-bold tracking-tight">
                        {scanResult.message}
                      </h3>
                      {scanResult.already_checked_in && (
                        <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mt-0.5">
                          First checked in at: {scanResult.checked_in_at}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={resetScanner}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-white/80 dark:bg-slate-900/80 border border-current shadow-sm hover:opacity-80 transition"
                  >
                    Scan Next
                  </button>
                </div>

                {/* Attendee Details Card if Registration Found */}
                {scanResult.registration && (
                  <div className="mt-5 pt-5 border-t border-current/15 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 opacity-70" />
                      <div>
                        <span className="opacity-60 block">Attendee Name</span>
                        <span className="font-bold text-sm">
                          {scanResult.registration.attendee_name || 'Anonymous Guest'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 opacity-70" />
                      <div>
                        <span className="opacity-60 block">Pass Code</span>
                        <span className="font-mono font-bold text-sm tracking-wider">
                          {scanResult.registration.qr_code_token}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 opacity-70" />
                      <div>
                        <span className="opacity-60 block">Event</span>
                        <span className="font-bold text-sm">
                          {scanResult.registration.event_title}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 opacity-70" />
                      <div>
                        <span className="opacity-60 block">Quantity / Seats</span>
                        <span className="font-bold text-sm">
                          {scanResult.registration.quantity || 1} Ticket(s)
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Manual Code Entry & Recent Scans */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Manual Code Input Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                <Search className="w-4 h-4 text-purple-600" />
                Manual Pass Code Lookup
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                If the attendee's phone screen is cracked or camera cannot read the QR, type the pass code below:
              </p>

              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. EVTHUB-A1B2C3D4"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3.5 py-2.5 text-sm font-mono tracking-wider bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white uppercase placeholder:font-sans placeholder:normal-case"
                />
                <button
                  type="submit"
                  disabled={!manualCode.trim() || processing}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                >
                  Verify <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Upload QR Image Button */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Have a screenshot of the pass?
                </span>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload Image
                </button>
              </div>
            </div>

            {/* Recent Scans Feed */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  Recent Check-ins
                </h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {recentScans.length} Scanned
                </span>
              </div>

              {recentScans.length === 0 ? (
                <div className="py-10 text-center text-slate-400">
                  <ShieldCheck className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                  <p className="text-xs font-medium">No passes scanned yet.</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Scan results will appear here in real time.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {recentScans.map((scan) => (
                    <div
                      key={scan.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          scan.color === 'emerald' ? 'bg-emerald-500' : scan.color === 'amber' ? 'bg-amber-500' : 'bg-rose-500'
                        }`} />
                        <div className="truncate">
                          <span className="font-bold text-slate-900 dark:text-white block truncate">
                            {scan.attendee_name}
                          </span>
                          <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                            {scan.token} · {scan.event_title}
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 ml-2">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          scan.color === 'emerald'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : scan.color === 'amber'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                        }`}>
                          {scan.status}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">
                          {scan.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* CSS Animation for the laser beam */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes scannerLaser {
            0% { top: 0%; opacity: 0.8; }
            50% { opacity: 1; }
            100% { top: 98%; opacity: 0.8; }
          }
        `}} />
      </main>
    </div>
  );
}
