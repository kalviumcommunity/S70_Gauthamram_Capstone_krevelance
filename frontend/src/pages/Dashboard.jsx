import React from 'react';
import WelcomeHeader from '../components/dashboard/WelcomeHeader';
import StatCardsSection from '../components/dashboard/StatCardsSection';
import ChartsSection from '../components/dashboard/ChartsSection';
import Navbar1 from '../components/layout/Navbar1';

const Dashboard = () => {
  const revenueData = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 6000 },
    { name: 'Mar', value: 8000 },
    { name: 'Apr', value: 10000 },
    { name: 'May', value: 12000 },
    { name: 'Jun', value: 16000 },
    { name: 'Jul', value: 18000 },
    { name: 'Aug', value: 20000 },
    { name: 'Sep', value: 19000 },
    { name: 'Oct', value: 22000 },
    { name: 'Nov', value: 25000 },
    { name: 'Dec', value: 30000 },
  ];

  const expensesData = [
    { name: 'Jan', value: 2000 },
    { name: 'Feb', value: 2200 },
    { name: 'Mar', value: 3000 },
    { name: 'Apr', value: 4000 },
    { name: 'May', value: 4500 },
    { name: 'Jun', value: 5000 },
    { name: 'Jul', value: 5500 },
    { name: 'Aug', value: 6000 },
    { name: 'Sep', value: 5800 },
    { name: 'Oct', value: 6500 },
    { name: 'Nov', value: 7000 },
    { name: 'Dec', value: 7500 },
  ];

  const profitData = [
    { name: 'Jan', value: 2000 },
    { name: 'Feb', value: 3800 },
    { name: 'Mar', value: 5000 },
    { name: 'Apr', value: 6000 },
    { name: 'May', value: 7500 },
    { name: 'Jun', value: 11000 },
    { name: 'Jul', value: 12500 },
    { name: 'Aug', value: 14000 },
    { name: 'Sep', value: 13200 },
    { name: 'Oct', value: 15500 },
    { name: 'Nov', value: 18000 },
    { name: 'Dec', value: 22500 },
  ];


  return (
    
      <div className="page-container py-18">
        <Navbar1/>
        <WelcomeHeader />
        <StatCardsSection />
        <ChartsSection revenueData={revenueData} profitData={profitData} />
      </div>
    
  );
};

export default Dashboard;
