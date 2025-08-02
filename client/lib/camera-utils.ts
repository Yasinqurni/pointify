/**
 * Camera cleanup utilities to prevent cameras from running in background
 */

/**
 * Force stop all active camera streams globally
 * This is a safety function to ensure no cameras are left running
 */
export function forceStopAllCameraStreams(): void {
  console.log('🔴 GLOBAL: Force stopping all camera streams...')
  
  // Find all video elements on the page
  const videoElements = document.querySelectorAll('video')
  let stoppedCount = 0
  
  videoElements.forEach((video, index) => {
    if (video.srcObject) {
      const stream = video.srcObject as MediaStream
      stream.getTracks().forEach(track => {
        if (track.readyState === 'live') {
          console.log(`🔴 GLOBAL: Stopping track ${track.kind} on video element ${index}`)
          track.stop()
          stoppedCount++
        }
      })
      video.srcObject = null
    }
  })
  
  console.log(`✅ GLOBAL: Stopped ${stoppedCount} camera tracks`)
}

/**
 * Check if any camera streams are currently active
 * Returns true if active streams are detected
 */
export function checkForActiveCameraStreams(): boolean {
  const videoElements = document.querySelectorAll('video')
  let activeCount = 0
  
  videoElements.forEach(video => {
    if (video.srcObject) {
      const stream = video.srcObject as MediaStream
      stream.getTracks().forEach(track => {
        if (track.readyState === 'live') {
          activeCount++
          console.log(`⚠️ Active camera track detected: ${track.kind}`)
        }
      })
    }
  })
  
  if (activeCount > 0) {
    console.log(`⚠️ Found ${activeCount} active camera tracks`)
    return true
  }
  
  return false
}

/**
 * Set up global event listeners to clean up cameras when navigating away
 */
export function setupGlobalCameraCleanup(): void {
  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    forceStopAllCameraStreams()
  })
  
  // Clean up on visibility change (when tab becomes hidden)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      console.log('📱 Tab hidden - checking for active cameras...')
      if (checkForActiveCameraStreams()) {
        forceStopAllCameraStreams()
      }
    }
  })
  
  // Clean up on page hide
  window.addEventListener('pagehide', () => {
    forceStopAllCameraStreams()
  })
  
  // Emergency hotkey: Ctrl/Cmd + Shift + C to force stop all cameras
  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'C') {
      event.preventDefault()
      console.log('🚨 EMERGENCY: Hotkey triggered - stopping all cameras!')
      forceStopAllCameraStreams()
      
      // Show user feedback
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Camera Emergency Stop', {
          body: 'All camera streams have been forcefully stopped.',
          icon: '/favicon.ico'
        })
      } else {
        alert('🔴 Emergency: All camera streams stopped!')
      }
    }
  })
  
  console.log('✅ Global camera cleanup listeners installed')
  console.log('🚨 Emergency hotkey: Ctrl/Cmd + Shift + C to stop all cameras')
} 