import { useEffect } from 'react';

export default function Utteranc() {
  useEffect(() => {
    let script = document.createElement('script');
    let anchor = document.getElementById('inject-comments-for-uterances');
    script.setAttribute('src', 'https://utteranc.es/client.js');
    script.setAttribute('crossorigin', 'anonymous');
    script.setAttribute('async', 'true');
    script.setAttribute('repo', 'NietoCurcio/Ignite-prismic-nextjs');
    script.setAttribute('issue-term', 'pathname');
    script.setAttribute('theme', 'github-dark');
    script.setAttribute('label', 'Utterances-comment');
    anchor.appendChild(script);
  }, []);

  return <div id="inject-comments-for-uterances"></div>;
}
