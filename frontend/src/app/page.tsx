"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [paymentID, setPaymentID] = useState("");
  const [qrURL, setQrURL] = useState("");
  const [status, setStatus] = useState("waiting");

  useEffect(() => {
    async function init() {
      // const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/create-payment`);
      const res = await fetch(`/api/create-payment`);
      console.log("🚀 ~ init ~ res:", res)
      const data = await res.json();
      setPaymentID(data.paymentID);
      setQrURL(data.qrURL);

      // const es = new EventSource(`${process.env.NEXT_PUBLIC_BACKEND_URL}/events/${data.paymentID}`);
      const es = new EventSource(`/api/events/${data.paymentID}`);
      es.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.status === "success") {
          setStatus("success");
          es.close();
        }
      };
    }
    init();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>QR Payment Demo</h1>
      {qrURL && <Image src={qrURL} alt="QR Code" />}
      <p>Payment ID: {paymentID}</p>
      <p>Status: {status}</p>
      {status === "success" && <div style={{ color: "green", fontWeight: "bold" }}>✅ Payment Success!</div>}
      <br />
      <button
      className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={async () => {
          // await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/simulate-payment/${paymentID}`, { method: "POST" });
          await fetch(`/api/simulate-payment/${paymentID}`, { method: "POST" })

        }}
        disabled={!paymentID}
      >
        Simulate Payment
      </button>
    </div>
  );
}
