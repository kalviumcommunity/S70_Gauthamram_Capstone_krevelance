import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import FeatureCard from "../components/ui-custom/FeatureCard";
import LineChart from '../components/ui-custom/LineChart';
import "../index.css";
import {
  ChevronRight,
  BarChart3,
  TrendingUp,
  FileText,
  Shield,
  Database,
  Zap,
} from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);


  useEffect(() => {
    setIsVisible(true);

    const token = localStorage.getItem('authToken');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const data = [
    { name: "Jan", value: 4000 },
    { name: "Feb", value: 6000 },
    { name: "Mar", value: 8000 },
    { name: "Apr", value: 10000 },
    { name: "May", value: 12000 },
    { name: "Jun", value: 16000 },
    { name: "Jul", value: 18000 },
    { name: "Aug", value: 20000 },
    { name: "Sep", value: 19000 },
    { name: "Oct", value: 22000 },
    { name: "Nov", value: 25000 },
    { name: "Dec", value: 30000 },
  ];

  const features = [
    {
      title: "Financial Analysis",
      description:
        "Advanced financial metrics and KPIs to track your business performance.",
      icon: <BarChart3 size={36} />,
    },
    {
      title: "AI-Powered Insights",
      description:
        "Machine learning algorithms that provide predictive analytics for your business.",
      icon: <Zap size={36} />,
    },
    {
      title: "Revenue Tracking",
      description:
        "Track your revenue streams and identify growth opportunities.",
      icon: <TrendingUp size={36} />,
    },
    {
      title: "Report Generation",
      description: "Generate comprehensive financial reports for stakeholders.",
      icon: <FileText size={36} />,
    },
    {
      title: "Data Security",
      description:
        "Bank-level encryption and security protocols to protect your financial data.",
      icon: <Shield size={36} />,
    },
    {
      title: "Data Integration",
      description: "Connect with your existing financial tools and databases.",
      icon: <Database size={36} />,
    },
  ];

  return (
    <Layout>
      <section className="relative min-h-[90vh] flex items-center max-w-7xl mx-auto">
        <div className="container mx-auto px-4 z-10">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            <div className="lg:w-1/2 space-y-6">
              <div className="text-left">
                <span className=" px-3 py-1 rounded-full bg-[#0F2F0F] text-sm font-medium ">
                  Financial Intelligence Platform
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl text-left lg:text-7xl font-bold">
                Transform Your Financial Data Into{" "}
                <span>Actionable Insights</span>
              </h1>
              <p className="text-lg text-left text-gray-400">
                Krevelance combines AI technology with financial expertise to
                help businesses make data-driven decisions. Unlock the power of
                your financial data today.
              </p>
              <div className="flex gap-4">
                <button
                  className="bg-[#0FCE7C] p-3 font-semibold text-base text-black hover:scale-105 rounded-xl   flex items-center justify-center "
                  onClick={() => navigate("/signup")}
                >
                  Get Started <ChevronRight className="mt-1" />
                </button>

              </div>
            </div>
            <div className="lg:w-1/2">
              <LineChart data={data} height={350} title="Revenue Growth" subtitle="Monthly revenue in Rupees" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto">
        <div className="w-1/9 mb-4  mx-auto">
          <h2 className="px-3 py-1  rounded-full bg-[#0F2F0F] text-sm font-medium text-[#0FCE7C]">
            Key Features
          </h2>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Everything You Need for Financial Success
        </h2>
        <p className="text-gray-400 max-w-2xl p-2 mx-auto">
          Our platform provides all the tools you need to analyze, track, and
          improve your financial performance.
        </p>

        <div className="grid grid-cols-1 text-left md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
            />
          ))}
        </div>
      </section>

      <section className="py-20 bg-black max-w-7xl mx-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row  items-center justify-between glass-card p-8 md:p-12 rounded-xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#0F2F0F] to-black opacity-50 z-0"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0FCE7C] to-[#0FCE96] animate-progress-line"></div>

            <div className="z-10 mb-8 lg:mb-0 flex ml-42 flex-col items-center text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Ready to Transform Your Financial Analysis?
              </h2>
              <p className="text-gray-400  max-w-lg">
                Join thousands of businesses that use Krevelance to make better
                financial decisions. Start your free trial today - no credit
                card required.
              </p>
            </div>

            <div className="z-10">
              <button
                className="bg-white hover:bg-[#0FCE7C] hover:scale-105 rounded flex text-black font-medium px-4 py-3"
                onClick={() => navigate("/signup")}
              >
                Get Started Now <ChevronRight className="ml-1 mt-1 h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Landing;
