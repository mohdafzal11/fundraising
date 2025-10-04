'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';

interface FooterSocial {
  text: string;
  url: string;
  iconUrl: string;
  color: string;
}

interface FooterLink {
  text: string;
  url: string;
}

interface FooterData {
  socials: FooterSocial[];
  company: FooterLink[];
  "quick-links": FooterLink[];
}

interface FooterProps {
  footerData: FooterData;
}

const Footer = ({ footerData }: FooterProps) => {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme();
  
  useEffect(() => {
    setMounted(true)
  }, [theme])

  if (!mounted) {
    return null
  }

  const handleExternalRedirect = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    e.preventDefault();
    window.location.href = url;
  };

  const socialButton = (social: FooterSocial) => (
    <a 
      key={social.text}
      href={social.url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="w-9 h-9 rounded-full flex items-center justify-center text-white hover:opacity-80 transition-all duration-300 hover:scale-110"
      style={{ backgroundColor: social.color }}
      title={social.text}
    >
      <div className="w-5 h-5 flex items-center justify-center">
        <Image
          src={social.iconUrl}
          alt={social.text}
          width={20}
          height={20}
        />
      </div>
    </a>
  );

  return (
    <footer className="w-full bg-background min-h-[500px] flex flex-col px-6 py-10 border-t border-border">
      <div className="max-w-[1400px] mx-auto w-full text-left pb-5">
        <div className="flex justify-between items-center flex-wrap md:flex-nowrap">
          <div className="max-w-[600px]">
            <h2 className="text-2xl font-bold mb-1 text-foreground">Follow Us on Socials</h2>
            <p className="text-sm opacity-80 mt-1 text-muted-foreground">
              We use social media to react to breaking news, update supporters and share information.
            </p>
          </div>
          <div className="flex gap-3 justify-end mt-6 md:mt-0">
            {footerData.socials.map((social) => socialButton(social))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-1.5 my-4 mx-auto max-w-[1400px] w-full bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20preserveAspectRatio%3D%27none%27%20overflow%3D%27visible%27%20height%3D%27100%25%27%20viewBox%3D%270%200%2024%2024%27%20fill%3D%27black%27%20stroke%3D%27none%27%3E%3Cpolygon%20points%3D%279.4%2C2%2024%2C2%2014.6%2C21.6%200%2C21.6%27%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_100%] bg-repeat-x"></div>

      {/* Footer Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr] gap-8 max-w-[1400px] mx-auto py-10">
        {/* Brand Section */}
        <div className="flex flex-col gap-5">
          <div className="w-[200px]">
            <Image
              src={`https://droomdroom.com/price/DroomDroom_${theme === 'light' ? 'Black' : 'White'}.svg`}
              alt="DroomDroom Logo"
              width={240}
              height={40}
              priority
              sizes="200px"
            />
          </div>
          <p className="text-base leading-relaxed font-medium max-w-[400px] text-foreground">
            DroomDroom dedicates thousands of hours of research into the web3 industry to deliver you free, world-class, and accurate content.
          </p>
        </div>

        {/* Company Links */}
        <div className="flex flex-col">
          <h3 className="text-xl font-bold text-foreground relative pb-0 mb-6 pt-5 border-t-[3px] border-t-[#ffa66a]">Company</h3>
          <div className="flex flex-wrap gap-2.5 mt-2.5">
            {footerData.company.map((link, index) => (
              <Link 
                key={index}
                href={link.url} 
                className="inline-block px-4 font-semibold py-2 bg-[#ffa66a] text-foreground text-lg rounded-md transition-all hover:-translate-y-[3px]"
              >
                {link.text}
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col">
          <h3 className="text-xl font-bold text-foreground relative pb-0 mb-6 pt-5 border-t-[3px] border-t-[#ffa66a]">Quick Links</h3>
          <div className="flex flex-wrap gap-2.5 mt-2.5">
            {footerData["quick-links"].map((link, index) => (
              <Link 
                key={index}
                href={link.url} 
                className="inline-block px-4 py-2 bg-[#ffa66a] text-foreground font-semibold text-lg rounded-md transition-all hover:-translate-y-[3px]"
              >
                {link.text}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center text-sm text-foreground pt-5 border-t border-border max-w-[1200px] mx-auto">
        Copyright © 2025 DroomDroom Corporation. All Rights Reserved
      </div>
    </footer>
  );
};

export default Footer;