import { MapPin, Phone, Mail, MessageCircle, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "../assets/Logo/Logo.jpeg";
const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Contact", path: "/contact" },
  ];

  const services = ["Sarees", "Dupattas", "Fabrics", "Home Decor"];

  const handleWhatsAppClick = () => {
    window.open(
      "https://wa.me/9951821516?text=Hello Kailash Kalamkari! I would like to inquire about your Products.",
      "_blank"
    );
  };

  return (
    <footer className="bg-[#F5E8C7] text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className=" rounded-lg">
                <img
                  src={logo}
                  alt="Your Logo"
                  className="h-14 w-16 object-contain"
                />
              </div>
              <div>
                <h3 className="text-xl text-[#d49217ff] font-bold">
                  Kailash Kalamkari
                </h3>
                <p className="text-sm text-[#d49217ff] text-primary-foreground/70">
                  Authentic Kalamkari Art
                </p>
              </div>
            </div>
            <p className="text-primary-foreground/80 mb-4 text-[#8A7F7D]">
              Each piece is meticulously crafted <br />
              using organic cotton and natural dyes extracted from plants,
              making our products eco-friendly and sustainable.
            </p>
            <Button
              onClick={handleWhatsAppClick}
              className="bg-travel-gold hover:bg-travel-gold-light text-[#8A7F7D] shadow-gold"
            >
              <MessageCircle className="mr-2 h-4 w-4 text-[#8A7F7D]" />
              WhatsApp
            </Button>
          </div>

          {/* Quick Location */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-[#d49217ff]">
              Location{" "}
            </h4>

            <div className="container mx-auto">
              <div className="max-w-xs mx-auto">
                <a
                  href="https://maps.app.goo.gl/BvwZzbZy9GJUoa8j9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative group"
                >
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.785282606641!2d79.68492557579845!3d17.7496996833361!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a334f1a5c0b5c3d%3A0x8d5ef5e5a5e5e5e5!2sPanagal+Rd,+Srikalahasti,+Andhra+Pradesh+517640,+India!5e0!3m2!1sen!2sin!4v1234567890"
                    width="100%"
                    height="120"
                    style={{ border: 0, borderRadius: "8px" }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="opacity-90 group-hover:opacity-100 transition-opacity"
                    title="Our Location Map"
                  ></iframe>
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg">
                    <div className="bg-black bg-opacity-80 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-2">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-[#d49217ff]">Get Directions</span>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-[#d49217ff]">
              Our Products
            </h4>
            <ul className="space-y-2">
              {services.map((service) => (
                <li
                  key={service}
                  className="text-primary-foreground/80 text-sm text-[#8A7F7D]"
                >
                  {service}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-[#d49217ff]">
              Contact Info
            </h4>
            <div className="space-y-3 text-[#8A7F7D]">
              <div className="flex items-start space-x-2 ">
                <Phone className="h-4 w-4 mt-1 text-travel-gold flex-shrink-0 " />
                <div>
                  <p className="text-primary-foreground/80 text-sm text-[#8A7F7D]">
                    +91 9951821516
                  </p>
                  <p className="text-primary-foreground/60 text-xs text-[#8A7F7D]">
                    Available 24/7
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Mail className="h-4 w-4 mt-1 text-travel-gold flex-shrink-0" />
                <div>
                  <p className="text-primary-foreground/80 text-sm text-[#8A7F7D]">
                    kailashkalamkari1984@gmail.com
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-1 text-travel-gold flex-shrink-0" />
                <div>
                  <p className="text-primary-foreground/80 text-sm text-[#8A7F7D]">
                    Panagal Rd, Srikalahasti, Andhra Pradesh 517640, India
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-[#8A7F7D] mt-8 pt-8 ">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-primary-foreground/70 text-sm mb-4 md:mb-0 text-[#8A7F7D]">
              © {currentYear} Kailash Kalamkari. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <a
                href="#"
                className="text-primary-foreground/70 hover:text-travel-gold transition-colors text-[#8A7F7D]"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-primary-foreground/70 hover:text-travel-gold transition-colors text-[#8A7F7D]"
              >
                Terms & Conditions
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
