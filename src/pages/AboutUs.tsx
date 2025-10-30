import React, { useEffect, useRef, useState } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';
import { Sparkles, Heart, Award, Palette, Users, Trophy } from 'lucide-react';

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div
      className="w-full bg-gradient-to-b from-amber-50 via-orange-50 to-red-50 font-sans md:px-10"
      ref={containerRef}
    >
      <div ref={ref} className="relative max-w-7xl mx-auto pb-20">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex justify-start pt-10 md:pt-40 md:gap-10"
          >
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
              <div className="h-10 absolute left-3 md:left-3 w-10 rounded-full bg-white flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-orange-300 border border-orange-400 p-2" />
              </div>
              <h3 className="hidden md:block text-xl md:pl-20 md:text-5xl font-bold text-orange-600">
                {item.title}
              </h3>
            </div>

            <div className="relative pl-20 pr-4 md:pl-4 w-full">
              <h3 className="md:hidden block text-2xl mb-4 text-left font-bold text-orange-600">
                {item.title}
              </h3>
              {item.content}
            </div>
          </div>
        ))}
        <div
          style={{
            height: height + "px",
          }}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-orange-200 to-transparent to-[99%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-t from-orange-500 via-red-500 to-transparent from-[0%] via-[10%] rounded-full"
          />
        </div>
      </div>
    </div>
  );
};

