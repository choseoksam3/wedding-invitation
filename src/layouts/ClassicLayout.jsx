import MainCover from '../components/MainCover';
import Greeting from '../components/Greeting';
import Countdown from '../components/Countdown';
import CalendarSave from '../components/CalendarSave';
import Gallery from '../components/Gallery';
import Location from '../components/Location';
import Transportation from '../components/Transportation';
import Account from '../components/Account';
import Guestbook from '../components/Guestbook';
import Share from '../components/Share';
import Footer from '../components/Footer';

export default function ClassicLayout() {
  return (
    <>
      <MainCover />
      <Greeting />
      <Countdown />
      <CalendarSave variant="classic" standalone />
      <Gallery />
      <Location />
      <Transportation />
      <Account />
      <Guestbook />
      <Share />
      <Footer />
    </>
  );
}
