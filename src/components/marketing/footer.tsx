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
                                                target="_blank"
                                                rel="noopener noreferrer"
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
                                    <a 
                                        href="https://www.google.com/maps/place/D+Vivid+Consultant+%7C+Study+Abroad+Consultant+%7C+Student+Visa+Consultant+%7C+Overseas+Consultancy/@23.009787,72.5064509,15z/data=!4m2!3m1!1s0x0:0x23f80d41827bdd5a?sa=X&ved=2ahUKEwjPrK21wIKEAxUcTmwGHZ_BBAkQ_BJ6BAgQEAA&hl=en-IN"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block hover:text-purple-400 transition-colors cursor-pointer"
                                    >
                                        B-3, 2nd Floor, Safal Profitaire, Corporate Rd, Prahlad Nagar, Ahmedabad, Gujarat 380015
                                    </a>
                                    <a 
                                        href="https://www.google.com/maps/place/D+Vivid+Consultant+%7C+Study+Abroad+Consultant+%7C+Student+Visa+Consultant+%7C+Overseas+Consultancy/@23.0500363,72.672839,15z/data=!4m6!3m5!1s0x395e873967e2af39:0xe73720094b49a4e8!8m2!3d23.0500363!4d72.672839!16s%2Fg%2F11l2cpybfq?entry=ttu&g_ep=EgoyMDI1MTAwNi4wIKXMDSoASAFQAw%3D%3D"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block hover:text-purple-400 transition-colors cursor-pointer"
                                    >
                                        401, Omkar Plaza, Bhakti Circle, Raspan Cross Rd, New India Colony, Nikol, Ahmedabad, Gujarat 382350
                                    </a>
                                    <a 
                                        href="https://www.google.com/maps/place/D+Vivid+Consultant+%7C+Study+Abroad+Consultant+%7C+Student+Visa+Consultant+%7C+Overseas+Consultancy+Maninagar+Ahmedabad/@23.0020052,72.5992021,15z/data=!4m6!3m5!1s0x395e8555d18bfad5:0xbaf30bccdd4eeaa0!8m2!3d23.0020052!4d72.5992021!16s%2Fg%2F11vc2ywcbv?hl=en-IN&entry=ttu&g_ep=EgoyMDI1MTAwNi4wIKXMDSoASAFQAw%3D%3D"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block hover:text-purple-400 transition-colors cursor-pointer"
                                    >
                                        501, 5th Floor, Rajdeep Dreams, Rambaug Kankariya Rd, beside IDBI Bank, Prankunj Society, Pushpkunj, Maninagar, Ahmedabad, Gujarat 380008
                                    </a>
                                </div>
                            </div>

                            {/* Surat Offices */}
                            <div>
                                <h5 className="text-base font-medium mb-4 text-foreground">Surat Offices:</h5>
                                <div className="space-y-4 text-sm text-muted-foreground">
                                    <a 
                                        href="https://www.google.com/maps/place/D+Vivid+Consultant+Surat+%7C+Study+abroad+consultant+%7C+Katargam/@21.2322842,72.834286,17z/data=!4m6!3m5!1s0x3be04f8f66a71d81:0x2921c494c87dce14!8m2!3d21.2322792!4d72.8368609!16s%2Fg%2F11vywsvvrr?entry=ttu&g_ep=EgoyMDI1MTAwNi4wIKXMDSoASAFQAw%3D%3D"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block hover:text-purple-400 transition-colors cursor-pointer"
                                    >
                                        531, Laxmi Enclave -2, opp. Gajera International School, Katargam
                                    </a>
                                    <a 
                                        href="https://www.google.com/maps/place/D+Vivid+Consultant+Mota+Varachha/@21.2379804,72.8888158,17z/data=!4m6!3m5!1s0x3be04fa3a01e4843:0xa8e298543970846a!8m2!3d21.2379804!4d72.8888158!16s%2Fg%2F11pysdntj0?entry=ttu&g_ep=EgoyMDI1MTAwNi4wIKXMDSoASAFQAw%3D%3D"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block hover:text-purple-400 transition-colors cursor-pointer"
                                    >
                                        452, Opera Business Hub, Lajamni Chowk, Maruti Dham Society, Mota Varachha, Surat
                                    </a>
                                </div>
                            </div>
                        </div>
                        
                        {/* Contact Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                            <div>
                                <h5 className="text-base font-medium mb-4 text-foreground">Get In Touch:</h5>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium text-foreground">Email:</span>
                                        <a 
                                            href="mailto:info@dvividconsultant.com" 
                                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            info@dvividconsultant.com
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium text-foreground">Phone:</span>
                                        <a 
                                            href="tel:+917575020920" 
                                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            +91 7575020920
                                        </a>
                                    </div>
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
                                <Link href="https://www.facebook.com/dvividconsultant?mibextid=LQQJ4d" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-accent rounded-md transition-colors">
                                    <Facebook className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                                </Link>
                                <Link href="https://www.instagram.com/dvividconsultant/" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-accent rounded-md transition-colors">
                                    <Icons.instagram className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                                </Link>
                                <Link href="https://www.linkedin.com/company/dvividconsultant/" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-accent rounded-md transition-colors">
                                    <Linkedin className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                                </Link>
                                <Link href="https://www.youtube.com/@abroadgnangurudvivid" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-accent rounded-md transition-colors">
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
