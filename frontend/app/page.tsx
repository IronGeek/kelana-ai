import { Suspense } from 'react';
import Image from 'next/image';

import { TravelForm } from '@/components/form/travel'
import { SparklesIcon } from 'lucide-react';
import { TiltFocus } from '@/components/utils/tilt-focus';
import { RotatingText } from '@/components/utils/rotating-text';
import { shuffle } from '@/lib/utils';

import { getProfile } from '@/services/auth-service';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

const destinations = {
  id: shuffle([
    'Prancis', 'Spanyol', 'Amerika Serikat', 'Turki', 'Italia', 'Meksiko', 'Inggris', 'Jerman',
    'Yunani', 'Austria', 'Thailand', 'Jepang', 'Korea Selatan', 'Indonesia', 'Vietnam', 'Malaysia',
    'Singapura', 'Australia', 'Selandia Baru', 'Mesir', 'Afrika Selatan', 'Kanada', 'Swiss', 'Belanda',
    'UEA', 'Paris', 'London', 'Bangkok', 'Hong Kong', 'Dubai', 'Singapura', 'Macau', 'New York', 'Tokyo',
    'Kuala Lumpur', 'Delhi', 'Istanbul', 'Roma', 'Antalya', 'Mumbai', 'Praha', 'Barcelona', 'Seoul',
    'Amsterdam', 'Miami', 'Phuket', 'Denpasar', 'Shanghai', 'Las Vegas', 'Milan',
  ]),
  en: shuffle([
    'France', 'Spain', 'United States', 'Turkey', 'Italy', 'Mexico', 'United Kingdom', 'Germany',
    'Greece', 'Austria', 'Thailand', 'Japan', 'South Korea', 'Indonesia', 'Vietnam', 'Malaysia',
    'Singapore', 'Australia', 'New Zealand', 'Egypt', 'South Africa', 'Canada', 'Switzerland', 'Netherlands',
    'UAE', 'Paris', 'London', 'Bangkok', 'Hong Kong', 'Dubai', 'Singapore', 'Macau', 'New York', 'Tokyo', 'Kuala Lumpur',
    'Delhi', 'Istanbul', 'Rome', 'Antalya', 'Mumbai', 'Prague', 'Barcelona', 'Seoul',
    'Amsterdam', 'Miami', 'Phuket', 'Denpasar', 'Shanghai', 'Las Vegas', 'Milan',
  ])
} as const;

export default async function TripsPage() {
  const profile = await getProfile(false);

  return (
    <section>
      <Navbar className="fixed w-full" profile={profile} />
      <section className="relative w-full min-h-screen flex items-center justify-center py-16 md:py-24 overflow-hidden dark">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src="/images/hero.webp"
            alt="KelanaAI"
            fill
            priority
            quality={85}
            sizes="100vw"
            className="object-cover object-center animate-in fade-in zoom-in-105 duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40 lg:from-black/85 lg:via-black/60 lg:to-transparent" />
          <div className="absolute bottom-0 text-zinc-500 text-sm flex p-2 gap-1">
            Photo by <a href="https://unsplash.com/@charlottenoelle" target="_blank">Charlotte Noelle</a>
            on <a href="https://unsplash.com/photos/black-dslr-camera-near-passport-98WPMlTl5xo" target="_blank">Unsplash</a>
          </div>
        </div>

        <div className="container px-4 md:px-6 grid gap-12 lg:grid-cols-12 items-center mx-auto max-w-7xl relative z-10 text-white">
          <div className="flex flex-col justify-center space-y-6 lg:col-span-6">
            <div className="space-y-4 mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white backdrop-blur-md w-fit border border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
                <SparklesIcon className="h-4 w-4 text-yellow-400" />
                AI-Assisted
              </span>
              <h1 className="mb-8 text-4xl font-extrabold tracking-tight sm:text-5xl xl:text-6xl text-white drop-shadow-sm animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150 fill-mode-both">
                <Suspense fallback={<span className="mr-2 md:mr-3 lg:mr-4">Plan Your Next Trip</span>}>
                  <RotatingText
                    prefix="Plan Your Next Trip to"
                    texts={destinations['en']}
                    className="inline-block overflow-hidden bg-primary/60 text-black rounded-lg px-2 sm:px-2 md:px-3 sm:py-1 md:py-2"
                    staggerFrom="last"
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "-120%" }}
                    staggerDuration={0.025}
                    splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                    rotationInterval={5000}
                    splitBy="characters"
                    auto
                    loop
                  />
                </Suspense>
              </h1>
              <p className="max-w-[500px] text-zinc-300 md:text-lg lg:text-xl font-normal leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300 fill-mode-both">
                From inspiration to a fully planned itinerary in seconds. Let us handle the planning while you focus on making memories.
              </p>
              <p className="max-w-[500px] text-zinc-300 md:text-lg lg:text-xl font-normal leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300 fill-mode-both">
                The ultimate personal travel guide. Design, optimize, and organize your next adventure instantly.
              </p>
              <p className="max-w-[500px] text-zinc-300 md:text-lg lg:text-xl font-normal leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300 fill-mode-both">
                Your trip, your way!
              </p>
            </div>

            <div className="flex flex-col gap-3 min-[400px]:flex-row pt-2 text-sm text-zinc-400 animate-in fade-in duration-500 delay-500 fill-mode-both">
              <div className="flex items-center gap-2 px-2 py-0.5 bg-secondary/50 rounded-sm">
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                Always Available
              </div>
              <div className="flex items-center gap-2 px-2 py-0.5 bg-secondary/50 rounded-sm">
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                100% Free
              </div>
              <div className="flex items-center gap-2 px-2 py-0.5 bg-secondary/50 rounded-sm">
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                Yours Truly
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center lg:justify-end lg:col-span-6 gap-2 backdrop-blur animate-in fade-in slide-in-from-bottom-8 lg:slide-in-from-right-8 duration-700 delay-200 fill-mode-both">
            <TiltFocus direction="left" angle={5} tabIndex={0}>
              <TravelForm profile={profile} />
            </TiltFocus>
          </div>
        </div>
      </section>
      <Footer className="mx-auto mt-auto" />
    </section>
  );
}
