import PageMeta from '../common/PageMeta';
import { profile } from '../../data/resume';

export default function CyberView() {
  return (
    <>
      <PageMeta
        title={`${profile.initials} // ${profile.title}`}
        description={profile.headline}
        view="cyber"
      />
      <main>
        <h1>{profile.name}</h1>
      </main>
    </>
  );
}
