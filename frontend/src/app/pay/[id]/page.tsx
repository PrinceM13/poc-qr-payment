'use client'

import { useParams } from 'next/navigation'

export default function PayPage() {
  const { id: paymentID } = useParams<{ id: string }>()

  return (
    <div style={{ padding: 20 }}>
      <h1>Pay Demo</h1>
      <button
        className="rounded bg-blue-500 px-4 py-2 text-white"
        onClick={async () => {
          await fetch(`/api/simulate-payment/${paymentID}`, { method: 'POST' })
        }}
        disabled={!paymentID}
      >
        Simulate Payment
      </button>
    </div>
  )
}
