// Haptic feedback utility for Android Native feel
export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'selection' = 'light') => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      if (type === 'light') navigator.vibrate(10);
      else if (type === 'selection') navigator.vibrate(15);
      else if (type === 'medium') navigator.vibrate(25);
      else if (type === 'heavy') navigator.vibrate([30, 20, 30]);
    } catch (e) {
      // Ignore vibration error if not permitted
    }
  }
};
