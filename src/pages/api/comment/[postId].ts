import { NextApiRequest, NextApiResponse } from "next";
import nc from 'next-connect';
import { IncomingForm } from 'formidable';

//Utils
import { prisma } from "../../../../lib/prisma";

//Queries
import { getAllComments } from "@/queries/Comment";

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
.get(async( req, res ) => {
    const { postId } = req.query;
    const id = parseInt(postId);

    const result = await getAllComments(id);

    const data  = JSON.stringify(result)

    if(result) res.send({data: data})
    else res.send({data: null})

})
.post(async( req, res ) => {

  const { postId } = req.query;
  const id = parseInt(postId);

    const data = await new Promise((resolve, reject) => {
        const form = new IncomingForm();

        form.parse(req, (err, fields, files) => {
            if (err) return reject(err);
            resolve({ fields, files });
        });
    });

    if(data?.fields?.comment.length === 0){
        res.status(500).json({ error: `comment can not be empty` });
    }

    const user = {
        connect: {
            username: data?.fields?.name
        }
    }

    const post = {
        connect: {
            id: id
        }
    }

    const result = await prisma.comment.create({
        data: {
            content: data?.fields?.comment,
            author: user,
            post: post
        }
    })
    if(result){
        console.log(result)
        res.send(result)
    }
        
})


export const config = {
    api: {
        bodyParser: false,
    },
}

export default apiRoute;