import PageMeta from '../common/PageMeta';
import { profile } from '../../data/resume';

export default function ResumeView() {
  return (
    <>
      <PageMeta
        title={`${profile.name} — ${profile.title}`}
        description={profile.summary}
        view="resume"
      />
      <main>
        <h1>{profile.name}</h1>
      </main>
    </>
  );
}
