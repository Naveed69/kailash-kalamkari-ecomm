import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Palette, Users, Award, Heart, Clock, MapPin } from "lucide-react";

const milestones = [
  {
    year: "1984",
    title: "The Beginning",
    description:
      "Started our journey in the heart of Andhra Pradesh, learning traditional kalamkari techniques from master craftsmen.",
    icon: <Clock className="w-6 h-6" />,
    color: "bg-blue-500",
  },
  {
    year: "1995",
    title: "First Workshop",
    description:
      "Established our first dedicated workshop, bringing together local artisans and preserving ancient techniques.",
    icon: <Users className="w-6 h-6" />,
    color: "bg-green-500",
  },
  {
    year: "2005",
    title: "Recognition",
    description:
      "Received state recognition for promoting traditional crafts and supporting rural artisan communities.",
    icon: <Award className="w-6 h-6" />,
    color: "bg-yellow-500",
  },
  {
    year: "2015",
    title: "Digital Presence",
    description:
      "Launched online platform to share our art with the world while maintaining traditional authenticity.",
    icon: <Palette className="w-6 h-6" />,
    color: "bg-purple-500",
  },
  {
    year: "2024",
    title: "Global Reach",
    description:
      "Serving customers worldwide, shipped over 10,000 pieces, touching hearts across 25+ countries.",
    icon: <Heart className="w-6 h-6" />,
    color: "bg-red-500",
  },
];

const stats = [
  {
    number: "40+",
    label: "Years of Excellence",
    icon: <Clock className="w-8 h-8" />,
  },
  {
    number: "50+",
    label: "Skilled Artisans",
    icon: <Users className="w-8 h-8" />,
  },
  {
    number: "10,000+",
    label: "Happy Customers",
    icon: <Heart className="w-8 h-8" />,
  },
  {
    number: "25+",
    label: "Countries Served",
    icon: <MapPin className="w-8 h-8" />,
  },
];

export const OurJourneySection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <Badge variant="secondary" className="mb-4">
            Our Story
          </Badge>
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Four Decades of Artistic Excellence
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            From humble beginnings in 1984 to becoming a globally recognized
            name in authentic kalamkari art, our journey has been one of
            passion, dedication, and unwavering commitment to preserving
            traditional craftsmanship.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card
              key={stat.label}
              className="text-center p-6 bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300 animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-0">
                <div className="flex justify-center mb-4 text-[#d49217ff]">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary via-accent to-primary rounded-full hidden md:block"></div>

          <div className="space-y-12">
            {milestones.map((milestone, index) => (
              <div
                key={milestone.year}
                className={`flex items-center gap-8 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                } animate-slide-in-${index % 2 === 0 ? "left" : "right"}`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {/* Content */}
                <div className="flex-1 md:max-w-md">
                  <Card className="bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3 ">
                        <div
                          className={`${milestone.color} text-white p-2 rounded-full`}
                        >
                          {milestone.icon}
                        </div>
                        <Badge variant="outline" className="text-lg px-3 py-1 ">
                          {milestone.year}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-3">
                        {milestone.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {milestone.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Timeline dot */}
                <div className="hidden md:block relative">
                  <div className="w-4 h-4 bg-primary rounded-full border-4 border-background shadow-lg"></div>
                  <div className="absolute inset-0 w-4 h-4 bg-primary rounded-full animate-ping opacity-20"></div>
                </div>

                {/* Spacer for alternating layout */}
                <div className="flex-1 md:max-w-md hidden md:block"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Vision Statement */}
        {/* <div className="text-center mt-16 animate-fade-in">
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-border/50 max-w-4xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Our Vision
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                "To preserve and promote the ancient art of kalamkari for future
                generations while providing sustainable livelihoods to
                traditional artisans. We believe that every piece we create
                carries the soul of our heritage and the dreams of our
                craftsmen."
              </p>
              <div className="mt-6">
                <Badge variant="secondary" className="text-base px-4 py-2">
                  - Kailash Kalamkari Family
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div> */}
      </div>
    </section>
  );
};
