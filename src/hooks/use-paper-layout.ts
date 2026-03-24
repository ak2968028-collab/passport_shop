"use client";

import { useEffect, useMemo, useState } from "react";
import {
  clampOffset,
  createInitialLayout,
  getPaperDimensions
} from "@/services/layout.service";
import { LayoutItem, PrintSettings } from "@/types/photo";

export function usePaperLayout(settings: PrintSettings) {
  const paper = useMemo(
    () => getPaperDimensions(settings.paperSize, settings.orientation),
    [settings.paperSize, settings.orientation]
  );
  const [items, setItems] = useState<LayoutItem[]>(() =>
    createInitialLayout(settings.quantity, paper, settings.margin)
  );

  useEffect(() => {
    setItems(createInitialLayout(settings.quantity, paper, settings.margin));
  }, [paper, settings.quantity, settings.margin]);

  const resetLayout = () => {
    setItems(createInitialLayout(settings.quantity, paper, settings.margin));
  };

  const moveImage = (id: string, imageOffsetX: number, imageOffsetY: number) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              imageOffsetX: clampOffset(imageOffsetX),
              imageOffsetY: clampOffset(imageOffsetY)
            }
          : item
      )
    );
  };

  return {
    items,
    moveImage,
    paper,
    resetLayout
  };
}
