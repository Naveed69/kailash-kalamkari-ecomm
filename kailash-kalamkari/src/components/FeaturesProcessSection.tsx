import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Leaf, 
  Paintbrush, 
  Shield, 
  Truck, 
  RefreshCw, 
  Globe,
  CheckCircle,
  Heart
} from 'lucide-react';

const features = [
  {
    icon: <Leaf className="w-8 h-8" />,
    title: 'Natural & Eco-Friendly',
    description: 'Made with organic cotton and natural plant-based dyes, completely chemical-free and sustainable.',
    color: 'bg-green-500'
  },
  {
    icon: <Paintbrush className="w-8 h-8" />,
    title: 'Hand-Painted Artistry',
    description: 'Each piece is meticulously hand-painted by skilled artisans using traditional techniques passed down through generations.',
    color: 'bg-blue-500'
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: 'Authenticity Guaranteed',
    description: 'Every product comes with a certificate of authenticity, ensuring you receive genuine kalamkari art.',
    color: 'bg-purple-500'
  },
  {
    icon: <Truck className="w-8 h-8" />,
    title: 'Worldwide Shipping',
    description: 'Carefully packaged and shipped globally with tracking, ensuring your treasures reach you safely.',
    color: 'bg-orange-500'
  },
  {
    icon: <RefreshCw className="w-8 h-8" />,
    title: 'Easy Returns',
    description: '30-day hassle-free return policy. Not satisfied? We\'ll make it right, no questions asked.',
    color: 'bg-red-500'
  },
  {
    icon: <Heart className="w-8 h-8" />,
    title: 'Artisan Support',
    description: 'Your purchase directly supports traditional artisan families and helps preserve cultural heritage.',
    color: 'bg-pink-500'
  }
];

const processes = [
  {
    step: '01',
    title: 'Design Creation',
    description: 'Master artists sketch traditional motifs inspired by mythology, nature, and cultural stories.'
  },
  {
    step: '02',
    title: 'Natural Dye Preparation',
    description: 'Plant-based dyes are prepared from roots, flowers, and bark using ancient recipes.'
  },
  {
    step: '03',
    title: 'Fabric Treatment',
    description: 'Cotton fabric is treated with natural mordants to ensure color fastness and longevity.'
  },
  {
    step: '04',
    title: 'Hand Painting',
    description: 'Skilled artisans carefully paint each design using fine brushes and traditional tools.'
  },
  {
    step: '05',
    title: 'Natural Drying',
    description: 'Pieces are sun-dried naturally, allowing colors to set and develop their characteristic richness.'
  },
  {
    step: '06',
    title: 'Quality Check',
    description: 'Each piece undergoes rigorous quality inspection before being approved for shipment.'
  }
];

interface FeaturesProcessSectionProps {
  onWhatsAppClick: () => void;
}

export const FeaturesProcessSection = ({ onWhatsAppClick }: FeaturesProcessSectionProps) => {
  return (
    <>
      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <Badge variant="secondary" className="mb-4">Why Choose Us</Badge>
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Crafted with Care, Delivered with Love
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the difference of authentic craftsmanship with our commitment 
              to quality, sustainability, and customer satisfaction.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={feature.title}
                className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`${feature.color} text-white p-3 rounded-lg group-hover:scale-110 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-gradient-to-br from-muted/30 to-accent/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <Badge variant="secondary" className="mb-4">Our Process</Badge>
            <h2 className="text-4xl font-bold text-foreground mb-4">
              From Sketch to Masterpiece
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover the meticulous 6-step process that transforms simple cotton 
              into extraordinary works of art, preserving centuries-old traditions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {processes.map((process, index) => (
              <Card 
                key={process.step}
                className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-border/50 bg-card/80 backdrop-blur-sm animate-fade-in"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-primary text-primary-foreground text-2xl font-bold w-12 h-12 rounded-full flex items-center justify-center">
                      {process.step}
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">
                      {process.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground">
                    {process.description}
                  </p>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12 animate-fade-in">
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-border/50 max-w-2xl mx-auto">
              <CardContent className="p-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Quality Guaranteed
                </h3>
                <p className="text-muted-foreground mb-6">
                  Every piece goes through our rigorous quality control process. 
                  If you're not completely satisfied, we'll make it right.
                </p>
                <Button onClick={onWhatsAppClick} className="bg-green-500 hover:bg-green-600">
                  <Globe className="w-4 h-4 mr-2" />
                  Learn More About Our Process
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
};