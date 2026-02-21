import './App.css';
import MainCover from './components/MainCover';
import Greeting from './components/Greeting';
import Countdown from './components/Countdown';
import Gallery from './components/Gallery';
import Location from './components/Location';
import Transportation from './components/Transportation';
import Account from './components/Account';
import Rsvp from './components/Rsvp';
import Guestbook from './components/Guestbook';
import Share from './components/Share';
import BgmPlayer from './components/BgmPlayer';
import Footer from './components/Footer';

export default function App() {
  return (
    <>
      <BgmPlayer />
      <MainCover />
      <Greeting />
      <Countdown />
      <Gallery />
      <Location />
      <Transportation />
      <Account />
      <Rsvp />
      <Guestbook />
      <Share />
      <Footer />
    </>
  );
}
