export const posts = [
  {
    slug: 'a-minute-at-sixty-watts',
    title: 'A minute at sixty watts',
    description: 'A load cycle with a known energy budget tests the recorder outside a motion experiment.',
    date: '2026-11-22',
  },
  {
    slug: 'before-the-trigger',
    title: 'What happened before the trigger?',
    description: 'Keeping the release in a gyroscope recording, down to the sample that crosses the threshold.',
    date: '2026-11-21',
  },
  {
    slug: 'ten-swings',
    title: 'Ten swings, one measurement',
    description: 'A pendulum gives the first instrument a question with an answer you can check by hand.',
    date: '2026-11-21',
  },
  {
    slug: 'between-two-samples',
    title: 'What lives between two samples?',
    description: 'Three readings show why sample count and time coverage belong beside an average.',
    date: '2026-11-21',
  },
  {
    slug: 'a-clock-for-each-source',
    title: 'A clock for each source',
    description: 'Two probes can report the same timestamp for events that happened minutes apart.',
    date: '2026-11-21',
  },
];

export function postDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(date + 'T12:00:00Z'));
}

export function postList(prefix) {
  return '<ul class="post-list">' + posts.map(post => `<li><a href="${prefix}${post.slug}/">
<time datetime="${post.date}">${postDate(post.date)}</time><div><h3>${post.title}</h3><p>${post.description}</p></div></a></li>`).join('') + '</ul>';
}
