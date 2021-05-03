import { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';
import Header from '../../components/Header';

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
  // console.log(post);
  const { isFallback } = useRouter();

  return (
    <>
      <Header />

      {isFallback ? (
        <h1>Carregando...</h1>
      ) : (
        <>
          <section className={styles.banner}>
            <img src={`${post.data.banner}`} alt="Banner" />
          </section>
          <main className={commonStyles.container}>
            <article className={styles.content}>
              <h1>{post.data.title}</h1>
              <div className={styles.headerInfo}>
                <span>
                  <FiCalendar />
                  <time>
                    {format(new Date(post.first_publication_date), 'PP', {
                      locale: ptBR,
                    })}
                  </time>
                </span>
                <span>
                  <FiUser />
                  <p>{post.data.author}</p>
                </span>
                <span>
                  <FiClock />
                  <p>4 min</p>
                </span>
              </div>
              <section className={styles.postContent}>
                {post.data.content.map(content => (
                  <div key={content.heading}>
                    <h2>{content.heading}</h2>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: RichText.asHtml(content.body),
                      }}
                    />
                  </div>
                ))}
              </section>
            </article>
          </main>
        </>
      )}
    </>
  );
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient();
  const postResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author'],
    }
  );

  const paths = postResponse.results.map(post => ({
    params: {
      slug: post.uid,
    },
  }));

  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps = async context => {
  const { slug } = context.params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    data: {
      author: response.data.author,
      title: response.data.title,
      subtitle: response.data.subtitle,
      content: response.data.content.map(item => ({
        heading: item.heading,
        body: [...item.body],
      })),
      banner: {
        url: response.data.banner.url ?? null,
      },
    },
    uid: response.uid,
    first_publication_date: response.first_publication_date,
  };
  // console.log(JSON.stringify(post, null, 2));

  return {
    props: {
      post,
    },
  };

  // TODO
};
