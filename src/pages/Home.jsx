import React from 'react'
import HeroBanner from '../components/HeroBanner'
import ProductHighlights from '../components/ProductHighlights'
import TrustBadges from '../components/TrustBadges'
import FeaturedProducts from '../components/FeaturedProducts'
import ManufacturingVideoEmbed from '../components/RecipeVideoEmbed'
import BulkInquiryBar from '../components/BulkInquiryBar'

export default function Home(){
  return (
    <div className="home-page">
      <HeroBanner />
      <ProductHighlights />
      <TrustBadges />
      <FeaturedProducts />
      <ManufacturingVideoEmbed />
      <BulkInquiryBar />
    </div>
  )
}
