"use client"
import { Phone } from "lucide-react"

export default function ContactPage() {
  const contactMethods = [
    {
      icon: <Phone className="w-8 h-8" />,
      title: "PHONE",
      value: "(123) 456-7890",
    },
  ]

  return (
    <div className="container mx-auto py-16">
      <h1 className="text-3xl font-bold mb-8">Contact Us</h1>
      <ul className="space-y-6">
        {contactMethods.map((method) => (
          <li key={method.title} className="flex items-center space-x-4">
            {method.icon}
            <div>
              <p className="text-sm font-semibold text-gray-500">{method.title}</p>
              <p className="text-lg">{method.value}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
