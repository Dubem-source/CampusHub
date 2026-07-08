"use client";

import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

const images = [
  "/image/Carol1.jpg",
  "/image/Carol2.jpg",
  "/image/Carol3.jpg",
  "/image/Carol4.jpg",
];

export default function ImageCarousel() {
  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
    },
    [
      Autoplay({
        delay: 3000,
        stopOnInteraction: false,
      }),
    ]
  );

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex">
        {images.map((src, index) => (
          <div key={index} className="relative min-w-full h-full min-h-[1100px] md:min-h-[920px]">
            <Image
              src={src}
              alt={`Slide ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
              sizes="(min-width: 1024px) 1024px, 100vw"
            />
          </div>
        ))}
      </div>
    </div>
  );
}