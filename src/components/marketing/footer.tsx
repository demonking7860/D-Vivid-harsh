import { FOOTER_LINKS } from "@/constants";
import Link from "next/link";
import Container from "../global/container";
import Icons from "../global/icons";
import Wrapper from "../global/wrapper";
import { Button } from "../ui/button";
import { Particles } from "../ui/particles";
import { BackgroundBeams } from "../ui/background-beams";
import { Facebook, Linkedin, Youtube } from "lucide-react";

const Footer = () => {
    return (
        <footer className="w-full py-10 relative bg-slate-950">
            <Container>
                <Wrapper className="relative pb-10 overflow-hidden footer">
                    <BackgroundBeams className="absolute inset-0 w-full z-0" />
                    
                    {/* Main Footer Content */}
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
                        
                        {/* Company Info */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <Icons.icon className="w-6 h-6" />
                                <span className="text-2xl font-bold">
                                    D-Vivid
                                </span>
                            </div>
                            <p className="text-base text-muted-foreground mb-6">
                                Your trusted partner for studying abroad with expert guidance and support.
                            </p>
                            <Button>
                                <Link href="/contact">
                                    Get Started
                                </Link>
                            </Button>
                        </div>

                        {/* Footer Links */}
                        {FOOTER_LINKS?.map((section, index) => (
                            <div key={index} className="flex flex-col">
                                <h4 className="text-lg font-semibold mb-4 text-foreground">
                                    {section.title}
                                </h4>
                                <ul className="space-y-3">
                                    {section.links.map((link, linkIndex) => (
                                        <li key={linkIndex}>
                                            <Link 
                                                href={link.href} 
                                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {link.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Contact Information */}
                    <div id="contact" className="relative z-10 border-t border-border pt-8 mb-8">
                        <h4 className="text-lg font-semibold mb-6 text-foreground">Contact Us</h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            
                            {/* Ahmedabad Offices */}
                            <div>
                                <h5 className="text-base font-medium mb-4 text-foreground">Ahmedabad Offices:</h5>
                                <div className="space-y-4 text-sm text-muted-foreground">
                                    <p>B-3, 2nd Floor, Safal Profitaire, Corporate Rd, Prahlad Nagar, Ahmedabad, Gujarat 380015</p>
                                    <p>401, Omkar Plaza, Bhakti Circle, Raspan Cross Rd, New India Colony, Nikol, Ahmedabad, Gujarat 382350</p>
                                    <p>501, 5th Floor, Rajdeep Dreams, Rambaug Kankariya Rd, beside IDBI Bank, Prankunj Society, Pushpkunj, Maninagar, Ahmedabad, Gujarat 380008</p>
                                </div>
                            </div>

                            {/* Surat Offices */}
                            <div>
                                <h5 className="text-base font-medium mb-4 text-foreground">Surat Offices:</h5>
                                <div className="space-y-4 text-sm text-muted-foreground">
                                    <p>531, Laxmi Enclave -2, opp. Gajera International School, Katargam</p>
                                    <p>452, Opera Business Hub, Lajamni Chowk, Maruti Dham Society, Mota Varachha, Surat</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Social Media & Copyright */}
                    <div className="relative z-10 border-t border-border pt-8">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <p className="text-sm text-muted-foreground">
                                © {new Date().getFullYear()} D-Vivid Consultant. All Rights Reserved.
                            </p>
                            <div className="flex items-center gap-1">
                                <span className="text-sm text-muted-foreground mr-4">Follow Us On:</span>
                                <Link href="#" className="p-2 hover:bg-accent rounded-md transition-colors">
                                    <Facebook className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                                </Link>
                                <Link href="#" className="p-2 hover:bg-accent rounded-md transition-colors">
                                    <Icons.instagram className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                                </Link>
                                <Link href="#" className="p-2 hover:bg-accent rounded-md transition-colors">
                                    <Linkedin className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                                </Link>
                                <Link href="#" className="p-2 hover:bg-accent rounded-md transition-colors">
                                    <Youtube className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </Wrapper>
            </Container>
        </footer>
    )
};

export default Footer
