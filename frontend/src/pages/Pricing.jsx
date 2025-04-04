import React, { useState, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Root, Thumb } from '@radix-ui/react-switch';
import { CheckIcon } from 'lucide-react';
import Navbar from '../components/layout/Navbar';

const cn = (...args) => args.filter(Boolean).join(' ');

const Switch = forwardRef((props, ref) => {
  const { className, ...otherProps } = props;
  return (
    <> <Navbar />
    <Root
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2  transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-white data-[state=unchecked]:bg-black",
        className
      )}
      {...otherProps}
      ref={ref}
    >
      <Thumb
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-[#0FCE64] shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
        )}
      />
    </Root>
    </>
  );
});
Switch.displayName = 'Switch';

const GlassCard = ({ className, children, ...props }) => {
  return (
    <div
      className={`bg-[#1C1919] backdrop-blur-md rounded-xl  shadow-lg border border-white/10 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const PageHeader = ({ title, description, children, className, centered = false }) => {
  return (
    <div className={`mb-8 mt-4 ${centered ? 'text-center' : ''} ${className}`}>
      <h1 className="text-3xl font-bold mb-2 text-white">{title}</h1>
      {description && (
        <p className="text-gray-400">{description}</p>
      )}
      {children}
    </div>
  );
};

const PricingCard = ({ title, price, description, features, buttonText, isPopular = false, className }) => {
  return (
    <>
      <GlassCard
        className={`h-full overflow-hidden transition-all duration-300 ${
          isPopular ? 'border-[#0FCE7C]/50 scale-105 z-10 shadow-xl' : 'border-white/5'
        } ${className}`}
      >
        {isPopular && (
          <div className="bg-[#0FCE7C] text-black text-xs font-medium py-1 px-4 text-center rounded-t-xl">
            Most Popular
          </div>
        )}
        <div className="p-6">
          <h3 className="text-xl font-medium text-white mb-2">{title}</h3>
          <div className="mb-4">
            <span className="text-3xl font-bold text-white">{price}</span>
            {price !== 'Free' && <span className="text-gray-400 ml-1">/month</span>}
          </div>
          <p className="text-gray-400 text-sm mb-6">{description}</p>

          <button
            className={`w-full mb-6 rounded-lg h-10 hover:scale-105  ${
              isPopular
                ? 'bg-[#0FCE7C] hover:bg-[#0FCE96] text-white'
                : 'bg-[#0FCE7C] hover:bg-[#0FCE96] text-white'
            }`}
          >
            {buttonText}
          </button>

          <div className="space-y-3">
            {features.map((feature, index) => {
              return (
                <div key={index} className="flex items-start">
                  <div
                    className={`h-5 w-5 rounded-full flex items-center justify-center mr-3 mt-0.5 ${
                      feature.included
                        ? 'bg-[#0FCE7C]/20 text-[#0FCE7C]'
                        : 'bg-gray-800/50 text-gray-600'
                    }`}
                  >
                    {feature.included && <CheckIcon className="h-3 w-3 rounded-full " />}
                  </div>
                  <span className={feature.included ? 'text-gray-300' : 'text-gray-500'}>
                    {feature.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </GlassCard>
    </>
  );
};

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const navigate = useNavigate();

  const toggleBilling = () => {
    setIsAnnual(!isAnnual);
  };

  const basicFeatures = [
    { text: 'Basic Financial Analysis', included: true },
    { text: 'Up to 5 Financial Reports', included: true },
    { text: 'Data Export', included: true },
    { text: 'Email Support', included: true },
  ];

  const proFeatures = [
    { text: 'Advanced Financial Analysis', included: true },
    { text: 'Unlimited Financial Reports', included: true },
    { text: 'Data Export ', included: true },
    { text: 'Email Support', included: true },
    { text: 'AI-Powered Insights', included: true },
  ];

  const enterpriseFeatures = [
    { text: 'Enterprise Financial Analysis', included: true },
    { text: 'Unlimited Financial Reports', included: true },
    { text: 'Data Export ', included: true },
    { text: 'Email & Phone Support', included: true },
    { text: 'Advanced AI-Powered Insights', included: true },
    { text: 'Custom Reports ', included: true },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12 justify-center items-center">
        <PageHeader
          title="Choose Your Plan"
          description="Select the perfect plan for your business needs. All plans include a 14-day free trial."
          centered
        />

        <div className="flex items-center justify-center mb-12">
          <span
            className={`mr-3 text-sm ${
              !isAnnual ? 'text-[#0FCE7C] justify-center font-medium' : 'text-white'
            }`}
          >
            Monthly
          </span>
          <Switch checked={isAnnual} onCheckedChange={toggleBilling} />
          <span
            className={`ml-3 text-sm ${
              isAnnual ? 'text-[#0FCE7C] font-medium' : 'text-white'
            }`}
          >
            Annual
            <span className="bg-[#0F2F0F] text-[#0FCE7C] px-2 py-0.5 rounded text-xs ml-1">
              Save 20%
            </span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left  ">
          <PricingCard
            title="Basic"
            price={isAnnual ? '₹399' : '₹699'}
            description="Perfect for startups and small businesses"
            features={basicFeatures}
            buttonText="Start"
          />

          <PricingCard
            title="Professional"
            price={isAnnual ? '₹799' : '₹999'}
            description="Ideal for growing businesses and teams"
            features={proFeatures}
            buttonText="Start"
            isPopular
          />

          <PricingCard
            title="Enterprise"
            price={isAnnual ? '₹1999' : '₹2399'}
            description="For organizations with complex needs"
            features={enterpriseFeatures}
            buttonText="start"
          />
        </div>

        <div className="mt-20 text-left">
          <GlassCard className="max-w-5xl mx-auto p-10">
            <h3 className="text-2xl font-bold mb-6 text-center text-white">
              Frequently Asked Questions
            </h3>

            <div className="space-y-6">

              <div>
                <h4 className="text-lg font-medium text-white mb-2">
                  Can I switch plans later?
                </h4>
                <p className="text-gray-400">
                  Yes, you can upgrade or downgrade your plan at any time. If you
                  upgrade, the new pricing will be applied immediately. If you
                  downgrade, the new pricing will be applied on your next billing
                  cycle.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-medium text-white mb-2">
                  What payment methods do you accept?
                </h4>
                <p className="text-gray-400">
                  We accept PayPal, and Razor pay for
                  annual plans. Enterprise plans can also be paid via invoice.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-medium text-white mb-2">
                  How secure is my financial data?
                </h4>
                <p className="text-gray-400">
                  We use bank-level encryption and security protocols to protect
                  your data. All information is encrypted.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
