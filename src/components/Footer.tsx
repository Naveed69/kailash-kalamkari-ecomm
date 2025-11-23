"use client"

import { MapPin, Phone, Mail, MessageCircle, Facebook, Instagram, Twitter, Youtube } from "lucide-react"
import { useRef, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom";
import logo from "@/assets/Logo/kklogo.png";
const LOGO_SRC = logo;

const CONTACT_INFO = {
  phone: "+91 9951821516",
  email: "kailashkalamkari1984@gmail.com",
  address: "Panagal Rd, Srikalahasti, Andhra Pradesh 517640, India",
  whatsappNumber: "9951821516",
  mapsUrl: "https://maps.app.goo.gl/BvwZzbZy9GJUoa8j9",
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.785282606641!2d79.68492557579845!3d17.7496996833361!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a334f1a5c0b5c3d%3A0x8d5ef5e5a5e5e5e5!2sPanagal+Rd,+Srikalahasti,+Andhra+Pradesh+517640,+India!5e0!3m2!1sen!2sin!4v1234567890",
}

const SOCIAL_MEDIA = [
  { name: "Facebook", icon: Facebook, url: "https://facebook.com/kailashkalamkari", label: "Follow us on Facebook" },
  {
    name: "Instagram",
    icon: Instagram,
    url: "https://instagram.com/kailashkalamkari",
    label: "Follow us on Instagram",
  },
  { name: "Twitter", icon: Twitter, url: "https://twitter.com/kailashkalamkari", label: "Follow us on Twitter" },
  { name: "YouTube", icon: Youtube, url: "https://youtube.com/@kailashkalamkari", label: "Subscribe on YouTube" },
]

// Text Hover Effect Component
const TextHoverEffect = ({ text, className = "" }) => {
  const svgRef = useRef(null)
  const [cursor, setCursor] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)
  const [maskPosition, setMaskPosition] = useState({ cx: "50%", cy: "50%" })

  useEffect(() => {
    if (svgRef.current && cursor.x !== null && cursor.y !== null) {
      const svgRect = svgRef.current.getBoundingClientRect()
      const cxPercentage = ((cursor.x - svgRect.left) / svgRect.width) * 100
      const cyPercentage = ((cursor.y - svgRect.top) / svgRect.height) * 100
      setMaskPosition({
        cx: `${cxPercentage}%`,
        cy: `${cyPercentage}%`,
      })
    }
  }, [cursor])

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 300 100"
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
      className={`select-none cursor-pointer ${className}`}
    >
      <defs>
        <linearGradient id="textGradient" gradientUnits="userSpaceOnUse" cx="50%" cy="50%" r="25%">
          {hovered && (
            <>
              <stop offset="0%" stopColor="#d49217" />
              <stop offset="25%" stopColor="#f4a460" />
              <stop offset="50%" stopColor="#daa520" />
              <stop offset="75%" stopColor="#b8860b" />
              <stop offset="100%" stopColor="#8b6914" />
            </>
          )}
        </linearGradient>

        <motion.radialGradient
          id="revealMask"
          gradientUnits="userSpaceOnUse"
          r="20%"
          initial={{ cx: "50%", cy: "50%" }}
          animate={maskPosition}
          transition={{ duration: 0, ease: "easeOut" }}
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>
        <mask id="textMask">
          <rect x="0" y="0" width="100%" height="100%" fill="url(#revealMask)" />
        </mask>
      </defs>
      {/* Background text */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.3"
        className="fill-transparent stroke-[#645C5A] font-bold text-7xl"
        style={{ opacity: hovered ? 0.7 : 0 }}
      >
        {text}
      </text>
      {/* Animated stroke text */}
      <motion.text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.3"
        className="fill-transparent stroke-[#d49217] font-bold text-7xl"
        initial={{ strokeDashoffset: 1000, strokeDasharray: 1000 }}
        animate={{
          strokeDashoffset: 0,
          strokeDasharray: 1000,
        }}
        transition={{
          duration: 4,
          ease: "easeInOut",
        }}
      >
        {text}
      </motion.text>
      {/* Gradient reveal text */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        stroke="url(#textGradient)"
        strokeWidth="0.3"
        mask="url(#textMask)"
        className="fill-transparent font-bold text-7xl"
      >
        {text}
      </text>
    </svg>
  )
}

const SocialMediaLinks = () => {
  return (
    <div className="flex items-center gap-4">
      {SOCIAL_MEDIA.map((social) => {
        const Icon = social.icon
        return (
          <motion.a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.label}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#d49217] text-white hover:bg-[#b87d14] transition-all duration-300 hover:scale-110"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
          >
            <Icon className="h-5 w-5" />
          </motion.a>
        )
      })}
    </div>
  )
}

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const services = ["Sarees", "Dupattas", "Fabrics", "Home Decor"]
  const navigate = useNavigate();
  const handleWhatsAppClick = () => {
    window.open(
      `https://wa.me/${CONTACT_INFO.whatsappNumber}?text=${encodeURIComponent(
        "Hello Kailash Kalamkari! I would like to inquire about your Products.",
      )}`,
      "_blank",
      "noopener,noreferrer",
    )
  }
  const handlePrivacyPolicy = () => {
    navigate("/privacy-policy");
  }; 
  
  const handleTermsConditions = () => {
    navigate("/terms-conditions");
  };

  

  return (
    <footer className="bg-[#f0ece3] text-[#645C5A] relative overflow-hidden pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div>
                <img
                  src={LOGO_SRC}
                  alt="Kailash Kalamkari Logo"
                  className="h-20 w-auto object-contain p-1"
                  style={{ maxWidth: "110px" }}
                  loading="lazy"
                />
              </div>
            </div>
            <p className="mb-6 text-sm leading-relaxed">
              Each piece is meticulously crafted using organic cotton and natural dyes extracted from plants, making our
              products eco-friendly and sustainable.
            </p>
            <div className="mb-4">
              <p className="text-xs font-semibold text-[#d49217] mb-3 uppercase tracking-wide">Follow Us</p>
              <SocialMediaLinks />
            </div>
            <button
              onClick={handleWhatsAppClick}
              className="bg-[#d49217] hover:bg-[#b87d14] text-white transition-colors px-4 py-2 rounded-md inline-flex items-center"
              aria-label="Contact us on WhatsApp"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              WhatsApp
            </button>
          </div>

          {/* Quick Location */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-[#d49217]">Location</h4>

            <div className="container mx-auto">
              <div className="max-w-xs mx-auto">
                <a
                  href={CONTACT_INFO.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative group"
                  aria-label="View our location on Google Maps"
                >
                  <iframe
                    src={CONTACT_INFO.mapEmbedUrl}
                    width="100%"
                    height="120"
                    style={{ border: 0, borderRadius: "8px" }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="opacity-90 group-hover:opacity-100 transition-opacity"
                    title="Kailash Kalamkari Location Map"
                    tabIndex={-1}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg pointer-events-none">
                    <div className="bg-black bg-opacity-80 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path
                          fillRule="evenodd"
                          d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Get Directions</span>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-[#d49217]">Quick Links</h4>
            <ul className="space-y-2">
              <li className="text-sm">
                <a
                  href="/"
                  className="text-[#d49217] hover:text-[#b87d14] transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = "/";
                  }}
                >
                  Home
                </a>
              </li>
              <li className="text-sm">
                <a
                  href="/products"
                  className="text-[#d49217] hover:text-[#b87d14] transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = "/products";
                  }}
                >
                  Products
                </a>
              </li>
              <li className="text-sm">
                <a
                  href="/gallery"
                  className="text-[#d49217] hover:text-[#b87d14] transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = "/gallery";
                  }}
                >
                  Gallery
                </a>
              </li>
              <li className="text-sm">
                <a
                  href="/about"
                  className="text-[#d49217] hover:text-[#b87d14] transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = "/about";
                  }}
                >
                  About Us
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-[#d49217]">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Phone className="h-4 w-4 mt-1 text-[#d49217] flex-shrink-0" />
                <div>
                  <a href={`tel:${CONTACT_INFO.phone}`} className="text-sm hover:text-[#d49217] transition-colors">
                    {CONTACT_INFO.phone}
                  </a>
                  <p className="text-xs opacity-75">Available 24/7</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Mail className="h-4 w-4 mt-1 text-[#d49217] flex-shrink-0" />
                <div>
                  <a
                    href={`mailto:${CONTACT_INFO.email}`}
                    className="text-sm hover:text-[#d49217] transition-colors break-all"
                  >
                    {CONTACT_INFO.email}
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-1 text-[#d49217] flex-shrink-0" />
                <div>
                  <a
                    href={CONTACT_INFO.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:text-[#d49217] transition-colors"
                  >
                    {CONTACT_INFO.address}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-[#d49217] mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <p className="text-sm">© {currentYear} Kailash Kalamkari. All rights reserved.</p>
            </div>
            <div className="flex space-x-6 text-sm">
              <a onClick={handlePrivacyPolicy} className="hover:text-[#d49217] transition-colors cursor-pointer">
                Privacy Policy
              </a>
              <a onClick={handleTermsConditions} className="hover:text-[#d49217] transition-colors cursor-pointer">
                Terms & Conditions
              </a>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-xs text-[#645C5A]">
              Designed and Maintained by{" "}
              <a
                href="https://www.exploreconsultancyservices.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#d49217] hover:text-[#b87d14] font-semibold transition-colors underline decoration-dotted"
              >
                Explore Consultancy Services
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Text Hover Effect - Hidden on mobile */}
      <div className="hidden lg:flex h-[12rem] -mt-20 -mb-16 relative z-0">
        <TextHoverEffect text="Kailash Kalamkari" />
      </div>

      {/* Background Gradient */}
      <div
        className="absolute inset-0 z-0 opacity-10"
        style={{
          background: "radial-gradient(125% 125% at 50% 10%, #d49217 0%, #f0ece3 100%)",
        }}
      />
    </footer>
  )
}

export default Footer