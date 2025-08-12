'use client'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function QrPaymentPage() {
  const [paymentID, setPaymentID] = useState('')
  const [qrURL, setQrURL] = useState('')
  const [status, setStatus] = useState('waiting')

  useEffect(() => {
    async function init() {
      const res = await fetch(`/api/create-payment`)
      const data = await res.json()
      setPaymentID(data.paymentID)
      setQrURL(data.qrURL)

      const es = new EventSource(`/api/events/${data.paymentID}`)
      es.onmessage = (event) => {
        const msg = JSON.parse(event.data)
        if (msg.status === 'success') {
          setStatus('success')
          es.close()
        }
      }
    }
    init()
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h1>QR Payment Demo</h1>
      {qrURL && <Image src={qrURL} alt="QR Code" width={200} height={200} />}
      <p>Payment ID: {paymentID}</p>
      <p>Status: {status}</p>
      {status === 'success' && <div style={{ color: 'green', fontWeight: 'bold' }}>✅ Payment Success!</div>}
    </div>
  )
}
