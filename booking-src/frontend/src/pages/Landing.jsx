import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
      {/* Hero */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="mb-6">
          <span className="text-6xl mb-4 block">🏊</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
          Booking<span className="text-blue-200">SaaS</span>
        </h1>
        <p className="text-lg md:text-xl text-blue-100 max-w-md mb-8">
          Gérez les réservations de vos piscines et villas en un clic.
          Partagez votre lien et laissez vos clients réserver 24h/24.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/villa-hamza"
            className="px-8 py-4 bg-white text-blue-700 font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:bg-blue-50 transition-all text-lg"
          >
            🧪 Voir la démo
          </Link>
          <Link
            to="/dashboard"
            className="px-8 py-4 bg-blue-500/30 backdrop-blur border border-white/30 text-white font-bold rounded-2xl hover:bg-blue-500/50 transition-all text-lg"
          >
            📊 Dashboard
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl w-full">
          <FeatureCard
            icon="📅"
            title="Créneaux horaires"
            desc="Configuration flexible : matin, après-midi, soirée"
          />
          <FeatureCard
            icon="💳"
            title="Paiement 50%"
            desc="Acompte en ligne, solde sur place"
          />
          <FeatureCard
            icon="📱"
            title="WhatsApp Auto"
            desc="Confirmation instantanée par WhatsApp"
          />
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
      <span className="text-3xl mb-3 block">{icon}</span>
      <h3 className="font-bold text-lg mb-1">{title}</h3>
      <p className="text-blue-100 text-sm">{desc}</p>
    </div>
  )
}
