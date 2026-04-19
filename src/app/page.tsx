import Navbar from '@/components/Navbar';
import ProfileCard from '@/components/ProfileCard';
import StatsOverview from '@/components/StatsOverview';
import MatchCalendar from '@/components/MatchCalendar';
import MatchHistory from '@/components/MatchHistory';
import GuildRankings from '@/components/GuildRankings';
import GuidesSection from '@/components/GuidesSection';
import FeedbackSection from '@/components/FeedbackSection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--theme-bg-page)]">
      {/* Content */}
      <div>
        <Navbar />
        <main className="pt-16">
          <ProfileCard />
          <StatsOverview />
          <MatchCalendar />
          <MatchHistory />
          <GuildRankings />
          <GuidesSection />
          <FeedbackSection />
        </main>
        <Footer />
      </div>
    </div>
  );
}
