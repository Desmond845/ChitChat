import { useRef, useCallback } from 'react';

const useLongPress = (
  onLongPress,    // function to call when long press triggers
  onClick,        // function to call on short press (optional)
  { delay = 500 } = {} // delay in ms
) => {
  const timerRef = useRef();
  const isPressed = useRef(false);

  const start = useCallback(
    (e) => {
      e.persist?.(); // for React synthetic event persistence if needed
      isPressed.current = true;
      timerRef.current = setTimeout(() => {
        if (isPressed.current) {
          onLongPress(e);
        }
      }, delay);
    },
    [onLongPress, delay]
  );

  const cancel = useCallback(
    (e) => {
      e.persist?.();
      isPressed.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      // If we want to call onClick only if it was a short press and not cancelled by move
      // We need to differentiate: maybe use a flag. But for simplicity, we'll call onClick on mouseup/touchend if long press didn't fire.
      // However, long press might have already fired, so we need to avoid double action.
      // We'll implement a simple version without onClick for now.
    },
    []
  );

  // We need to also cancel on move events to prevent long press while scrolling
  const handleMove = useCallback(() => {
    isPressed.current = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  return {
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel, // if mouse leaves element, cancel
    onTouchStart: start,
    onTouchEnd: cancel,
    onTouchMove: handleMove,
    onTouchCancel: cancel,
  };
};

export default useLongPress;