const AboutUs: React.FC = () => {
  const timelineData: TimelineEntry[] = [
    {
      title: "1985",
      content: (
        <div>
          <p className="text-neutral-800 text-xs md:text-sm font-normal mb-8">
            Our journey began with a simple vision: to preserve and celebrate the ancient art of Kalamkari. 
            We started working directly with master artisans from Srikalahasti and Machilipatnam, learning 
            their time-honored techniques passed down through generations.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&q=80"
              alt="Traditional Kalamkari art"
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <img
              src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500&q=80"
              alt="Artisan at work"
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <img
              src="https://images.unsplash.com/photo-1632522485154-d2588c8e5bfe?w=500&q=80"
              alt="Traditional patterns"
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <img
              src="https://images.unsplash.com/photo-1609966544644-40edfc9ab9a0?w=500&q=80"
              alt="Kalamkari fabric"
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
          </div>
        </div>
      ),
    },
    {
      title: "1995",
      content: (
        <div>
          <p className="text-neutral-800 text-xs md:text-sm font-normal mb-8">
            A decade of dedication brought recognition. Our authentic, handcrafted Kalamkari sarees gained 
            appreciation from connoisseurs across the country. We established strong partnerships with artisan 
            communities, ensuring fair wages and sustainable practices.
          </p>
          <p className="text-neutral-800 text-xs md:text-sm font-normal mb-8">
            Our collection expanded to include various styles—from traditional temple motifs to contemporary 
            designs, all maintaining the authentic Kalamkari essence.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500&q=80"
              alt="Beautiful saree collection"
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <img
              src="https://images.unsplash.com/photo-1583391733981-24c5d5441f2f?w=500&q=80"
              alt="Artisan community"
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <img
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&q=80"
              alt="Traditional designs"
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <img
              src="https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?w=500&q=80"
              alt="Handcrafted sarees"
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
          </div>
        </div>
      ),
    },
    {
      title: "2005",
      content: (
        <div>
          <p className="text-neutral-800 text-xs md:text-sm font-normal mb-4">
            Committed to heritage preservation, we launched several initiatives to ensure the survival of Kalamkari art:
          </p>
          <div className="mb-8">
            <div className="flex gap-2 items-center text-neutral-700 text-xs md:text-sm mb-2">
              ✅ Established training programs for young artisans
            </div>
            <div className="flex gap-2 items-center text-neutral-700 text-xs md:text-sm mb-2">
              ✅ Documented traditional techniques and patterns
            </div>
            <div className="flex gap-2 items-center text-neutral-700 text-xs md:text-sm mb-2">
              ✅ Created artisan welfare programs
            </div>
            <div className="flex gap-2 items-center text-neutral-700 text-xs md:text-sm mb-2">
              ✅ Partnered with cultural organizations
            </div>
            <div className="flex gap-2 items-center text-neutral-700 text-xs md:text-sm mb-2">
              ✅ Hosted Kalamkari art exhibitions
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1588392382834-a891154bca4d?w=500&q=80"
              alt="Artisan training"
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <img
              src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500&q=80"
              alt="Traditional workshop"
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <img
              src="https://images.unsplash.com/photo-1632522485154-d2588c8e5bfe?w=500&q=80"
              alt="Heritage preservation"
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <img
              src="https://images.unsplash.com/photo-1609966544644-40edfc9ab9a0?w=500&q=80"
              alt="Cultural exhibition"
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
          </div>
        </div>
      ),
    },
    {
      title: "2015",
      content: (
        <div>
          <p className="text-neutral-800 text-xs md:text-sm font-normal mb-8">
            Expanded our presence across India with multiple stores, making authentic Kalamkari accessible to 
            fashion enthusiasts nationwide. Each store was designed to reflect the traditional aesthetics while 
            providing a modern shopping experience.
          </p>
          <p className="text-neutral-800 text-xs md:text-sm font-normal mb-8">
            Despite growth, we never compromised on our core values—every saree continued to be handcrafted 
            by skilled artisans using traditional methods and natural dyes.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&q=80"
              alt="Store interior"
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <img
              src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500&q=80"
              alt="Premium collection"
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <img
              src="https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?w=500&q=80"
              alt="Saree display"
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <img
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&q=80"
              alt="Traditional showcase"
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
          </div>
        </div>
      ),
    },
    {
      title: "2025",
      content: (
        <div>
          <p className="text-neutral-800 text-xs md:text-sm font-normal mb-8">
            Embracing the digital age while staying rooted in tradition. Our online platform brings the 
            beauty of authentic Kalamkari sarees to global customers, making this ancient art form accessible 
            to everyone, everywhere.
          </p>
          <p className="text-neutral-800 text-xs md:text-sm font-normal mb-8">
            We continue our commitment to artisans, sustainability, and quality—now enhanced with the 
            convenience of modern technology. Every purchase supports traditional craftspeople and helps 
            preserve this 3000-year-old heritage.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&q=80"
              alt="Digital platform"
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <img
              src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500&q=80"
              alt="Online collection"
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <img
              src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500&q=80"
              alt="Artisan empowerment"
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <img
              src="https://images.unsplash.com/photo-1609966544644-40edfc9ab9a0?w=500&q=80"
              alt="Global reach"
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-red-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-orange-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-red-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            Our Story
          </h1>
          <p className="text-xl text-gray-700 leading-relaxed">
            Weaving Tradition with Every Thread
          </p>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Who We Are</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                We are custodians of the ancient Kalamkari art, a heritage that dates back over 3000 years. 
                Each saree in our collection tells a story, hand-painted or block-printed by skilled artisans 
                who have inherited this craft through generations.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Our commitment goes beyond selling sarees—we preserve culture, support artisan communities, 
                and bring the timeless elegance of Kalamkari to modern wardrobes while maintaining complete 
                authenticity and quality.
              </p>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-orange-200 to-red-200 rounded-2xl p-8 shadow-xl">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg mb-1">Authentic Craftsmanship</h3>
                      <p className="text-gray-700">Hand-crafted by master artisans using traditional techniques</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg mb-1">Natural Materials</h3>
                      <p className="text-gray-700">Eco-friendly natural dyes and organic cotton fabrics</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg mb-1">Artisan Support</h3>
                      <p className="text-gray-700">Fair wages and sustainable livelihoods for craftspeople</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section with heading */}
      <section className="pt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-10 pb-10">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 text-center">
            Our Journey
          </h2>
          <p className="text-neutral-700 text-base md:text-lg text-center max-w-2xl mx-auto">
            Four decades of preserving heritage, empowering artisans, and bringing the timeless beauty of Kalamkari to the world.
          </p>
        </div>
      </section>

      {/* Animated Timeline */}
      <Timeline data={timelineData} />

      {/* Values Section with Flip Animation on Hover (fixed flip direction) */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Value Card 1 */}
            <div className="flip-card group">
              <div className="flip-card-inner">
                {/* Front */}
                <div className="flip-card-front bg-gradient-to-br from-orange-50 to-red-50 rounded-xl shadow-lg flex flex-col items-center justify-center p-8 h-72">
                  <Palette className="w-16 h-16 text-orange-500 mb-4" />
                  <h3 className="text-xl font-bold text-gray-800">Heritage Preservation</h3>
                </div>
                {/* Back */}
                <div className="flip-card-back bg-gradient-to-br from-orange-100 to-red-100 rounded-xl shadow-xl flex flex-col items-center justify-center p-8 h-72">
                  <p className="text-gray-700 text-lg font-semibold mb-2">Keeping ancient traditions alive</p>
                  <p className="text-gray-600 text-base">for future generations</p>
                </div>
              </div>
            </div>
            {/* Value Card 2 */}
            <div className="flip-card group">
              <div className="flip-card-inner">
                {/* Front */}
                <div className="flip-card-front bg-gradient-to-br from-orange-50 to-red-50 rounded-xl shadow-lg flex flex-col items-center justify-center p-8 h-72">
                  <Trophy className="w-16 h-16 text-red-500 mb-4" />
                  <h3 className="text-xl font-bold text-gray-800">Quality Excellence</h3>
                </div>
                {/* Back */}
                <div className="flip-card-back bg-gradient-to-br from-orange-100 to-red-100 rounded-xl shadow-xl flex flex-col items-center justify-center p-8 h-72">
                  <p className="text-gray-700 text-lg font-semibold mb-2">Uncompromising standards</p>
                  <p className="text-gray-600 text-base">in every piece we create</p>
                </div>
              </div>
            </div>
            {/* Value Card 3 */}
            <div className="flip-card group">
              <div className="flip-card-inner">
                {/* Front */}
                <div className="flip-card-front bg-gradient-to-br from-orange-50 to-red-50 rounded-xl shadow-lg flex flex-col items-center justify-center p-8 h-72">
                  <Users className="w-16 h-16 text-amber-500 mb-4" />
                  <h3 className="text-xl font-bold text-gray-800">Community First</h3>
                </div>
                {/* Back */}
                <div className="flip-card-back bg-gradient-to-br from-orange-100 to-red-100 rounded-xl shadow-xl flex flex-col items-center justify-center p-8 h-72">
                  <p className="text-gray-700 text-lg font-semibold mb-2">Supporting artisans and families</p>
                  <p className="text-gray-600 text-base">with dignity and care</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <style>
          {`
            .flip-card {
              perspective: 1100px;
              min-height: 18rem;
              height: 100%;
              width: 100%;
            }
            .flip-card-inner {
              position: relative;
              width: 100%;
              height: 100%;
              transition: transform 0.6s cubic-bezier(.4,2,.7,.9);
              transform-style: preserve-3d;
              /* fallback for touch */
              will-change: transform;
            }
            .flip-card:hover .flip-card-inner,
            .flip-card:focus-within .flip-card-inner {
              transform: rotateY(180deg);
            }
            .flip-card-front,
            .flip-card-back {
              position: absolute;
              width: 100%;
              height: 100%;
              backface-visibility: hidden;
              top: 0; left: 0;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }
            .flip-card-back {
              transform: rotateY(180deg);
              z-index: 2;
            }
            .flip-card-front {
              z-index: 1;
            }
          `}
        </style>
      </section>
    </div>
  );
};

export default AboutUs;