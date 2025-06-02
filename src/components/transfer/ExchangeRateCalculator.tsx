
import React from 'react';
import PremiumFeeCalculator from './PremiumFeeCalculator';

interface ExchangeRateCalculatorProps {
  exchangeRates: any[];
}

const ExchangeRateCalculator: React.FC<ExchangeRateCalculatorProps> = ({ exchangeRates }) => {
  return <PremiumFeeCalculator exchangeRates={exchangeRates} />;
};

export default ExchangeRateCalculator;
