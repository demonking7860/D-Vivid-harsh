"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PixelatedCanvas } from "@/components/ui/pixelated-canvas";
import { Mail, Phone, MapPin, Globe, Linkedin, Instagram, Facebook, Youtube } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

const contactInfo = {
  email: "info@dvividconsultant.com",
  phone: "+91 7575020920",
  ahmedabadOffices: [
    "B-3, 2nd Floor, Safal Profitaire, Corporate Rd, Prahlad Nagar, Ahmedabad, Gujarat 380015",
    "401, Omkar Plaza, Bhakti Circle, Raspan Cross Rd, New India Colony, Nikol, Ahmedabad, Gujarat 382350",
    "501, 5th Floor, Rajdeep Dreams, Rambaug Kankariya Rd, beside IDBI Bank, Prankunj Society, Pushpkunj, Maninagar, Ahmedabad, Gujarat 380008"
  ],
  suratOffices: [
    "531, Laxmi Enclave -2, opp. Gajera International School, Katargam",
    "452, Opera Business Hub, Lajamni Chowk, Maruti Dham Society, Mota Varachha, Surat"
  ],
};

const socialLinks = [
  { name: "Website", icon: Globe, href: "https://d-vivid-consultant.vercel.app", color: "text-blue-400" },
  { name: "LinkedIn", icon: Linkedin, href: "https://www.linkedin.com/company/dvividconsultant/", color: "text-blue-600" },
  { name: "Instagram", icon: Instagram, href: "https://www.instagram.com/dvividconsultant/", color: "text-pink-500" },
  { name: "Facebook", icon: Facebook, href: "https://www.facebook.com/dvividconsultant?mibextid=LQQJ4d", color: "text-blue-500" },
  { name: "YouTube", icon: Youtube, href: "https://www.youtube.com/@abroadgnangurudvivid", color: "text-red-600" },
];

export default function ConsultationCard({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-neutral-900 border-neutral-800">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Left Side: Contact Details */}
          <div className="p-6 lg:p-8 space-y-5 bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800">
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
                Book a Free Consultation
              </DialogTitle>
              <DialogDescription className="text-neutral-400 text-sm">
                Connect with our expert consultants to start your study abroad journey
              </DialogDescription>
            </DialogHeader>

            {/* Contact Information */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 group">
                <div className="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                  <Mail className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white text-sm mb-1">Email</div>
                  <a 
                    className="text-neutral-400 hover:text-purple-400 transition-colors text-xs" 
                    href={`mailto:${contactInfo.email}`}
                  >
                    {contactInfo.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 group">
                <div className="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                  <Phone className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white text-sm mb-1">Phone</div>
                  <a 
                    className="text-neutral-400 hover:text-purple-400 transition-colors text-xs" 
                    href={`tel:${contactInfo.phone}`}
                  >
                    {contactInfo.phone}
                  </a>
                </div>
              </div>






              <div className="flex items-start gap-3 group">
                <div className="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                  <MapPin className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white text-sm mb-2">Office Locations</div>
                  
                  {/* Ahmedabad Offices */}
                  <div className="space-y-2 mb-3">
                    <div className="font-medium text-purple-400 text-xs">Ahmedabad Offices:</div>
                    {contactInfo.ahmedabadOffices.map((address, index) => (
                      <div key={index} className="text-neutral-400 text-xs pl-2 border-l border-purple-500/30">
                        {address}
                      </div>
                    ))}
                  </div>
                  
                  {/* Surat Offices */}
                  <div className="space-y-2">
                    <div className="font-medium text-purple-400 text-xs">Surat Offices:</div>
                    {contactInfo.suratOffices.map((address, index) => (
                      <div key={index} className="text-neutral-400 text-xs pl-2 border-l border-purple-500/30">
                        {address}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="pt-4 border-t border-neutral-800">
              <div className="font-semibold text-white text-sm mb-3">Connect With Us</div>
              <div className="flex flex-wrap gap-2">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-800 hover:border-purple-500/50 bg-neutral-800/50 hover:bg-neutral-800 transition-all text-xs group"
                    >
                      <Icon className={`w-3.5 h-3.5 ${social.color} group-hover:scale-110 transition-transform`} />
                      <span className="text-neutral-300 group-hover:text-white">{social.name}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Side: Founder Photo with Pixelated Canvas */}
          <div className="relative bg-black p-2 flex items-center justify-center overflow-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {open && (
              <div className="w-full h-full flex items-center justify-center py-4">
      <PixelatedCanvas
        src="images/founder.png"
        width={420}
        height={620}
        cellSize={2}
        dotScale={0.4}
        shape="square"
        backgroundColor="#000000ff"
        dropoutStrength={0.00001}
        interactive
        distortionStrength={3}
        distortionRadius={80}
        distortionMode="swirl"
        followSpeed={0.2}
        jitterStrength={4}
        jitterSpeed={4}
        sampleAverage
        tintColor="#FFFFFF"
        tintStrength={0.2}
        className="rounded-xl border border-neutral-800 shadow-lg"
      />
    </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
