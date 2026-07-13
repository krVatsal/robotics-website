import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import WhoAreWe from "@/components/who-are-we"
import Purpose from "@/components/purpose"
import TechStack from "@/components/tech-stack"
import BentoProjects from "@/components/bento-projects"
import CarTimeline from "@/components/car-timeline"
import Achievements from "@/components/achievements"
import FAQ from "@/components/faq"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <Navbar />
      <Hero />
      <WhoAreWe />
      <Purpose />
      <TechStack />
      <BentoProjects />
      <CarTimeline />
      <Achievements />
      <FAQ />
      <Footer />
    </main>
  )
}
