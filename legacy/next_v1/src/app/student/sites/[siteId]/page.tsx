import { getSessionProfile } from '@/lib/auth/session';
import { demoSites, demoMediaAssets } from '@/lib/demo/store';
import { getDemoEvidences, getDemoTasks } from '@/lib/demo/persist';
import { SiteExplorer } from '@/features/sites/site-explorer';

export default async function SitePage({ params }: { params: { siteId: string } }) {
  const { profile } = await getSessionProfile('student');
  const site = demoSites.find((x) => x.id === params.siteId) ?? demoSites[0];
  const siteTasks = getDemoTasks(profile).filter((x) => x.site_id === site.id);
  const evidences = getDemoEvidences('demo-activity-1', profile.id).filter((x: any) => x.site_id === site.id);
  const mediaAssets = demoMediaAssets.filter((x: any) => x.site_id === site.id);

  return <SiteExplorer site={site} sites={demoSites} tasks={siteTasks} mediaAssets={mediaAssets} evidences={evidences} />;
}
