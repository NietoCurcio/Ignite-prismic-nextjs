import { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FaRegClock } from 'react-icons/fa';
import Prismic from '@prismicio/client';

interface Post {
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
}

export default function Post({ post }: PostProps) {
  return (
    <main className={styles.container}>
      <img src={post.data.banner.url} alt={post.data.title} />
      <article className={`${commonStyles.container} ${styles.article}`}>
        <h1>{post.data.title}</h1>
        <div>
          <p>{post.first_publication_date}</p>
          <p>{post.data.author}</p>
          <p>
            <FaRegClock /> 4 min
          </p>
        </div>
        <div className={styles.content}>
          {post.data.content.map(content => (
            <>
              <h2>{content.heading}</h2>
              {content.body.map(paragraph => (
                <>
                  <p>{paragraph}</p>
                  <br />
                </>
              ))}
            </>
          ))}
        </div>
      </article>
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
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params: { slug } }) => {
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', slug.toString(), {});

  const post = {
    first_publication_date: format(
      new Date(response.first_publication_date),
      'dd MMM yyyy',
      { locale: ptBR }
    ),
    data: {
      title: response.data.title,
      author: response.data.author,
      banner: { url: response.data.banner.url },
      content: response.data.content.map(content => ({
        heading: content.heading,
        body: content.body.map(paragraph => paragraph.text),
      })),
    },
  };

  return {
    props: { post },
    revalidate: 60 * 60 * 48,
  };
};
