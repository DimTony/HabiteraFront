"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider@1.2.3";

import { cn } from "./utils";

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative grow overflow-hidden rounded-full h-3 w-full"
        style={{ backgroundColor: '#E5E7EB' }}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="absolute h-full"
          style={{ backgroundColor: '#003883' }}
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        data-slot="slider-thumb"
        className="block w-6 h-6 rounded-full border-[3px] shadow-lg cursor-pointer hover:scale-110 active:scale-105 transition-transform focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:pointer-events-none disabled:opacity-50"
        style={{ backgroundColor: 'white', borderColor: '#003883' }}
      />
    </SliderPrimitive.Root>
  );
}

export { Slider };
