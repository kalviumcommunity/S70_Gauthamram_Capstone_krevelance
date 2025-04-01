import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Layout from "../components/layout/Layout";
import gauthprofile from "../assets/Gautham.jpeg"; 

const Button = ({ className, onClick, children }) => (
  <button className={className} onClick={onClick}>
    {children}
  </button>
);
const GlassCard = ({ className, children }) => (
  <div className={className}>{children}</div>
);

const About = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h2 className="font-bold">About Krevelance</h2>
        <p className="mt-5">
          Learn about our mission to transform financial data analysis
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        <GlassCard className="p-8 bg-[#232323] rounded-lg mb-12 mt-10 text-left">
          <h2 className="text-2xl font-bold mb-4 text-white">Our Mission</h2>
          <p className="text-gray-300 ">
            At Krevelance, we believe that financial data should be accessible,
            understandable, and actionable for businesses of all sizes. Our
            AI-powered platform transforms complex financial information into
            clear, actionable insights that help companies make better
            decisions.
          </p>
        </GlassCard>

        <GlassCard className="p-8 rounded-lg mb-12  bg-[#232323]">
          <p className="text-gray-300 mb-6">
            I am Gautham Ram, CEO and founder of <span className="text-[#0FCE7C] font-bold">Krevelance</span> website. I am
            passionate Software Developer currently pursuing a Bachelor’s in
            Computer Science Engineering at Alliance University, in
            collaboration with Kalvium. I am specializing in Software Product
            Engineering (SPE),where I gain experience in full-stack development,
            AI, blockchain, and software architecture.
          </p>

         
          <div className="flex justify-center">
            <img
              src={gauthprofile}
              alt="Gautham Ram Profile"
              className="rounded-full w-48 h-48 object-cover"
            />
          </div>
          <h2 className="text-2xl mt-4">Gautham Ram </h2>
          <h3 className="font-semibold text-xl mt-4 px-3 py-1 text-[#0FCE7C] bg-[#0F2F0F] rounded-3xl w-1/3 flex justify-center items-center mx-auto">CEO & Founder of Krevelance</h3>
        </GlassCard>
      </div>
    </Layout>
  );
};

export default About;
