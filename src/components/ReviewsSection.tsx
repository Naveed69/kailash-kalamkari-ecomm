import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Review {
  id: string;
  name: string;
  location: string;
  rating: number;
  review: string;
  avatar?: string;
  purchasedItem: string;
}

const reviews: Review[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    location: 'Mumbai, Maharashtra',
    rating: 5,
    review: "Absolutely stunning kalamkari saree! The craftsmanship is exceptional and the colors are vibrant. I received so many compliments at my friend's wedding. The quality exceeded my expectations.",
    avatar: '',
    purchasedItem: 'Traditional Peacock Kalamkari Saree'
  },
  {
    id: '2',
    name: 'Rajesh Kumar',
    location: 'Bangalore, Karnataka',
    rating: 5,
    review: "Bought this for my wife and she absolutely loves it. The hand-painted details are incredible and you can see the authenticity in every stroke. Fast delivery and excellent packaging.",
    avatar: '',
    purchasedItem: 'Floral Kalamkari Cotton Dupatta'
  },
  {
    id: '3',
    name: 'Anita Reddy',
    location: 'Hyderabad, Telangana',
    rating: 5,
    review: "Being from Andhra Pradesh, I know authentic kalamkari when I see it. This is the real deal! The natural dyes and traditional techniques are perfectly preserved. Highly recommended!",
    avatar: '',
    purchasedItem: 'Tree of Life Kalamkari Wall Art'
  },
  {
    id: '4',
    name: 'Meera Patel',
    location: 'Ahmedabad, Gujarat',
    rating: 4,
    review: "Beautiful work and amazing customer service. The WhatsApp support was very helpful in choosing the right piece. The fabric quality is excellent and colors are true to the photos.",
    avatar: '',
    purchasedItem: 'Mythological Kalamkari Fabric'
  },
  {
    id: '5',
    name: 'Deepa Nair',
    location: 'Chennai, Tamil Nadu',
    rating: 5,
    review: "I'm an art collector and this piece is truly a masterpiece. The attention to detail and the story behind each motif is fascinating. This will be treasured for generations.",
    avatar: '',
    purchasedItem: 'Elephant Motif Kalamkari Bedsheet'
  },
  {
    id: '6',
    name: 'Kavita Joshi',
    location: 'Pune, Maharashtra',
    rating: 5,
    review: "Perfect for gifting! I bought this for my daughter-in-law and she was thrilled. The packaging was beautiful and the quality is outstanding. Will definitely order again.",
    avatar: '',
    purchasedItem: 'Lotus Pond Kalamkari Stole'
  }
];

export const ReviewsSection = () => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied customers who have experienced the beauty 
            and authenticity of our handcrafted kalamkari products.
          </p>
          <div className="flex justify-center items-center mt-6 gap-4">
            <div className="flex items-center gap-1">
              {renderStars(5)}
            </div>
            <span className="text-2xl font-bold text-primary">4.9/5</span>
            <span className="text-muted-foreground">Based on 500+ reviews</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <Card 
              key={review.id} 
              className="bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300 animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={review.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {review.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{review.name}</h4>
                    <p className="text-sm text-muted-foreground">{review.location}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <Quote className="w-6 h-6 text-primary/30" />
                </div>
                
                <p className="text-muted-foreground text-sm mb-3 line-clamp-4">
                  "{review.review}"
                </p>
                
                <div className="border-t border-border/50 pt-3">
                  <p className="text-xs text-muted-foreground">
                    Purchased: <span className="font-medium">{review.purchasedItem}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};