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

  const moveItem = (id: string, x: number, y: number) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              x: Math.max(0, Math.min(paper.width - item.width, x)),
              y: Math.max(0, Math.min(paper.height - item.height, y))
            }
          : item
      )
    );
  };

  return {
    items,
    moveImage,
    moveItem,
    paper,
    resetLayout
  };
}
