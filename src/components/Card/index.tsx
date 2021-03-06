import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Video from '../Video'
import { AiOutlineMore, AiOutlineLike, AiOutlineMessage, AiOutlineDislike } from "react-icons/ai"
import { IoPaperPlaneOutline, IoBookmarkOutline, IoBookmark } from "react-icons/io5"
import dayjs from 'dayjs'
import { Post } from '../../utils/types/post'
import DropdownMenu from '../DropdownMenu'
import Modal from "@/components/Modal"
import Comment from "@/components/Comment"
import CommentInput from '../CommentInput'
import { Session } from '@/utils/types/session'
import ConfirmModal from '../ConfirmModal'
import ExpandText from '../ExpandText'
import { useRouter } from 'next/router'

var relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime)

interface Props {
    post: Post,
    session?: Session
    handleDelete?: (id: number) => void,
    option?: number,
    disablePostClick?: boolean
    disableComment?: boolean,
    newCommentCount?: number,
    setParentComments?: any
    parentComments?: any[]
}

const Card = (props: Props) => {
    const router = useRouter()
    const [ isOpen, setIsOpen ] = useState(false)
    const [ isLiked, setIsLiked ] = useState(props.option === 1 ? true : props.post.likedBy?.some(user => user.username === props.session?.user.name))
    const [ likes, setLikes ] = useState(props.post._count?.likedBy || 0)
    const [ isSaved, setIsSaved ] = useState(props.option === 3 ? true : props.post.savedBy?.some(user => user.username === props.session?.user.name))
    const [ comments, setComments ] = useState(props.parentComments || null)
    const [ commentCount, setCommentCount ] = useState(props.newCommentCount || props.post._count?.comments || 0)
    const [ parentComment, setParentComment ] = useState('')
    const [ confirmDelete, setConfirmDelete ] = useState(false)

    const handleEdit = () => {
        router.push(`/upload?edit=${props.post.id}`)
    }

    const handleLike = async(id: number) => {

        if(props.session){ 
            fetch(`/api/like/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    'name': props.session?.user.name
                })
            })
            .then(res =>{
                let abc: number = likes + 1
                setIsLiked(true)
                setLikes(abc)
            }
            )
        }
    }

    const handleDislike = async(id: number) => {

        if(props.session){
            fetch(`/api/like/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    'name': props.session?.user.name
                })
            })
            .then(res =>{
                let abc: number = likes - 1
                setIsLiked(false)
                setLikes(abc)
            }
            )
        }   
    }

    const handleSave = async(id: number) => {
        if(props.session){ 
            fetch(`/api/save/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    'name': props.session?.user.name
                })
            })
            .then(res =>{
                setIsSaved(true)
            }
            )
        }
    }

    const handleUnSave = async(id: number) => {

        if(props.session){ 
            fetch(`/api/save/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    'name': props.session?.user.name
                })
            })
            .then(res =>{
                setIsSaved(false)
            }
            )
        }
    }

    useEffect(() => {
        if(isOpen){
            fetch(`/api/comment/${props.post.id}`)
            .then(async (res) =>{
                let json = await res.json();
                            return json
            })
            .then(result =>{
                const response = JSON.parse(result.data)
                setComments(response)
                setCommentCount(response.length)
            })
        }
    }, [isOpen])

    useEffect(() => {
        const dateRightNow = new Date(Date.now())
        const newComment={
            content: parentComment,
            date: dateRightNow.toISOString(),
            author: {
                username: props.session?.user.name,
                profileImage: props.session?.user.profileImage,
                user:{
                    image: props.session?.user.image
                }
            }
        }

        if(parentComment){
            setComments([newComment, ...comments])
            props.setParentComments && props.setParentComments([newComment, ...comments])
            setCommentCount(1+ commentCount)
        }
    }, [parentComment])

    const postOptions =[
        {
            name: 'Edit',
            function: handleEdit
        },
        {
            name: 'Delete',
            function: () => setConfirmDelete(true)
        },
    ]

    const postBody =    <div className="my-2 mx-2 lg:mx-6 cursor-pointer h-auto">
                            <h1 className='text-white font-semibold text-xl'>{props.post.title}</h1>
                            <ExpandText maxHeight={25} className='text-gray-500'>{props.post.description}</ExpandText>
                            <div className='flex flex-row justify-between text-sm py-2'>
                                <div className="flex flex-row space-x-2 text-white items-center">
                                    <AiOutlineLike className="text-btnBlue h-4 w-4"/>
                                    <p>{likes}</p>
                                </div>
                                <div className="flex flex-row space-x-4 text-white items-center">
                                    <div className="flex flex-row space-x-2 text-white items-center">
                                        <p>{props.post.viewsCount || 0}</p>
                                        <p>Views</p>
                                    </div>
                                    <div className="flex flex-row space-x-2 text-white items-center">
                                        <p>{commentCount || 0}</p>
                                        <p>Comments</p>
                                    </div>
                                    <div className="flex flex-row space-x-2 text-white items-center">
                                        <p>{props.post.sharesCount || 0}</p>
                                        <p>Shares</p>
                                    </div>
                                </div>
                            </div>
                        </div>

    return (
        <div className="py-4 drop-shadow-lg max-w-768">
            <div className="flex flex-row my-2 items-center relative">
                <div className="bg-btnBlue h-10 w-10 border-2 border-borderBlue rounded-full">    
                    <Image 
                        src={`${props.post.author?.profileImage || props.post.author?.user?.image || "/assets/user.png"}`} 
                        height="36" 
                        width="36" 
                        className="rounded-full" 
                        alt="user" 
                    />
                </div>
                <div className="h-10 pl-1 pt-1 w-10 border-2 border-borderBlue rounded-full -ml-3 z-10 bg-bgBlue-200">    
                    <Image 
                        src={`${props.post.game?.logoImage ? props.post.game.logoImage : "/assets/game.png"}`} 
                        height="28" 
                        width="28" 
                        className="rounded-full" 
                        alt="game" 
                    />
                </div>
                <div className='flex flex-col text-white ml-4'>
                    <p className='text-sm cursor-pointer'>   
                        <Link href={`/user/${props.post.author?.username}`}>
                            <span className='border-b border-white border-opacity-0 hover:border-opacity-100'>
                                {props.post.author?.username}
                            </span>
                        </Link>
                        <span className="text-gray-500 cursor-default"> in </span >
                        <Link href={`/game/${props.post.game?.name}`}>
                            <span className='border-b border-white border-opacity-0 hover:border-opacity-100'>
                                {props.post.game?.name}
                            </span>
                        </Link>
                    </p>
                    <p className="text-gray-500 text-xs">{dayjs().to(dayjs(props.post.createdAt))}</p>
                </div>
                {props.post.author?.username === props.session?.user.name && props.handleDelete &&
                    <DropdownMenu 
                        className='absolute right-0 mr-2' 
                        options={postOptions} 
                        id={props.post.id}
                    >
                        <AiOutlineMore className="text-gray-500 cursor-pointer"/>
                    </DropdownMenu>
                }
            </div>
            <div className='card-body'>  
                <Video src={props.post.url} />
                { props.disablePostClick ? 
                    (
                        <div>
                            {postBody}
                        </div>
                    ) : (
                        <Link href={`/post/${props.post.id}`}>
                            {postBody}
                        </Link>
                    )

                }
                <div className="card-footer p-4">
                    <div className="flex flex-row justify-between lg:justify-evenly text-white text-sm">
                        {props.session ? 
                            isLiked ? 
                                <div className="flex flex-row items-center space-x-2 cursor-pointer" onClick={() => handleDislike(props.post.id)}>
                                    <AiOutlineDislike className="h-4 w-4" />
                                    <p>Dislike</p>
                                </div>
                                :
                                
                                <div className="flex flex-row items-center space-x-2 cursor-pointer" onClick={() => handleLike(props.post.id)}>
                                    <AiOutlineLike className="h-4 w-4"/>
                                    <p>Like</p>
                                </div>
                        : 
                            <div className="flex flex-row items-center space-x-2 cursor-pointer">
                                <AiOutlineLike className="h-4 w-4"/>
                                <p>Like</p>
                            </div>
                        }
                        {props.disableComment || !props.session ? 
                            <div className="flex flex-row items-center space-x-2 cursor-pointer">
                                <AiOutlineMessage className="h-4 w-4"/>
                                <p>Comment</p>
                            </div>
                        :
                            <div className="flex flex-row items-center space-x-2 cursor-pointer" onClick={() => setIsOpen(true)}>
                                <AiOutlineMessage className="h-4 w-4"/>
                                <p>Comment</p>
                            </div>
                        }
                        <div className="flex flex-row items-center space-x-2 cursor-pointer">
                            <IoPaperPlaneOutline className="h-4 w-4"/>
                            <p>Share</p>
                        </div>
                        {props.session ? 
                            isSaved ? 
                                <div className="flex flex-row items-center space-x-2 cursor-pointer" onClick={() => handleUnSave(props.post.id)}>
                                    <IoBookmark className="h-4 w-4" />
                                    <p>Unsave</p>
                                </div>
                                :
                                <div className="flex flex-row items-center space-x-2 cursor-pointer" onClick={() => handleSave(props.post.id)}>
                                    <IoBookmarkOutline className="h-4 w-4" />
                                    <p>Save</p>
                                </div>
                        : 
                                <div className="flex flex-row items-center space-x-2 cursor-pointer">
                                    <IoBookmarkOutline className="h-4 w-4"/>
                                    <p>Save</p>
                                </div>
                        }
                    </div>
                </div>
            </div>
            {props.disableComment && props.session &&
                <>
                    <br />
                    <CommentInput 
                        id={props.post.id} 
                        username={props.session?.user.name} 
                        setParentComment={setParentComment} 
                    />
                </>
            }
            {props.post.comment && 
                <Comment 
                    comment={props.post.comment.content} 
                    date={props.post.comment.createdAt} 
                    username={props.post.comment.author?.username} 
                    image={props.post.comment.author?.profileImage || props.post.comment.author?.user?.image} 
                    className="max-w-xs sm:max-w-md md:max-w-lg lg:max-w-md" 
                />
            }
            <Modal 
                isOpen={isOpen} 
                setIsOpen={setIsOpen} 
                title='Comments'
            >
                {props.session &&
                    <CommentInput 
                        id={props.post.id} 
                        username={props.session?.user.name} 
                        setParentComment={setParentComment} 
                    />
                }
                <div className='overflow-y-auto mt-4 max-h-96'>
                    {comments && comments.map((comment, key) => {
                        return(
                        <div key={key} className=''>
                            <Comment 
                                comment={comment.content} 
                                date={comment.createdAt} 
                                username={comment.author.username} 
                                image={comment.author.profileImage || comment.author.user.image} 
                            />
                            <hr className='border border-solid border-bgBlue-200 my-1'/>
                        </div>)
                    })}
                </div>
            </Modal>
            {props.handleDelete && 
                <ConfirmModal
                    isOpen={confirmDelete} 
                    setIsOpen={setConfirmDelete} 
                    onClick={() => {
                        props.handleDelete(props.post.id)
                        setConfirmDelete(false)
                    }}
                >
                    Are you sure you want to delete this clip?
                </ConfirmModal>
            }
        </div>
    )
}

export default Card