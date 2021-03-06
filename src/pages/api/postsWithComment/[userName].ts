import { NextApiRequest, NextApiResponse } from "next";
import nc from 'next-connect';

//utils
import { prisma } from "../../../../lib/prisma";

const apiRoute = nc<NextApiRequest, NextApiResponse>({

    onError: (err, req, res, next) => {
        console.error(err.stack);
        res.status(500).end("Something broke!");
      },
    
      // Handle any other HTTP method
      onNoMatch: (req, res, next) => {
        res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
      },
  
})
.get( async(req, res) => {

  const { username } = req.query;

  const user = await prisma.userProfile.findUnique({
      select:{
          id: true
      },
      where: {
          username: username
      }
  })

  const id = user?.id

  if(id){
      
    const posts = await prisma.comment.findMany({
        select:{
            content: true,
            authorId: true,
            createdAt: true,
            author: {
                select:{
                    username: true,
                    profileImage: true,
                    user:{
                        select:{
                            image: true
                        }
                    }
                }
            },
            postId: true,
            post:{
                select:{
                    id: true,
                    createdAt: true,
                    updatedAt: true,
                    title: true,
                    description: true,
                    url: true,
                    publicId: true,
                    gameId: true,
                    authorId: true,
                    author: {
                        select: {
                        username: true,
                        profileImage: true,
                        user:{
                            select:{
                                image: true
                            }
                        }
                        }
                    },
                    game:{
                        select:{
                            id: true,
                            name: true,
                            logoImage: true
                        }
                    },
                    likedBy:{
                        select: {
                        username: true
                        }
                    },
                    savedBy:{
                        select: {
                        username: true
                        }
                    },
                    _count: {
                        select:{
                        likedBy: true,
                        comments: true
                        }
                    },
                }
            }
        },
        where:{
            authorId: id
        }
    })

    let newArr: any[] = []

    if(posts){
        posts.forEach((post) => {
            let demoObj = {
                id: 0,
                createdAt: '',
                updatedAt: '',
                title: '',
                description: '',
                url: '',
                publicId: '',
                gameId: 0,
                authorId: 0,
                author:{
                    username: '',
                    profileImage: '',
                    user:{
                        image: ''
                    }
                },
                game: {
                    name: '',
                    logoImage: ''
                },
                likedBy: [],
                savedBy: [],
                _count: {
                    likedBy: 0,
                    comments: 0
                },
                comment: {
                    content: '',
                    authorId: 0,
                    createdAt: '',
                    author: {
                        username: '',
                        profileImage: '',
                        user:{
                            image: ''
                        }
                    },
                    postId: 0
                }
            }

            demoObj.id = post.post.id
            demoObj.createdAt = post.post.createdAt,
            demoObj.updatedAt = post.post.updatedAt,
            demoObj.title = post.post.title,
            demoObj.description = post.post.description,
            demoObj.url = post.post.url,
            demoObj.publicId = post.post.publicId,
            demoObj.gameId = post.post.gameId,
            demoObj.authorId = post.post.authorId,
            demoObj.author.username = post.post.author.username,
            demoObj.author.user.image = post.post.author.user.image,
            demoObj.author.profileImage = post.post.author.profileImage,
            demoObj.game.name = post.post.game.name,
            demoObj.game.logoImage = post.post.game.logoImage,
            demoObj.likedBy = post.post.likedBy,
            demoObj.savedBy = post.post.savedBy,
            demoObj._count.likedBy = post.post._count.likedBy,
            demoObj._count.comments = post.post._count.comments,
            demoObj.comment.content = post.content,
            demoObj.comment.authorId = post.authorId,
            demoObj.comment.postId = post.postId,
            demoObj.comment.author.username = post.author.username,
            demoObj.comment.author.user.image = post.author.user.image,
            demoObj.comment.author.profileImage = post.author.profileImage,
            demoObj.comment.createdAt = post.createdAt

            newArr.push(demoObj)
        })
    }

    const result= JSON.stringify(newArr)

    res.send({data: result})

  } else {
    res.status(500).end("user not found")
  }
})

export default apiRoute;