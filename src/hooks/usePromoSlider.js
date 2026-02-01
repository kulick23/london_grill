import { useEffect, useRef, useState } from 'react';
import { PROMO_AUTOPLAY_MS, PROMO_FADE_MS } from '../constants/slider';

export const usePromoSlider = (items) => {
  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(null);
  const [isFading, setIsFading] = useState(false);
  const fadeTimerRef = useRef(null);
  const cleanupTimerRef = useRef(null);

  const goTo = (nextIndex) => {
    if (!items.length || nextIndex === index) return;
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    if (cleanupTimerRef.current) clearTimeout(cleanupTimerRef.current);
    setPrevIndex(index);
    setIndex(nextIndex);
    setIsFading(true);
    fadeTimerRef.current = setTimeout(() => {
      setIsFading(false);
    }, 16);
    cleanupTimerRef.current = setTimeout(() => {
      setPrevIndex(null);
    }, PROMO_FADE_MS + 50);
  };

  const next = () => {
    if (!items.length) return;
    const nextIndex = (index + 1) % items.length;
    goTo(nextIndex);
  };

  const prev = () => {
    if (!items.length) return;
    const nextIndex = (index - 1 + items.length) % items.length;
    goTo(nextIndex);
  };

  useEffect(() => {
    if (!items.length) return;
    const timer = setInterval(() => {
      const nextIndex = (index + 1) % items.length;
      goTo(nextIndex);
    }, PROMO_AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [items.length, index]);

  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      if (cleanupTimerRef.current) clearTimeout(cleanupTimerRef.current);
    };
  }, []);

  return {
    index,
    prevIndex,
    isFading,
    goTo,
    next,
    prev,
  };
};
