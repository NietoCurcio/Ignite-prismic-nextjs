import { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

import { format, getHours, getMinutes } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FaRegClock } from 'react-icons/fa';
import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';
import React from 'react';
import Utteranc from '../../components/Utteranc';
import Link from 'next/link';

interface Post {
  last_publication_date: string | null;
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  preview: boolean;
  prev: any;
  next: any;
}

export default function Post({ post, preview, prev, next }: PostProps) {
  const router = useRouter();

  return (
    <main className={styles.container}>
      {router.isFallback ? (
        <h2>Carregando...</h2>
      ) : (
        <>
          <img src={post.data.banner.url} alt={post.data.title} />
          <article className={`${commonStyles.container} ${styles.article}`}>
            <h1>{post.data.title}</h1>
            <div>
              <div>
                <p>
                  {format(
                    new Date(post.first_publication_date),
                    'dd MMM yyyy',
                    {
                      locale: ptBR,
                    }
                  )}
                </p>
                <p>{post.data.author}</p>
                <p>
                  <FaRegClock />{' '}
                  {Math.ceil(
                    post.data.content.reduce((total, content) => {
                      total += content.body.reduce(
                        (total, paragraph) =>
                          (total += paragraph.text.match(/\S+\s*/g).length),
                        0
                      );
                      return total;
                    }, 0) / 200
                  )}{' '}
                  {/* count the number of words in post and divide by 200 */}
                  min
                </p>
              </div>
              <p>
                * editado{' '}
                {format(new Date(post.last_publication_date), 'dd MMM yyyy', {
                  locale: ptBR,
                })}
                , às{' '}
                {format(new Date(post.last_publication_date), 'HH:mm', {
                  locale: ptBR,
                })}
              </p>
            </div>
            <div className={styles.content}>
              {post.data.content.map(content => (
                <React.Fragment key={content.heading}>
                  <h2>{content.heading}</h2>
                  {content.body.map((paragraph, idx) => (
                    <React.Fragment key={idx}>
                      <p>{paragraph.text}</p>
                      <br />
                    </React.Fragment>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </article>
          <footer className={`${commonStyles.container} ${styles.footer}`}>
            <div>
              {prev && (
                <div>
                  <h3>{prev.data.title}</h3>
                  <Link href={`/post/${prev.uid}`}>
                    <a>Post anterior</a>
                  </Link>
                </div>
              )}
              {next && (
                <div>
                  <h3>{next.data.title}</h3>
                  <Link href={`/post/${next.uid}`}>
                    <a>Próximo post</a>
                  </Link>
                </div>
              )}
            </div>
            <div className={styles.comments}>
              <Utteranc />
            </div>
            {preview && (
              <aside>
                <Link href="/api/exit-preview">
                  <a>Sair do modo Preview</a>
                </Link>
              </aside>
            )}
          </footer>
        </>
      )}
    </main>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const response = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    { fetch: 'posts.uid' }
  );
  const slugs = response.results.map(post => ({ params: { slug: post.uid } }));
  return {
    paths: slugs,
    fallback: true,
    // o teste força a passar fallback true e fazer a aplicação ter um estado de "laoding"
    // enquanto renderiza a pagina que nao foi gerada estaticamente
  };
};

export const getStaticProps: GetStaticProps<PostProps> = async ({
  params: { slug },
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref ?? null,
  });

  const next = await prismic.queryFirst(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      after: response.id,
      orderings: '[document.first_publication_date]',
    }
  );

  const prev = await prismic.queryFirst(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      after: response.id,
      orderings: '[document.first_publication_date desc]',
    }
  );

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: {
      subtitle: response.data.subtitle,
      title: response.data.title,
      author: response.data.author,
      banner: { url: response.data.banner.url },
      content: response.data.content.map(content => ({
        heading: content.heading,
        body: content.body,
      })),
    },
  };

  return {
    props: { post, preview, prev: prev ?? null, next: next ?? null },
    revalidate: 60 * 60 * 48,
  };
};
