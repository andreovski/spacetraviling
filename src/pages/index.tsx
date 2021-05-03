import { GetStaticProps } from 'next';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import Link from 'next/link';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../services/prismic';

import { FiCalendar, FiUser } from 'react-icons/fi';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { RichText } from 'prismic-dom';
import { useState } from 'react';
import Header from '../components/Header';

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
}

export default function Home({ postsPagination }: HomeProps) {
  const { results, next_page } = postsPagination;
  const [posts, setPosts] = useState(results);

  // function handleUpdatePosts() {}

  return (
    <>
      <Head>
        <title>Spacetraveling.</title>
      </Head>

      <Header />

      <main className={commonStyles.container}>
        <div className={styles.posts}>
          {posts.map(post => (
            <section key={post.uid}>
              <h1>
                <Link href={`/post/${post.uid}`}>
                  <a href="#">{post.data.title}</a>
                </Link>
              </h1>
              <p>{post.data.subtitle}</p>
              <footer>
                <time>
                  <FiCalendar />
                  {format(new Date(post.first_publication_date), 'PP', {
                    locale: ptBR,
                  })}
                </time>
                <span>
                  <FiUser />
                  {post.data.author}
                </span>
              </footer>
            </section>
          ))}

          <span
            className={`${next_page ? styles.morePostsButton : styles.noPosts}`}
          >
            {postsPagination.next_page && (
              <button
                type="button"
                onClick={async () => {
                  const response = await fetch(postsPagination.next_page);

                  const { results } = await response.json();

                  const newPostsArray = [...posts, results].flat();

                  setPosts(newPostsArray);
                }}
              >
                Carregar mais posts
              </button>
            )}
          </span>
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author'],
      pageSize: 2,
    }
  );

  const next_page = postsResponse.next_page;
  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  // console.log(postPagination);

  return {
    props: {
      postsPagination: {
        results,
        next_page,
      },
    },
  };
};
