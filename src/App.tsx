/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { FabricSpecsSection } from './components/FabricSpecsSection';
import { PricingTierBanner } from './components/PricingTierBanner';
import { InteractiveOrderSection } from './components/InteractiveOrderSection';
import { FAQSection } from './components/FAQSection';
import { Footer } from './components/Footer';
import { SuccessConfirmationModal } from './components/SuccessConfirmationModal';
import { SizeGuideModal } from './components/SizeGuideModal';
import { TrackOrderModal } from './components/TrackOrderModal';
import { StoredOrder } from './types';

export default function App() {
  const [successOrder, setSuccessOrder] = useState<StoredOrder | null>(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState<boolean>(false);
  const [isOrderLookupOpen, setIsOrderLookupOpen] = useState<boolean>(false);

  const handleScrollToOrder = () => {
    const el = document.getElementById('order-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectPricingTier = () => {
    handleScrollToOrder();
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col font-sans selection:bg-[#38BDF8]/30 selection:text-[#38BDF8]">
      {/* Top Header */}
      <Header
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onOpenOrderLookup={() => setIsOrderLookupOpen(true)}
        onScrollToOrder={handleScrollToOrder}
      />

      {/* Main Landing Page Content */}
      <main className="flex-1">
        {/* Hero Section with Dedicated Video Player & Countdown */}
        <HeroSection
          onScrollToOrder={handleScrollToOrder}
          onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        />

        {/* Fabric & Silk Screen Printing Showcase (Front & Back View Cards) */}
        <FabricSpecsSection />

        {/* Pricing Tiers & Team Discount (600 / 550 EGP) */}
        <PricingTierBanner onSelectTier={handleSelectPricingTier} />

        {/* Interactive Order Form Section (Individual & Team 5+) */}
        <InteractiveOrderSection
          onOrderSuccess={(order) => setSuccessOrder(order)}
          onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        />

        {/* FAQs */}
        <FAQSection />
      </main>

      {/* Footer */}
      <Footer
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onOpenOrderLookup={() => setIsOrderLookupOpen(true)}
        onScrollToOrder={handleScrollToOrder}
      />

      {/* Modals & Dialogs */}
      <SuccessConfirmationModal
        order={successOrder}
        onClose={() => setSuccessOrder(null)}
        onNewOrder={() => {
          setSuccessOrder(null);
          handleScrollToOrder();
        }}
      />

      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />

      <TrackOrderModal
        isOpen={isOrderLookupOpen}
        onClose={() => setIsOrderLookupOpen(false)}
      />
    </div>
  );
}
