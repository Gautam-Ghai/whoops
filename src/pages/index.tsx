import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router';
import { prisma } from "../../lib/prisma";
import Navbar from '@/components/Navbar'
import Profile from '@/components/Profile'
import Main from '@/components/Main'
import Footer from '@/components/Footer'
import { Post } from '@/utils/types/post'
import { Session } from "@/utils/types/session";
import Layout from '@/components/Layout';

import { getSession, signIn, signOut } from "next-auth/react"

import Sidebar from '@/components/Sidebar';
interface Props {
    posts: Post[],
    user: any,
    session: Session
} 

const Home = (props: Props) => {
  const router = useRouter();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [theData, setTheData] = useState(props.posts);

  const refreshData = () => {
    router.replace(router.asPath);
    setIsRefreshing(true);
  };

  useEffect(() => {
    setIsRefreshing(false);
  }, [theData]);

  return (
    <Layout>
      <div className='mb-6'>
        <div className='flex flex-row md:space-x-8 lg:space-x-16 mt-8 md:mx-8'>
          <div>
            {props.session ?
              <Profile user={props.user}/> 
              :
              <Sidebar />
            }
          </div>
          <Main posts={props.posts} loggedinUser={props.session?.user} refreshData={refreshData}/>
        </div>
      </div>
    </Layout>
  )
}

export default Home;

export const getServerSideProps = async ({ req }) => {
  try{
    const session = await getSession({ req })

    var posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    posts = JSON.parse(JSON.stringify(posts))

    var user: any

    if(session){
      console.log('session in home', session)
      const userProfile: any = session.user
      user = await prisma.user.findUnique({
        where: {
          name: userProfile.name
        }
      })

      if(user){
        user = JSON.parse(JSON.stringify(user))
      }
    } else {
      user = {error: "Some error"}
    }

    return {
      props: {
        posts,
        user,
        session
      }
    }
  } catch(err){
    console.log('Error', err)
    return {
      props: {
        posts: []
      }
    }
  }
}