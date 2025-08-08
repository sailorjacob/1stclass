export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-neutral-900 text-white">
      <div className="container mx-auto px-8 py-24 max-w-3xl">
        <h1 className="text-4xl font-light tracking-wider mb-6">Privacy Policy</h1>
        <p className="text-white/70 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <section className="space-y-4 text-white/80 leading-relaxed">
          <p>
            1st Class Studios respects your privacy. This policy explains what information we collect,
            how we use it, and your choices.
          </p>

          <h2 className="text-2xl text-white mt-8">Information We Collect</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>Booking details such as name, email, phone, room, date/time, and preferences.</li>
            <li>Payment information is processed securely by Stripe; we do not store full card details.</li>
            <li>Optional messages or project notes you provide.</li>
          </ul>

          <h2 className="text-2xl text-white mt-8">How We Use Information</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>To schedule and manage your booking and communicate updates.</li>
            <li>To process payments and prevent fraud.</li>
            <li>With your consent, to send SMS notifications and occasional marketing messages.</li>
          </ul>

          <h2 className="text-2xl text-white mt-8">SMS & Marketing</h2>
          <p>
            If you opt in, we may send SMS messages about your booking and promotions. Message frequency varies.
            Message & data rates may apply. Text HELP to (475) 229‑9564. Reply STOP to unsubscribe.
          </p>

          <h2 className="text-2xl text-white mt-8">Sharing</h2>
          <p>
            We may share limited booking data with our service providers (e.g., Stripe for payment processing,
            GoHighLevel for CRM) to deliver our services. We do not sell your personal information.
          </p>

          <h2 className="text-2xl text-white mt-8">Your Choices</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>You can opt out of marketing SMS at any time by replying STOP.</li>
            <li>You may request access, correction, or deletion of your data where applicable.</li>
          </ul>

          <h2 className="text-2xl text-white mt-8">Contact</h2>
          <p>
            Questions about this policy? Call <a className="underline" href="tel:203-826-8911">203‑826‑8911</a> or
            text <a className="underline" href="sms:475-229-9564">475‑229‑9564</a>.
          </p>
        </section>
      </div>
    </main>
  )
}

