
import React from 'react';
import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/about/HeroSection';
import OurStorySection from '@/components/about/OurStorySection';
import CoreValuesSection from '@/components/about/CoreValuesSection';
import TeamSection from '@/components/about/TeamSection';
import WhyChooseUsSection from '@/components/about/WhyChooseUsSection';
import ContactSection from '@/components/about/ContactSection';

const About = () => {
  return (
    <Layout>
      <HeroSection />
      <OurStorySection />
      <CoreValuesSection />
      <TeamSection />
      <WhyChooseUsSection />
      <ContactSection />
    </Layout>
  );
};

export default About;
