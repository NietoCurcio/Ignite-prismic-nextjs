import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import Link from 'next/link';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { FaUser, FaCalendar, FaRegCalendar, FaRegUser } from 'react-icons/fa';
import { useState } from 'react';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

function parseData(postsResponse: PostPagination) {
  const parsed = postsResponse.results.map((post: Post) => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      // o correto seria formatar a data aqui
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });
  return parsed;
}

export default function Home({
  postsPagination: { results, next_page },
  preview,
}: HomeProps) {
  const [posts, setPosts] = useState<Post[]>(results);
  const [nextpage, setNextPage] = useState<string | null>(next_page);

  const handleLoadPosts = async () => {
    const postResponse = await fetch(next_page).then(res => res.json());
    const results = parseData(postResponse);
    setPosts(posts => [...posts, ...results]);
    setNextPage(postResponse.next_page);
  };

  return (
    <>
      <Head>
        <title>Home | spacetravelling</title>
      </Head>
      <main className={`${commonStyles.container} ${styles.homeContainer}`}>
        {posts &&
          posts.map(result => (
            <Link key={result.uid} href={`/post/${result.uid}`}>
              <a>
                <h2>{result.data.title}</h2>
                <p>{result.data.subtitle}</p>
                <div>
                  <p>
                    <FaRegCalendar />{' '}
                    {format(
                      new Date(result.first_publication_date),
                      'dd MMM yyyy',
                      { locale: ptBR }
                    )}
                  </p>
                  <p>
                    <FaRegUser /> {result.data.author}
                  </p>
                </div>
              </a>
            </Link>
          ))}
        {nextpage && (
          <button type="button" onClick={handleLoadPosts}>
            Carregar mais posts
          </button>
        )}
        {preview && (
          <aside>
            <Link href="/api/exit-preview">
              <a>Sair do modo Preview</a>
            </Link>
          </aside>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    { pageSize: 2, ref: previewData?.ref ?? null }
  );

  const results = parseData(postsResponse);
  // infelizmente o teste força a passar a data não formatada :/

  return {
    props: {
      postsPagination: {
        results: results,
        next_page: postsResponse.next_page,
      },
      preview,
    },
    revalidate: 60 * 60 * 48,
  };
};
