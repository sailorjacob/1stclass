export default function TermsPage() {
  return (
    <main className="min-h-screen bg-neutral-900 text-white">
      <div className="container mx-auto px-8 py-24 max-w-3xl">
        <h1 className="text-4xl font-light tracking-wider mb-6">Terms & Conditions</h1>
        <p className="text-white/70 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <section className="space-y-4 text-white/80 leading-relaxed">
          <p>
            These Terms & Conditions govern your use of the 1st Class Studios website and your
            booking of studio services. By placing a booking or making a payment, you agree to these terms.
          </p>
          <h2 className="text-2xl text-white mt-8">Bookings & Payments</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>A non‑refundable deposit is required to secure your session time.</li>
            <li>The remaining balance is due at the start of your session unless otherwise stated.</li>
            <li>Prices may vary based on room, duration, and whether an engineer is included.</li>
          </ul>

          <h2 className="text-2xl text-white mt-8">Rescheduling & Cancellations</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>To reschedule, please contact us as early as possible; availability is not guaranteed.</li>
            <li>Deposits are generally non‑refundable but may be credited toward a future session at our discretion.</li>
          </ul>

          <h2 className="text-2xl text-white mt-8">Studio Rules</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>Arrive on time; late arrivals may reduce your session length.</li>
            <li>You are responsible for the conduct of your guests and for any damages.</li>
            <li>No illegal substances or activities are permitted on the premises.</li>
          </ul>

          <h2 className="text-2xl text-white mt-8">SMS Communications</h2>
          <p>
            By opting in, you agree to receive SMS notifications and occasional marketing messages from 1st Class
            Studios. Message frequency varies. Message & data rates may apply. Text HELP to (475) 229‑9564 for
            assistance. Reply STOP to unsubscribe at any time.
          </p>

          <h2 className="text-2xl text-white mt-8">Contact</h2>
          <p>
            Questions about these terms? Contact us at <a className="underline" href="tel:203-826-8911">203‑826‑8911</a>
            {' '}or text <a className="underline" href="sms:475-229-9564">475‑229‑9564</a>.
          </p>
        </section>
      </div>
    </main>
  )
}

