import CheckoutContainer from '@/components/modules/CommonModules/checkout/CheckoutContainer'
import React from 'react'

export default async function CheckoutPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  // Handle async params for Next.js 15
  const resolvedParams = params instanceof Promise ? await params : params;
  
  return (
    <CheckoutContainer templateId={resolvedParams.id} />
  )
}
